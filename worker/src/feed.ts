import { decodeMetadata, parseEpisodeMetadata } from "video-podcast-shared";
import { formatRfc822 } from "./format-rfc822";

export function generateFeed(host: string, objects: R2Object[]): string {
  const episodes = objects
    .map((obj) => ({
      key: obj.key,
      meta: obj.customMetadata
        ? parseEpisodeMetadata(decodeMetadata(obj.customMetadata))
        : undefined,
    }))
    .filter(
      (e): e is { key: string; meta: NonNullable<typeof e.meta> } =>
        e.meta !== undefined,
    )
    .sort((a, b) => b.meta.published_at.localeCompare(a.meta.published_at));

  const items = episodes
    .map(({ key, meta }) => {
      const enclosureUrl = `${host}/episodes/${encodeURIComponent(key)}`;
      const pubDate = formatRfc822(new Date(meta.published_at));
      return `
    <item>
      <title>${escapeXml(meta.title)}</title>
      <description>${escapeXml(meta.title)}</description>
      <enclosure url="${escapeXml(enclosureUrl)}" length="${meta.filesize}" type="video/mp4" />
      <guid isPermaLink="false">${escapeXml(meta.video_id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <itunes:duration>${meta.duration}</itunes:duration>
      <itunes:image href="${escapeXml(meta.thumbnail_url)}" />
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Video Podcast</title>
    <link>${host}</link>
    <description>YouTube video podcast</description>
    <language>ja</language>
    <itunes:author>fourside</itunes:author>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Technology" />${items}
  </channel>
</rss>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
