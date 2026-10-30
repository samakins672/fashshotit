import { useEffect, useRef, useState } from "react";

/** Becomes true once the element scrolls into view (and stays true). */
export function useInView<T extends Element>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/** Updates document title and OpenGraph / Twitter meta tags for social previews & browser tabs. */
export function usePageMeta({ title, description, image, url }: PageMetaOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = title;
    }

    const setMeta = (attr: "name" | "property", key: string, value?: string) => {
      if (!value) return null;
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      const prev = el ? el.content : null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = value;
      return { el, prev };
    };

    const cleanup: Array<() => void> = [];

    if (title) {
      const ogT = setMeta("property", "og:title", title);
      const twT = setMeta("name", "twitter:title", title);
      cleanup.push(() => {
        if (ogT) ogT.el.content = ogT.prev ?? "";
        if (twT) twT.el.content = twT.prev ?? "";
      });
    }

    if (description) {
      const desc = setMeta("name", "description", description);
      const ogD = setMeta("property", "og:description", description);
      const twD = setMeta("name", "twitter:description", description);
      cleanup.push(() => {
        if (desc) desc.el.content = desc.prev ?? "";
        if (ogD) ogD.el.content = ogD.prev ?? "";
        if (twD) twD.el.content = twD.prev ?? "";
      });
    }

    if (image) {
      const absImage = image.startsWith("http")
        ? image
        : `${window.location.origin}${image.startsWith("/") ? "" : "/"}${image}`;
      const ogI = setMeta("property", "og:image", absImage);
      const twI = setMeta("name", "twitter:image", absImage);
      cleanup.push(() => {
        if (ogI) ogI.el.content = ogI.prev ?? "";
        if (twI) twI.el.content = twI.prev ?? "";
      });
    }

    if (url) {
      const ogU = setMeta("property", "og:url", url);
      const twU = setMeta("name", "twitter:url", url);
      cleanup.push(() => {
        if (ogU) ogU.el.content = ogU.prev ?? "";
        if (twU) twU.el.content = twU.prev ?? "";
      });
    }

    return () => {
      document.title = prevTitle;
      cleanup.forEach((fn) => fn());
    };
  }, [title, description, image, url]);
}
