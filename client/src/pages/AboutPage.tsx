import { useEffect, useRef, useState } from "react";
import { Typography } from "../components/ui";

// Data arrays defined outside component for better performance
type SocialIcon = {
  src: string;
  alt: string;
  href: string | null;
  ariaLabel: string;
};

const socialIcons: SocialIcon[] = [
  {
    src: "/assets/about/icons/linkedin-icon.svg",
    alt: "LinkedIn",
    href: null,
    ariaLabel: "Visit LinkedIn profile",
  },
  {
    src: "/assets/about/icons/link-icon.svg",
    alt: "Link",
    href: null,
    ariaLabel: "Visit website",
  },
  {
    src: "/assets/about/icons/mail-icon.svg",
    alt: "Email",
    href: null,
    ariaLabel: "Send email",
  },
];

type StickyNote = {
  src: string;
  alt: string;
  left: string;
  top: string;
  width: number;
  height: number;
};

const stickyNotes: StickyNote[] = [
  {
    src: "/assets/about/notes/note-1.png",
    alt: "Gratitude note about appreciation",
    left: "741px",
    top: "0px",
    width: 220,
    height: 220,
  },
  {
    src: "/assets/about/notes/note-2.png",
    alt: "Gratitude note about connection",
    left: "481px",
    top: "145px",
    width: 220,
    height: 220,
  },
  {
    src: "/assets/about/notes/note-3.png",
    alt: "Gratitude note about reflection",
    left: "0px",
    top: "145px",
    width: 220,
    height: 220,
  },
  {
    src: "/assets/about/notes/note-4.png",
    alt: "Gratitude note about moments",
    left: "224px",
    top: "269px",
    width: 220,
    height: 220,
  },
  {
    src: "/assets/about/notes/note-5.png",
    alt: "Gratitude note about gratitude",
    left: "900px",
    top: "110px",
    width: 182,
    height: 182,
  },
];

type CircularPhoto = {
  src: string;
  alt: string;
};

const circularPhotos: CircularPhoto[] = [
  {
    src: "/assets/about/photos/note-photo-1.png",
    alt: "Gratitude notes collage showing daily appreciation",
  },
  {
    src: "/assets/about/photos/note-photo-2.png",
    alt: "Gratitude notes collage with handwritten messages",
  },
  {
    src: "/assets/about/photos/note-photo-3.png",
    alt: "Gratitude notes collage featuring personal reflections",
  },
];

type ProfileCardProps = {
  name: string;
  role: string;
  description: string;
  nameTracking: string;
  avatarSrc: string;
};

