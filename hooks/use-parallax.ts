import { useEffect, useRef, useState } from "react";

/**
 * useParallax
 * Returns a style object with transform for parallax based on scroll position.
 * @param options - { range: [number, number], axis: 'x' | 'y' | 'rotateX' | 'rotateY', factor: number }
 */
export function useParallax({
  range = [0, 200],
  axis = "y",
  factor = 0.3,
  disabled = false,
}: {
  range?: [number, number];
  axis?: "x" | "y" | "rotateX" | "rotateY";
  factor?: number;
  disabled?: boolean;
} = {}) {
  const [style, setStyle] = useState<{ transform: string }>({ transform: "" });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Animation starts when the element's top enters the viewport from the bottom
      const start = window.innerHeight; // bottom of viewport
      const end = typeof range[1] === "number" ? range[1] : 0; // top of viewport or tunable end
      const progress = Math.min(
        Math.max((start - rect.top) / (start - end), 0),
        1,
      );
      let transform = "";
      if (axis === "y") {
        transform = `translateY(${-(1 - progress) * factor * 100}px)`;
      } else if (axis === "x") {
        transform = `translateX(${-(1 - progress) * factor * 100}px)`;
      } else if (axis === "rotateX") {
        transform = `rotateX(${(1 - progress) * factor * 50}deg)`;
      } else if (axis === "rotateY") {
        transform = `rotateY(${(1 - progress) * factor * 50}deg)`;
      }
      // Only update if transform actually changed
      setStyle((prev) => (prev.transform === transform ? prev : { transform }));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [axis, factor, range, disabled]);

  return { ref, style };
}
