import { describe, expect, test } from "vitest";
import { formatRfc822 } from "./format-rfc822";

describe("formatRfc822", () => {
  test("formats a known date", () => {
    const date = new Date("2026-03-15T10:30:59Z");
    expect(formatRfc822(date)).toBe("Sun, 15 Mar 2026 10:30:59 +0000");
  });

  test("handles midnight UTC", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    expect(formatRfc822(date)).toBe("Thu, 1 Jan 2026 00:00:00 +0000");
  });

  test("handles end of year", () => {
    const date = new Date("2025-12-31T23:59:59Z");
    expect(formatRfc822(date)).toBe("Wed, 31 Dec 2025 23:59:59 +0000");
  });

  test("ISO 8601 with timezone offset is converted to UTC", () => {
    // 2026-03-15T09:00:00+09:00 = 2026-03-15T00:00:00Z
    const date = new Date("2026-03-15T09:00:00+09:00");
    expect(formatRfc822(date)).toBe("Sun, 15 Mar 2026 00:00:00 +0000");
  });

  test("single digit day is not zero-padded", () => {
    const date = new Date("2026-03-01T12:00:00Z");
    expect(formatRfc822(date)).toBe("Sun, 1 Mar 2026 12:00:00 +0000");
  });
});
