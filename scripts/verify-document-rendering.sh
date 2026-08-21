#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/verify-document-rendering.sh <fixture-dir>" >&2
  exit 2
fi

fixture_dir="$(realpath "$1")"
docx="$fixture_dir/consulting-report.docx"
native_pdf="$fixture_dir/consulting-report.pdf"
render_dir="$fixture_dir/rendered"
profile_dir="$fixture_dir/lo-profile"
mkdir -p "$render_dir" "$profile_dir"

[[ -s "$docx" ]] || { echo "DOCX fixture is missing or empty." >&2; exit 1; }
[[ -s "$native_pdf" ]] || { echo "Native PDF fixture is missing or empty." >&2; exit 1; }

soffice \
  -env:UserInstallation="file://$profile_dir" \
  --headless \
  --convert-to pdf:writer_pdf_Export \
  --outdir "$render_dir" \
  "$docx"

converted_pdf="$render_dir/consulting-report.pdf"
[[ -s "$converted_pdf" ]] || { echo "LibreOffice did not produce a non-empty PDF." >&2; exit 1; }

validate_pdf() {
  local pdf="$1"
  local label="$2"
  local info="$render_dir/${label}.pdfinfo.txt"
  pdfinfo "$pdf" > "$info"
  local pages
  pages="$(awk '/^Pages:/ {print $2; exit}' "$info")"
  [[ "$pages" =~ ^[1-9][0-9]*$ ]] || { echo "$label PDF page count is invalid: $pages" >&2; exit 1; }

  pdftoppm -png -f 1 -l 1 -singlefile "$pdf" "$render_dir/${label}-first" >/dev/null
  [[ -s "$render_dir/${label}-first.png" ]] || { echo "$label first-page raster is missing or empty." >&2; exit 1; }

  pdftoppm -png -f "$pages" -l "$pages" -singlefile "$pdf" "$render_dir/${label}-last" >/dev/null
  [[ -s "$render_dir/${label}-last.png" ]] || { echo "$label last-page raster is missing or empty." >&2; exit 1; }
}

validate_pdf "$converted_pdf" "docx-converted"
validate_pdf "$native_pdf" "native"

echo "Independent DOCX/PDF rendering validation passed."
