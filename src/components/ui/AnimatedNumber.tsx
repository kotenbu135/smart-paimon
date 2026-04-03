import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedNumberProps {
  readonly value: number;
  readonly duration?: number;
  readonly formatFn?: (n: number) => string;
  readonly className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString();

export function AnimatedNumber({
  value,
  duration = 0.6,
  formatFn = defaultFormat,
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => formatFn(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, duration, motionValue]);

  useEffect(() => {
    const unsub = display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [display]);

  return <span ref={ref} className={className}>{formatFn(value)}</span>;
}
