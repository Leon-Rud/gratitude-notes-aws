import { RefObject, useEffect, useState } from "react";

interface UseScrollBlurOptions {
  maxScroll?: number;
  initialBlur?: number;
  initialOpacity?: number;
  minOpacity?: number;
}

interface UseScrollBlurResult {
  blurAmount: number;
  overlayOpacity: number;
}

export function useScrollBlur(
  scrollContainerRef: RefObject<HTMLDivElement>,
  options: UseScrollBlurOptions = {}
): UseScrollBlurResult {
  const {
    maxScroll = 1600,
    initialBlur = 17.5,
    initialOpacity = 0.55,
    minOpacity = 0.45,
  } = options;

  const [blurAmount, setBlurAmount] = useState(initialBlur);
  const [overlayOpacity, setOverlayOpacity] = useState(initialOpacity);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollProgress = Math.min(scrollTop / maxScroll, 1);

      // Blur fades from initial value to 0 as user scrolls
      const newBlur = initialBlur * (1 - scrollProgress);

      // Opacity decreases to minimum value
      const newOpacity = Math.max(
        minOpacity,
        initialOpacity * (1 - scrollProgress)
      );

      setBlurAmount(newBlur);
      setOverlayOpacity(newOpacity);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [scrollContainerRef, maxScroll, initialBlur, initialOpacity, minOpacity]);

  return { blurAmount, overlayOpacity };
}
