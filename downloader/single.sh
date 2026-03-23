#!/bin/bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: bash single.sh <YouTube URL>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Downloading: $1 ==="
yt-dlp \
  -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]" \
  --merge-output-format mp4 \
  --embed-metadata \
  --embed-thumbnail \
  --write-info-json \
  -o "%(id)s.mp4" \
  "$1"

echo "=== Uploading to R2 ==="
node --env-file=.env src/upload-to-r2.ts

echo "=== Done ==="
