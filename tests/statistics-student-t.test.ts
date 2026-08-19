import { describe, expect, it } from "vitest";
import { studentTCdf, studentTQuantile } from "../src/statistics/student-t.js";

describe("Student t distribution", () => {
  it("has CDF 0.5 at zero", () => {
    expect(studentTCdf(0, 9)).toBe(0.5);
  });

  it("matches the documented 97.5th percentile for 9 degrees of freedom", () => {
    const critical = studentTQuantile(0.975, 9);
    expect(critical).toBeCloseTo(2.2621571628, 8);
    expect(studentTCdf(critical, 9)).toBeCloseTo(0.975, 10);
  });

  it("respects distribution symmetry", () => {
    const positive = studentTCdf(1.5, 12);
    expect(studentTCdf(-1.5, 12)).toBeCloseTo(1 - positive, 12);
  });

  it("rejects invalid probabilities and degrees of freedom", () => {
    expect(() => studentTQuantile(0, 9)).toThrow(/probability/i);
    expect(() => studentTQuantile(1, 9)).toThrow(/probability/i);
    expect(() => studentTCdf(1, 0)).toThrow(/degreesOfFreedom/i);
  });
});
