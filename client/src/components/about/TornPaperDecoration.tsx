export function TornPaperDecoration() {
  return (
    <div className="pointer-events-none relative left-0 top-0 z-[5] h-[180px] w-full">
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          inset: "-4.41% 0 -60% 0",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
        }}
      >
        <img
          src="/assets/about/background/upper-object.png"
          alt=""
          className="block h-full w-full max-w-none object-cover"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
