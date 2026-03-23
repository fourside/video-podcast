#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Channel/playlist URLs
URLS=(
  # "https://www.youtube.com/@CHANNEL_NAME/videos"
)

if [ ${#URLS[@]} -eq 0 ]; then
  echo "No URLs configured. Edit sync.sh to add channel/playlist URLs."
  exit 1
fi

for url in "${URLS[@]}"; do
  echo "=== Downloading from: $url ==="
  yt-dlp \
    -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]" \
    --merge-output-format mp4 \
    --embed-metadata \
    --embed-thumbnail \
    --write-info-json \
    -o "%(id)s.mp4" \
    --download-archive downloaded.txt \
    --no-progress \
    "$url" || true
done

echo "=== Uploading to R2 ==="
node --env-file=.env src/upload-to-r2.ts

echo "=== Done ==="
