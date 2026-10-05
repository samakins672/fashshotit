import { useEffect, useState } from "react";
import { skills } from "../data/site";
import { useInView, usePrefersReducedMotion } from "../hooks";
import SectionHeading from "./SectionHeading";

function Counter({ value, start }: { value: number; start: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (reducedMotion) {
      setN(value);
      return;
    }
    const duration = 2500;
    const t0 = performance.now();
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value, reducedMotion]);

  return <>{n}</>;
}

export default function Skills() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section className="section" id="skills">
      <div className="container">
        <SectionHeading title="My Skills" />
        <div className="skills-grid" ref={ref}>
          {skills.map((s) => (
            <div key={s.label} className={`skill${inView ? " is-visible" : ""}`}>
              <span className="skill-number" aria-label={`${s.value}%`}>
                <span aria-hidden="true">
                  <Counter value={s.value} start={inView} />
                </span>
                <span className="skill-suffix" aria-hidden="true">
                  %
                </span>
              </span>
              <span className="skill-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
