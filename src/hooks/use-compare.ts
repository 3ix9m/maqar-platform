import { useEffect, useState } from "react";

const KEY = "maqar.compare";
const MAX = 3;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("maqar:compare"));
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>(() => read());

  useEffect(() => {
    const onChange = () => setIds(read());
    window.addEventListener("maqar:compare", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("maqar:compare", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return {
    ids,
    isInCompare: (id: string) => ids.includes(id),
    canAdd: ids.length < MAX,
    max: MAX,
    toggle: (id: string) => {
      const cur = read();
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id];
      write(next);
      setIds(next);
      return next.includes(id);
    },
    remove: (id: string) => {
      const next = read().filter((x) => x !== id);
      write(next);
      setIds(next);
    },
    clear: () => {
      write([]);
      setIds([]);
    },
  };
}
