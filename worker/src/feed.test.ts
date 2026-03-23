import type { EpisodeMetadata } from "video-podcast-shared";
import { encodeMetadata } from "video-podcast-shared";
import { describe, expect, test } from "vitest";
import { generateFeed } from "./feed";

function makeR2Object(key: string, customMetadata: EpisodeMetadata): R2Object {
  return {
    key,
    customMetadata: encodeMetadata(customMetadata),
  } as unknown as R2Object;
}

describe("generateFeed", () => {
  const host = "https://video-podcast.fourside.dev";

  test("generates valid RSS with episodes", () => {
    const objects = [
      makeR2Object("ch_episode1.mp4", {
        title: "Episode 1",
        published_at: "2026-03-15T00:00:00+09:00",
        duration: "3600",
        channel: "TestChannel",
        thumbnail_url: "https://i.ytimg.com/vi/abc/default.jpg",
        video_id: "abc123",
        filesize: "314572800",
      }),
    ];

    const xml = generateFeed(host, objects);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<title>Video Podcast</title>");
    expect(xml).toContain("<language>ja</language>");
    expect(xml).toContain("<title>Episode 1</title>");
    expect(xml).toContain('type="video/mp4"');
    expect(xml).toContain('<guid isPermaLink="false">abc123</guid>');
    expect(xml).toContain("<itunes:duration>3600</itunes:duration>");
    expect(xml).toContain('length="314572800"');
  });

  test("encodes episode key in URL", () => {
    const objects = [
      makeR2Object("チャンネル_タイトル.mp4", {
        title: "タイトル",
        published_at: "2026-03-15T00:00:00+09:00",
        duration: "1800",
        channel: "チャンネル",
        thumbnail_url: "https://example.com/thumb.jpg",
        video_id: "xyz789",
        filesize: "100000",
      }),
    ];

    const xml = generateFeed(host, objects);

    expect(xml).toContain(
      `${host}/episodes/${encodeURIComponent("チャンネル_タイトル.mp4")}`,
    );
  });

  test("sorts episodes by published_at descending", () => {
    const objects = [
      makeR2Object("older.mp4", {
        title: "Older",
        published_at: "2026-01-01T00:00:00+09:00",
        duration: "60",
        channel: "ch",
        thumbnail_url: "https://example.com/1.jpg",
        video_id: "old",
        filesize: "1000",
      }),
      makeR2Object("newer.mp4", {
        title: "Newer",
        published_at: "2026-03-01T00:00:00+09:00",
        duration: "60",
        channel: "ch",
        thumbnail_url: "https://example.com/2.jpg",
        video_id: "new",
        filesize: "1000",
      }),
    ];

    const xml = generateFeed(host, objects);

    const newerIndex = xml.indexOf("Newer");
    const olderIndex = xml.indexOf("Older");
    expect(newerIndex).toBeLessThan(olderIndex);
  });

  test("skips objects without video_id", () => {
    const objects = [
      { key: "no-meta.mp4", customMetadata: {} } as unknown as R2Object,
      makeR2Object("valid.mp4", {
        title: "Valid",
        published_at: "2026-03-15T00:00:00+09:00",
        duration: "60",
        channel: "ch",
        thumbnail_url: "https://example.com/thumb.jpg",
        video_id: "valid1",
        filesize: "1000",
      }),
    ];

    const xml = generateFeed(host, objects);

    expect(xml).toContain("Valid");
    expect(xml).not.toContain("no-meta");
  });

  test("escapes XML special characters in title", () => {
    const objects = [
      makeR2Object("ep.mp4", {
        title: 'A & B <C> "D"',
        published_at: "2026-03-15T00:00:00+09:00",
        duration: "60",
        channel: "ch",
        thumbnail_url: "https://example.com/thumb.jpg",
        video_id: "esc1",
        filesize: "1000",
      }),
    ];

    const xml = generateFeed(host, objects);

    expect(xml).toContain("A &amp; B &lt;C&gt; &quot;D&quot;");
  });

  test("empty objects list produces feed with no items", () => {
    const xml = generateFeed(host, []);

    expect(xml).toContain("<title>Video Podcast</title>");
    expect(xml).not.toContain("<item>");
  });
});
