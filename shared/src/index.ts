import * as v from "valibot";

export const EpisodeMetadataSchema = v.object({
  title: v.string(),
  published_at: v.string(),
  duration: v.string(),
  channel: v.string(),
  thumbnail_url: v.string(),
  video_id: v.string(),
  filesize: v.string(),
});

export type EpisodeMetadata = v.InferOutput<typeof EpisodeMetadataSchema>;

export function parseEpisodeMetadata(
  input: unknown,
): EpisodeMetadata | undefined {
  const result = v.safeParse(EpisodeMetadataSchema, input);
  return result.success ? result.output : undefined;
}

export function encodeMetadata(
  metadata: EpisodeMetadata,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata).map(([k, v]) => [k, encodeBase64Url(v)]),
  );
}

export function decodeMetadata(
  raw: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, decodeBase64Url(v)]),
  );
}

function encodeBase64Url(str: string): string {
  const base64 = btoa(
    Array.from(new TextEncoder().encode(str), (b) =>
      String.fromCodePoint(b),
    ).join(""),
  );
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const base64 = pad ? padded + "=".repeat(4 - pad) : padded;
  return new TextDecoder().decode(
    Uint8Array.from(atob(base64), (c) => c.codePointAt(0) ?? 0),
  );
}
