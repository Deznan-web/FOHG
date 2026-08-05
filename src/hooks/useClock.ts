import { useEffect, useState } from 'react';

/** Returns a live time string for the given IANA timezone, updated every second. */
export function useClock(timeZone = 'Europe/Berlin') {
  const [time, setTime] = useState(() => formatTime(timeZone));

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timeZone)), 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return time;
}

function formatTime(timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone,
    hour12: false,
  }).format(new Date());
}
