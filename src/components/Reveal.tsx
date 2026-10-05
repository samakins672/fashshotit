import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "../hooks";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms before the animation starts. */
  delay?: number;
  /** "fade" slides content up; "wipe" sweeps a cover across it (used for headings and images). */
  variant?: "fade" | "wipe";
}

export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, variant = "fade" }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Tag ref={ref} style={style} className={`reveal reveal-${variant}${inView ? " is-visible" : ""} ${className}`.trim()}>
      {variant === "wipe" ? (
        <>
          <span className="reveal-cover" aria-hidden="true" />
          <span className="reveal-content">{children}</span>
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
