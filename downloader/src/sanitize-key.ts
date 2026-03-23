export function sanitizeKey(channel: string, title: string): string {
  const sanitized = `${sanitizePart(channel)}_${sanitizePart(title)}`;
  const truncated = sanitized.slice(0, 200);
  return `${truncated}.mp4`;
}

function sanitizePart(input: string): string {
  return (
    input
      .trim()
      // whitespace (including fullwidth space) to hyphen
      .replace(/[\s\u3000]+/g, "-")
      // keep letters (including CJK), numbers, hyphens
      .replace(/[^\p{L}\p{N}-]/gu, "")
      // collapse consecutive hyphens
      .replace(/-{2,}/g, "-")
      // trim leading/trailing hyphens
      .replace(/^-|-$/g, "")
  );
}
