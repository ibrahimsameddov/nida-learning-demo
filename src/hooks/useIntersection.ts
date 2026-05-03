import { useEffect, useRef, useState } from "react";

interface UseIntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
}

export function useIntersection<T extends Element>(options: UseIntersectionOptions = {}) {
  const { once = false, ...observerOptions } = options;
  const ref          = useRef<T>(null);
  const [entry, setEntry]   = useState<IntersectionObserverEntry | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([e]) => {
      setEntry(e);
      if (e.isIntersecting) {
        setVisible(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setVisible(false);
      }
    }, observerOptions);

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return { ref, entry, visible };
}
