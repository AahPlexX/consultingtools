const LANCZOS_G = 7;
const LANCZOS_COEFFICIENTS = [
  0.9999999999998099,
  676.5203681218851,
  -1259.1392167224028,
  771.3234287776531,
  -176.6150291621406,
  12.507343278686905,
  -0.13857109526572012,
  9.984369578019572e-6,
  1.5056327351493116e-7,
] as const;

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite number greater than zero.`);
  }
}

function logGamma(value: number): number {
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  const shifted = value - 1;
  let series = LANCZOS_COEFFICIENTS[0];
  for (let index = 1; index < LANCZOS_COEFFICIENTS.length; index += 1) {
    series += (LANCZOS_COEFFICIENTS[index] as number) / (shifted + index);
  }
  const t = shifted + LANCZOS_G + 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (shifted + 0.5) * Math.log(t) -
    t +
    Math.log(series)
  );
}

function betaContinuedFraction(x: number, a: number, b: number): number {
  const maxIterations = 300;
  const epsilon = 3e-14;
  const fpMin = 1e-300;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpMin) d = fpMin;
  d = 1 / d;
  let h = d;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const twice = 2 * iteration;
    let aa = (iteration * (b - iteration) * x) / ((qam + twice) * (a + twice));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    h *= d * c;

    aa = -((a + iteration) * (qab + iteration) * x) / ((a + twice) * (qap + twice));
    d = 1 + aa * d;
    if (Math.abs(d) < fpMin) d = fpMin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpMin) c = fpMin;
    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) <= epsilon) return h;
  }

  throw new Error("Regularized incomplete beta calculation did not converge.");
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (!Number.isFinite(x) || x < 0 || x > 1) {
    throw new Error("Incomplete-beta x must be finite and within [0, 1].");
  }
  assertPositiveFinite(a, "a");
  assertPositiveFinite(b, "b");
  if (x === 0) return 0;
  if (x === 1) return 1;

  const logTerm =
    logGamma(a + b) -
    logGamma(a) -
    logGamma(b) +
    a * Math.log(x) +
    b * Math.log1p(-x);
  const front = Math.exp(logTerm);

  const result =
    x < (a + 1) / (a + b + 2)
      ? (front * betaContinuedFraction(x, a, b)) / a
      : 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;

  if (!Number.isFinite(result)) {
    throw new Error("Regularized incomplete beta result must remain finite.");
  }
  return Math.max(0, Math.min(1, result));
}

export function studentTCdf(t: number, degreesOfFreedom: number): number {
  if (!Number.isFinite(t)) {
    if (t === Number.NEGATIVE_INFINITY) return 0;
    if (t === Number.POSITIVE_INFINITY) return 1;
    throw new Error("t must be finite or an infinity endpoint.");
  }
  assertPositiveFinite(degreesOfFreedom, "degreesOfFreedom");
  if (t === 0) return 0.5;

  const x = degreesOfFreedom / (degreesOfFreedom + t * t);
  const beta = regularizedIncompleteBeta(x, degreesOfFreedom / 2, 0.5);
  return t > 0 ? 1 - beta / 2 : beta / 2;
}

export function studentTQuantile(probability: number, degreesOfFreedom: number): number {
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) {
    throw new Error("probability must be finite and strictly between 0 and 1.");
  }
  assertPositiveFinite(degreesOfFreedom, "degreesOfFreedom");
  if (probability === 0.5) return 0;
  if (probability < 0.5) return -studentTQuantile(1 - probability, degreesOfFreedom);

  let lower = 0;
  let upper = 1;
  while (studentTCdf(upper, degreesOfFreedom) < probability) {
    upper *= 2;
    if (upper > 1e12) {
      throw new Error("Student t quantile search exceeded the supported finite domain.");
    }
  }

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const middle = lower + (upper - lower) / 2;
    const cdf = studentTCdf(middle, degreesOfFreedom);
    if (Math.abs(cdf - probability) <= 1e-14) return middle;
    if (cdf < probability) lower = middle;
    else upper = middle;
  }
  return lower + (upper - lower) / 2;
}
