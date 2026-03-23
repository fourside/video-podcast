import { describe, expect, test } from "vitest";
import { sanitizeKey } from "./sanitize-key.ts";

describe("sanitizeKey", () => {
  test("basic ASCII", () => {
    expect(sanitizeKey("MyChannel", "Episode 1")).toBe(
      "MyChannel_Episode-1.mp4",
    );
  });

  test("Japanese channel and title", () => {
    expect(sanitizeKey("テストチャンネル", "第123回 AIとポッドキャスト")).toBe(
      "テストチャンネル_第123回-AIとポッドキャスト.mp4",
    );
  });

  test("special characters are removed", () => {
    expect(sanitizeKey("ch", "a!b@c#d$e%f")).toBe("ch_abcdef.mp4");
  });

  test("fullwidth spaces become hyphens", () => {
    expect(sanitizeKey("ch", "a\u3000b")).toBe("ch_a-b.mp4");
  });

  test("consecutive spaces collapse to single hyphen", () => {
    expect(sanitizeKey("ch", "a   b")).toBe("ch_a-b.mp4");
  });

  test("leading and trailing whitespace trimmed", () => {
    expect(sanitizeKey("  ch  ", "  title  ")).toBe("ch_title.mp4");
  });

  test("brackets and parentheses removed", () => {
    expect(sanitizeKey("ch", "【第1回】タイトル（前編）")).toBe(
      "ch_第1回タイトル前編.mp4",
    );
  });

  test("truncates at 200 characters", () => {
    const longTitle = "あ".repeat(300);
    const result = sanitizeKey("ch", longTitle);
    // "ch_" = 3 chars, so total before .mp4 is 200
    expect(result.replace(".mp4", "").length).toBe(200);
    expect(result.endsWith(".mp4")).toBe(true);
  });

  test("empty channel", () => {
    expect(sanitizeKey("", "title")).toBe("_title.mp4");
  });

  test("empty title", () => {
    expect(sanitizeKey("ch", "")).toBe("ch_.mp4");
  });

  test("mixed languages", () => {
    expect(sanitizeKey("Channel名", "Episode 第5回")).toBe(
      "Channel名_Episode-第5回.mp4",
    );
  });

  test("hyphens in input are preserved", () => {
    expect(sanitizeKey("my-channel", "episode-01")).toBe(
      "my-channel_episode-01.mp4",
    );
  });

  test("slashes and dots are removed", () => {
    expect(sanitizeKey("ch", "2024/03/15 放送分 v2.0")).toBe(
      "ch_20240315-放送分-v20.mp4",
    );
  });
});