function ProfileCard({
  name,
  role,
  description,
  nameTracking,
  avatarSrc,
}: ProfileCardProps) {
  return (
    <div className="flex w-full flex-row items-start gap-6 lg:max-w-[515px]">
      {/* Avatar - left side */}
      <img
        src={avatarSrc}
        alt={name}
        width={160}
        height={160}
        className="h-[160px] w-[160px] shrink-0 rounded-full border border-white object-cover"
      />

      {/* Text content - right side */}
      <div className="flex min-w-0 flex-col gap-[32px]">
        {/* Name */}
        <p
          className={`font-manrope text-[36px] font-bold ${nameTracking} leading-[1.2] text-design-text`}
        >
          {name}
        </p>

        {/* Role */}
        <p className="font-manrope text-[24px] font-semibold leading-[1.2] tracking-[2.4px] text-design-text">
          {role}
        </p>

        {/* Description */}
        <p className="whitespace-pre-wrap font-manrope text-[20px] font-normal leading-[1.2] tracking-[2px] text-design-text">
          {description}
        </p>

        {/* Social icons */}
        <div className="mt-3 flex gap-3">
          {socialIcons.map((icon) => {
            const iconElement = (
              <img
                src={icon.src}
                alt={icon.alt}
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
              />
            );

            return icon.href ? (
              <a
                key={icon.src}
                href={icon.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={icon.ariaLabel}
                className="transition-opacity hover:opacity-80"
              >
                {iconElement}
              </a>
            ) : (
              <button
                key={icon.src}
                type="button"
                aria-label={icon.ariaLabel}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {iconElement}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  // Initial blur matches backdrop-blur-hero token (17.5px)
  const [blurAmount, setBlurAmount] = useState(17.5);
  const [overlayOpacity, setOverlayOpacity] = useState(0.55);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const maxScroll = 1600; // Scroll distance over which blur fades

      // Calculate blur: starts at 17.5px, fades to clearer view as user scrolls
      const scrollProgress = Math.min(scrollTop / maxScroll, 1);
      const newBlur = 17.5 * (1 - scrollProgress);
      // Keep minimum opacity of 0.3 for purple tint even when clear
      const newOpacity = Math.max(0.5, 0.55 * (1 - scrollProgress * 0.5));

      setBlurAmount(newBlur);
      setOverlayOpacity(newOpacity);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden">
      {/* Fixed background layers - doesn't scroll */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Base purple background */}
        <div className="absolute inset-0 bg-[#907EAD]" />

        {/* Background image - covers entire viewport, fixed */}
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

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden"
      >
        {/* Upper decorative object - torn paper effect (scrolls with content) */}
        <div className="pointer-events-none relative left-0 top-0 z-[5] h-[180px] w-full">
          <div
            className="pointer-events-none absolute overflow-hidden"
            style={{
              inset: "-4.41% 0 -60% 0",
              maskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 60%, transparent 100%)",
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

        <div className="mx-auto max-w-[1512px] space-y-10 overflow-x-hidden px-6 sm:px-10 lg:px-[142px]">

          {/* "HEY, WE ARE" heading */}
          <Typography
            variant="h2"
            as="h2"
            className="text-[32px] uppercase tracking-[-0.332px] text-design-text"
          >
            HEY, WE ARE
          </Typography>

          {/* Two Profile Cards */}
          <div className="flex flex-col gap-y-8 lg:flex-row lg:flex-wrap lg:gap-x-[112px]">
            <ProfileCard
              name="Leon"
              role="Logic - Data - Code"
              description={`I wire up the logic behind the screen, so every action quietly does the right thing.\n\nKeeping the magic from breaking.`}
              nameTracking="tracking-[4.32px]"
              avatarSrc="/assets/images/photos/leon-photo.png"
            />
            <ProfileCard
              name="Aleksandra"
              role="UX - Words - Visuals"
              description={`I shape the user journey, ensuring everything feels like a thoughtful interaction.\n\nMaking the experience feel human.`}
              nameTracking="tracking-[3.6px]"
              avatarSrc="/assets/images/photos/sasha-photo.png"
            />
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

          {/* Sticky notes collage - Desktop: absolute positioning */}
          <div className="relative hidden h-[489px] w-full overflow-hidden lg:block lg:max-w-[1228px]">
            {stickyNotes.map((note, index) => (
              <div
                key={index}
                className={`absolute overflow-hidden rounded-card ${
                  note.width === 182
                    ? "h-[182px] w-[182px]"
                    : "h-[220px] w-[220px]"
                }`}
                style={{
                  left: note.left,
                  top: note.top,
                  zIndex: index + 1,
                }}
              >
                <img
                  src={note.src}
                  alt={note.alt}
                  width={note.width}
                  height={note.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Sticky notes collage - Mobile: grid layout */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {stickyNotes.map((note, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-card"
                style={{ aspectRatio: `${note.width} / ${note.height}` }}
              >
                <img
                  src={note.src}
                  alt={note.alt}
                  width={note.width}
                  height={note.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Second story paragraph - positioned right on desktop */}
          <p className="w-full font-manrope text-[24px] font-semibold uppercase leading-[1.2] tracking-[2.88px] text-design-text lg:ml-auto lg:w-[600px]">
            This little habit became our inspiration, during a period of
            unexpected unemployment. It served as a tool to stay grounded, true
            to ourselves and remember, that everything is temporary, so why not
            enjoy it?
          </p>

          {/* Philosophy text + circular photos - same row on desktop */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Philosophy text */}
            <p className="w-full font-manrope text-[24px] font-semibold uppercase leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px] lg:shrink-0">
              We believe technology should help us feel the way those notes did:
              simple, kind and fun.
            </p>

            {/* Three circular photos with overlap - middle one lower */}
            <div className="flex shrink-0 items-start justify-center">
              {/* First circle - normal position */}
              <div className="h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
                <img
                  src={circularPhotos[0].src}
                  alt={circularPhotos[0].alt}
                  width={188}
                  height={188}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Middle circle - positioned lower */}
              <div className="-ml-8 mt-12 h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
                <img
                  src={circularPhotos[1].src}
                  alt={circularPhotos[1].alt}
                  width={188}
                  height={188}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Third circle - normal position */}
              <div className="-ml-8 h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
                <img
                  src={circularPhotos[2].src}
                  alt={circularPhotos[2].alt}
                  width={188}
                  height={188}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* CTA text */}
          <p className="w-full font-manrope text-[24px] font-medium leading-[1.2] tracking-[2.88px] text-design-text lg:w-[600px]">
            What brought <span className="font-extrabold">you</span> a little
            joy today - a message from someone you love? A meal that hit the
            spot? Or maybe a really cute cat?
          </p>

          {/* "Start Sharing" button */}
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/feed";
            }}
            className="flex h-[82px] w-[257px] items-center justify-center rounded-pill-sm border-thin border-white bg-ui-glass p-[10px] backdrop-blur-glass"
          >
            <div className="flex h-[62px] w-[233px] items-center justify-center gap-2 rounded-pill border-[0.5px] border-ui-border bg-ui-overlay px-[20px] py-[10px]">
              <span className="whitespace-nowrap font-poppins text-[24px] font-light tracking-[-0.36px] text-design-text">
                Start Sharing
              </span>
              <img
                src="/assets/icons/arrow-up-right.svg"
                alt=""
                className="block h-[36px] w-[36px] shrink-0 object-contain"
              />
            </div>
          </button>

          {/* Bottom spacing */}
          <div className="h-[100px]" />
        </div>
      </div>
    </div>
  );
}
