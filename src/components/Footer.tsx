import { useEffect, useState } from 'react';
import { useClock } from '@/hooks/useClock';

const cols = [
  {
    title: 'Shop',
    links: [
      { label: 'All garments', href: '#/shop' },
      { label: 'Upcoming drops', href: '#/upcoming' },
      { label: 'The Lab', href: '#/lab' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About', href: '#/' },
      { label: 'Admin', href: '#/admin' },
      { label: 'Instagram', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t hairline border-ink-900/15 bg-paper-100">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-px border-b hairline border-ink-900/15 bg-ink-900/10 md:grid-cols-3">
        <ClockPanel city="Nigeria" tz="Africa/Lagos" />
        <UserLocation />
        <NextDrop />
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-6 py-16 md:px-10">
        <div className="col-span-12 md:col-span-6">
          <a
            href="#/"
            className="inline-block"
          >
            <img
              src={import.meta.env.BASE_URL + 'images/WhatsApp_Image_2026-08-05_at_12.32.10.jpeg'}
              alt="FOHG"
              className="h-20 w-auto object-contain md:h-28"
            />
          </a>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-500">
            Garments made to outlast the season. Heavyweight essentials,
            small-batch dye, and ideas in progress.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="col-span-6 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
              {c.title}
            </p>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    data-cursor="Link"
                    className="text-sm text-ink-800 transition-colors hover:text-clay-500"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t hairline border-ink-900/10">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-6 py-6 md:flex-row md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            © FOHG MMXXVI — All rights reserved
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            Made in small batches. Shipped from Nigeria.
          </p>
        </div>
      </div>
    </footer>
  );
}

function ClockPanel({ city, tz }: { city: string; tz: string }) {
  const time = useClock(tz);
  return (
    <div className="flex items-center justify-between bg-paper-100 px-6 py-7 md:px-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
        {city}
      </span>
      <span className="font-mono text-lg text-ink-900 tabular-nums">
        {time}
      </span>
    </div>
  );
}

function UserLocation() {
  const [location, setLocation] = useState<string>('Locating…');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation('Location unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`,
            { headers: { Accept: 'application/json' } },
          );
          const data = await res.json();
          const state =
            data?.address?.state ||
            data?.address?.region ||
            data?.address?.city ||
            'Unknown';
          const country = data?.address?.country_code?.toUpperCase() || '';
          setLocation(country ? `${state}, ${country}` : state);
        } catch {
          setLocation('Location unavailable');
        }
      },
      () => setLocation('Location disabled'),
      { timeout: 8000 },
    );
  }, []);

  return (
    <div className="flex items-center justify-between bg-paper-100 px-6 py-7 md:px-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
        You are here
      </span>
      <span className="font-mono text-sm text-ink-900">{location}</span>
    </div>
  );
}

function NextDrop() {
  const [remaining, setRemaining] = useState<string>('—');

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      );
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-between bg-paper-100 px-6 py-7 md:px-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-500">
        Next drop in
      </span>
      <span className="font-mono text-lg text-clay-500 tabular-nums">
        {remaining}
      </span>
    </div>
  );
}
