// Single source of truth for timezone handling across the app.
// The app stores a simple zone label in settings; we map it to a fixed UTC offset.

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC', offset: 0 },
  { value: 'GMT', label: 'GMT (London)', offset: 0 },
  { value: 'EST', label: 'EST (New York)', offset: -5 },
  { value: 'ULAT', label: 'ULAT (Ulaanbaatar)', offset: 8 },
] as const;

export const getTimezoneOffset = (tz: string): number => {
  const found = TIMEZONES.find(t => t.value === tz);
  return found ? found.offset : 0;
};

// Convert a Date into the wall-clock time of the selected zone.
// We normalize to UTC first (removing the host machine's local offset) so the
// host timezone never leaks in — previously `addHours(new Date(), offset)`
// double-applied the local offset on top of the target offset.
export const toZonedTime = (date: Date, tz: string): Date => {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utcMs + getTimezoneOffset(tz) * 3600000);
};
