const facts = [
  "Lower Burnout rates by 20%",
  "Enhance mental strength",
  "Reduce depression and anxiety",
  ["Improves Sleep Quality", "by 75%"],
] as const;

export function DidYouKnowSection() {
  return (
    <section className="mt-[250px] pb-[60px]">
      <h2 className="mb-[64px] text-center font-manrope text-[24px] font-semibold leading-[1.2] text-white">
        Did you know that daily gratitude practice:
      </h2>

      {/* Facts boxes - 2x2 grid layout */}
      <div className="mx-auto grid max-w-[1124px] grid-cols-1 gap-x-[32px] gap-y-[24px] md:grid-cols-2">
        {facts.map((fact, index) => (
          <div
            key={index}
            className="flex h-[82px] items-center justify-center rounded-pill-sm bg-[rgba(95,82,178,0.3)] p-[10px] backdrop-blur-glass"
          >
            <p className="px-5 py-2.5 text-center font-manrope text-[24px] font-normal leading-[1.2] tracking-[2.4px] text-white">
              {Array.isArray(fact) ? (
                <>
                  <span className="block">{fact[0]}</span>
                  <span className="block">{fact[1]}</span>
                </>
              ) : (
                fact
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
