const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatRfc822(date: Date): string {
  const dayOfWeek = weekdayFormatter.format(date);
  const month = monthFormatter.format(date);
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const time = timeFormatter.format(date);
  return `${dayOfWeek}, ${day} ${month} ${year} ${time} +0000`;
}
