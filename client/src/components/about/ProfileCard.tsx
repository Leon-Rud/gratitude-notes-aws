import type { SocialIcon } from "./data";
import { useState } from "react";

export interface ProfileCardProps {
  name: string;
  role: string;
  description: string;
  avatarSrc: string;
  nameTracking?: string;
  socialLinks: SocialIcon[];
}

export function ProfileCard({
  name,
  role,
  description,
  avatarSrc,
  nameTracking = "tracking-[3.6px]",
  socialLinks,
}: ProfileCardProps) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  return (
    <div className="flex w-full flex-row items-start gap-6 lg:max-w-[515px]">
      {/* Avatar */}
      <div className="relative h-[160px] w-[160px] shrink-0">
        {!avatarLoaded && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-white/15" />
        )}
        <img
          src={avatarSrc}
          alt={name}
          width={160}
          height={160}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setAvatarLoaded(true)}
          className={`h-[160px] w-[160px] rounded-full border border-white object-cover transition-opacity duration-300 ${
            avatarLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Text content */}
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
          {socialLinks.map((icon) => {
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
