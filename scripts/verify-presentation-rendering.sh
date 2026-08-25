#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-}"
if [[ -z "$output_dir" ]]; then
  echo "Usage: bash scripts/verify-presentation-rendering.sh <output-dir>" >&2
  exit 2
fi

manifest="$output_dir/presentation-render-manifest.json"
pptx="$output_dir/consulting-presentation.pptx"
render_dir="$output_dir/rendered"
mkdir -p "$render_dir"

[[ -s "$manifest" ]] || { echo "Missing presentation render manifest." >&2; exit 1; }
[[ -s "$pptx" ]] || { echo "Missing generated PPTX fixture." >&2; exit 1; }

mapfile -t svg_files < <(node -e 'const fs=require("fs"); const m=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); for (const f of m.svgFiles) console.log(f);' "$manifest")
expected_slides="$(node -e 'const fs=require("fs"); const m=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(String(m.expectedSlideCount));' "$manifest")"

[[ "$expected_slides" =~ ^[1-9][0-9]*$ ]] || { echo "Manifest expectedSlideCount must be positive." >&2; exit 1; }
[[ ${#svg_files[@]} -gt 0 ]] || { echo "Manifest must list at least one SVG fixture." >&2; exit 1; }

for file in "${svg_files[@]}"; do
  svg="$output_dir/$file"
  [[ -s "$svg" ]] || { echo "Missing SVG fixture: $file" >&2; exit 1; }

  if grep -Eiq '<script|<foreignObject|[[:space:]]on[a-zA-Z]+[[:space:]]*=' "$svg"; then
    echo "SVG contains prohibited active content: $file" >&2
    exit 1
  fi
  if grep -Eiq '(xlink:href|href)[[:space:]]*=[[:space:]]*["'"'](https?:|//|data:)' "$svg"; then
    echo "SVG contains prohibited external or embedded-resource reference: $file" >&2
    exit 1
  fi

  png="$render_dir/${file%.svg}.png"
  rsvg-convert "$svg" -o "$png"
  [[ -s "$png" ]] || { echo "librsvg produced an empty PNG for $file" >&2; exit 1; }
done

soffice --headless --convert-to pdf:impress_pdf_Export --outdir "$render_dir" "$pptx" >/tmp/consultingtools-pptx-render.log 2>&1 || {
  cat /tmp/consultingtools-pptx-render.log >&2
  exit 1
}

rendered_pdf="$render_dir/consulting-presentation.pdf"
[[ -s "$rendered_pdf" ]] || { cat /tmp/consultingtools-pptx-render.log >&2; echo "LibreOffice did not create the expected presentation PDF." >&2; exit 1; }

pdfinfo "$rendered_pdf" > "$render_dir/presentation-pdfinfo.txt"
actual_pages="$(awk -F: '/^Pages:/ { gsub(/[[:space:]]/, "", $2); print $2 }' "$render_dir/presentation-pdfinfo.txt")"
[[ "$actual_pages" == "$expected_slides" ]] || {
  echo "Rendered PPTX page count $actual_pages did not match expected slide count $expected_slides." >&2
  exit 1
}

pdftoppm -png -f 1 -singlefile "$rendered_pdf" "$render_dir/presentation-first" >/dev/null 2>&1
pdftoppm -png -f "$actual_pages" -singlefile "$rendered_pdf" "$render_dir/presentation-last" >/dev/null 2>&1
[[ -s "$render_dir/presentation-first.png" ]] || { echo "First PPTX page raster is empty." >&2; exit 1; }
[[ -s "$render_dir/presentation-last.png" ]] || { echo "Last PPTX page raster is empty." >&2; exit 1; }

echo "Independent SVG and PPTX rendering validation passed: ${#svg_files[@]} SVG fixture(s), $actual_pages slide page(s)."
