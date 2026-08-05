import { useEffect, useState } from 'react';

/**
 * Minimal hash-based router. Returns the current path (without the leading #)
 * and a navigate function. Supports paths like #/shop, #/admin, etc.
 */
export function useRouter() {
  const [path, setPath] = useState(() => parseHash());

  useEffect(() => {
    const onHash = () => {
      setPath(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return { path, navigate };
}

function parseHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}
