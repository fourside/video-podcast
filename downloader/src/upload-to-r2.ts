import { readdir, readFile, stat, unlink } from "node:fs/promises";
import * as v from "valibot";
import { type EpisodeMetadata, encodeMetadata } from "video-podcast-shared";
import { uploadToR2 } from "./r2-client.ts";
import { sanitizeKey } from "./sanitize-key.ts";

const InfoJsonSchema = v.object({
  id: v.string(),
  title: v.string(),
  upload_date: v.pipe(v.string(), v.regex(/^\d{8}$/)),
  duration: v.number(),
  channel: v.optional(v.nullable(v.string())),
  uploader: v.optional(v.nullable(v.string())),
  thumbnail: v.string(),
});

async function main(): Promise<void> {
  const files = await readdir(".");
  const infoFiles = files.filter((f) => f.endsWith(".info.json"));

  if (infoFiles.length === 0) {
    console.log("No new files to upload.");
    return;
  }

  for (const infoFile of infoFiles) {
    const videoId = infoFile.replace(".info.json", "");
    const mp4File = `${videoId}.mp4`;

    try {
      await stat(mp4File);
    } catch {
      console.warn(`WARN: ${mp4File} not found for ${infoFile}, skipping`);
      continue;
    }

    const info = v.parse(
      InfoJsonSchema,
      JSON.parse(await readFile(infoFile, "utf-8")),
    );
    const channel = info.channel || info.uploader || "unknown";
    const uploadDate = info.upload_date;
    const publishedAt = `${uploadDate.slice(0, 4)}-${uploadDate.slice(4, 6)}-${uploadDate.slice(6, 8)}T00:00:00+09:00`;
    const filesize = (await stat(mp4File)).size;

    const key = sanitizeKey(channel, info.title);
    const metadata: EpisodeMetadata = {
      title: info.title,
      published_at: publishedAt,
      duration: String(Math.floor(info.duration)),
      channel: channel,
      thumbnail_url: info.thumbnail,
      video_id: info.id,
      filesize: String(filesize),
    };

    console.log(`Uploading: ${info.title} (${info.id}) → ${key}`);
    await uploadToR2(mp4File, key, encodeMetadata(metadata));

    await unlink(mp4File);
    await unlink(infoFile);
    // Clean up thumbnail if exists
    for (const ext of [".jpg", ".webp", ".png"]) {
      try {
        await unlink(`${videoId}${ext}`);
      } catch {
        // ignore
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
