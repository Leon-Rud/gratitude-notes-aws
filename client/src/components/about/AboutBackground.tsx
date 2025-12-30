export interface AboutBackgroundProps {
  blurAmount: number;
  overlayOpacity: number;
}

export function AboutBackground({
  blurAmount,
  overlayOpacity,
}: AboutBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Base purple background */}
      <div className="absolute inset-0 bg-[#907EAD]" />

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/about/background/about-us-background.png')",
        }}
        aria-hidden="true"
      />

      {/* Purple tint overlay - opacity decreases on scroll */}
      <div
        className="absolute inset-0 bg-[#5F52B2] transition-opacity duration-100"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      {/* Blur overlay - blur decreases on scroll */}
      <div
        className="absolute inset-0 transition-[backdrop-filter] duration-100"
        style={{
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
