import { useRef } from "react";
import { Typography } from "../components/ui";
import {
  AboutBackground,
  CircularPhotosGallery,
  ProfileCard,
  StartSharingButton,
  StickyNotesCollage,
  TornPaperDecoration,
  profiles,
} from "../components/about";
import { useScrollBlur } from "../hooks/useScrollBlur";

export function AboutPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { blurAmount, overlayOpacity } = useScrollBlur(scrollContainerRef);

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden">
      <AboutBackground blurAmount={blurAmount} overlayOpacity={overlayOpacity} />

      <div
        ref={scrollContainerRef}
        className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden"
      >
        <TornPaperDecoration />

        <div className="mx-auto max-w-[1512px] space-y-10 overflow-x-hidden px-6 sm:px-10 lg:px-[142px]">
          {/* "HEY, WE ARE" heading */}
          <Typography
            variant="h2"
            as="h2"
            className="text-[32px] uppercase tracking-[-0.332px] text-design-text"
          >
            HEY, WE ARE
          </Typography>

          {/* Profile Cards */}
          <div className="flex flex-col gap-y-8 lg:flex-row lg:flex-wrap lg:gap-x-[112px]">
            {profiles.map((profile) => (
              <ProfileCard key={profile.name} {...profile} />
            ))}
          </div>

          {/* "OUR STORY" heading */}
          <Typography
            variant="h2"
            as="h2"
            className="mt-[20px] text-[32px] uppercase tracking-[-0.32px] text-design-text"
          >
            OUR STORY
          </Typography>

          {/* First story paragraph */}
          <p className="w-full font-manrope text-[24px] font-semibold uppercase leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px]">
            In 2020 during lock down, we began leaving sticky notes on our
            bathroom wall to ensure we always saw and appreciated each other.
          </p>

          <StickyNotesCollage />

          {/* Second story paragraph */}
          <p className="w-full font-manrope text-[24px] font-semibold uppercase leading-[1.2] tracking-[2.88px] text-design-text lg:ml-auto lg:w-[600px]">
            This little habit became our inspiration, during a period of
            unexpected unemployment. It served as a tool to stay grounded, true
            to ourselves and remember, that everything is temporary, so why not
            enjoy it?
          </p>

          {/* Philosophy text + circular photos */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="w-full font-manrope text-[24px] font-semibold uppercase leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px] lg:shrink-0">
              We believe technology should help us feel the way those notes did:
              simple, kind and fun.
            </p>
            <CircularPhotosGallery />
          </div>

          {/* CTA text */}
          <p className="w-full font-manrope text-[24px] font-medium leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px]">
            What brought <span className="font-extrabold">you</span> a little
            joy today - a message from someone you love? A meal that hit the
            spot? Or maybe a really cute cat?
          </p>

          <StartSharingButton />

          {/* Bottom spacing */}
          <div className="h-[100px]" />
        </div>
      </div>
    </div>
  );
}
