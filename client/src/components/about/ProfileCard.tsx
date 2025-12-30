import type { SocialIcon } from "./data";

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
  return (
    <div className="flex w-full flex-row items-start gap-6 lg:max-w-[515px]">
      {/* Avatar */}
      <img
        src={avatarSrc}
        alt={name}
        width={160}
        height={160}
        className="h-[160px] w-[160px] shrink-0 rounded-full border border-white object-cover"
      />

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
