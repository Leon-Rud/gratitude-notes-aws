import { useRef } from "react";
import { Typography } from "../components/ui";
import {
  AboutBackground,
  NotesPhotosGallery,
  ProfileCard,
  StartSharingButton,
  StickyNotesCollage,
  TornPaperDecoration,
  profiles,
} from "../components/about";
import { useScrollBlur } from "../hooks/useScrollBlur";

export function AboutPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { blurAmount, overlayOpacity } = useScrollBlur(scrollContainerRef, {
    maxScroll: 1800,
  });

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden">
      <AboutBackground
        blurAmount={blurAmount}
        overlayOpacity={overlayOpacity}
      />

      <div
        ref={scrollContainerRef}
        className="page-scroll relative z-10 h-full w-full overflow-y-auto overflow-x-hidden"
      >
        <TornPaperDecoration />

        <div className="mx-auto max-w-[1512px] overflow-x-hidden px-6 sm:px-10 lg:px-[142px]">
          {/* "HEY, WE ARE" heading */}
          <div className="pt-[96px]">
            <Typography
              variant="h2"
              as="h2"
              className="text-[32px] uppercase tracking-[-0.332px] text-design-text"
            >
              HEY, WE ARE
            </Typography>
          </div>

          {/* Profile Cards - side by side on desktop */}
          <div className="mt-[96px] flex flex-col gap-y-8 lg:flex-row lg:items-center lg:justify-between lg:gap-x-8">
            {profiles.map((profile) => (
              <ProfileCard key={profile.name} {...profile} />
            ))}
          </div>

          {/* "OUR STORY" section */}
          <div className="mt-[96px]">
            <Typography
              variant="h2"
              as="h2"
              className="text-[32px] uppercase tracking-[-0.32px] text-design-text"
            >
              OUR STORY
            </Typography>
          </div>

          {/* First story paragraph */}
          <p className="mt-[64px] w-full font-manrope text-[24px] font-semibold leading-[1.2] tracking-[2.88px] text-design-text lg:w-[540px]">
            In 2020, during lockdown, we started leaving sticky notes on our
            bathroom wall so we wouldn't forget to appreciate each other.
          </p>

          {/* Notes Photos + Story paragraph - side by side on desktop */}
          <div className="mt-[64px] flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <NotesPhotosGallery />
            <p className="w-full font-manrope text-[24px] font-semibold leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px]">
              It began as simple gratitude messages, but soon friends who
              visited added their own notes – jokes, shout-outs, little
              reminders to be kind to themselves.
              <br />
              <br />
              The wall turned into a living thing: some notes fell, new ones
              appeared, and the mood changed with us.
            </p>
          </div>

          {/* Sticky Notes Collage */}
          <div className="mt-[64px]">
            <StickyNotesCollage />
          </div>

          {/* Philosophy text */}
          <p className="mt-[64px] w-full font-manrope text-[24px] font-semibold leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px]">
            Gratitude Board is our digital version of that wall – a place where
            anyone can share a thought or a moment of gratitude, knowing the
            notes will reset at the end of each day. Every day is a chance to
            start over.
          </p>

          <div className="mt-[64px]">
            <StartSharingButton />
          </div>

          {/* Bottom spacing */}
          <div className="h-[100px]" />
        </div>
      </div>
    </div>
  );
}
