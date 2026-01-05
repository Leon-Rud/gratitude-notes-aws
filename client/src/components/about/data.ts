export interface SocialIcon {
  src: string;
  alt: string;
  href: string | null;
  ariaLabel: string;
}

export interface StickyNote {
  src: string;
  alt: string;
  left: string;
  top: string;
  width: number;
  height: number;
}

export const stickyNotes: StickyNote[] = [
  {
    src: "/assets/about/notes/note-1.png",
    alt: "Gratitude note about appreciation",
    left: "740px",
    top: "0px",
    width: 248,
    height: 248,
  },
  {
    src: "/assets/about/notes/note-2.png",
    alt: "Gratitude note about connection",
    left: "523px",
    top: "90px",
    width: 248,
    height: 248,
  },
  {
    src: "/assets/about/notes/note-3.png",
    alt: "Gratitude note about reflection",
    left: "0px",
    top: "62px",
    width: 274,
    height: 274,
  },
  {
    src: "/assets/about/notes/note-4.png",
    alt: "Gratitude note about moments",
    left: "253px",
    top: "179px",
    width: 248,
    height: 248,
  },
  {
    src: "/assets/about/notes/note-5.png",
    alt: "Gratitude note about gratitude",
    left: "910px",
    top: "80px",
    width: 271,
    height: 271,
  },
];

export interface CircularPhoto {
  src: string;
  alt: string;
}

export const circularPhotos: CircularPhoto[] = [
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

export interface Profile {
  name: string;
  role: string;
  description: string;
  nameTracking: string;
  avatarSrc: string;
  socialLinks: SocialIcon[];
  variant: "default" | "reversed";
}

export const profiles: Profile[] = [
  {
    name: "Leon",
    role: "Logic - Data - Code",
    description:
      "I wire up the logic behind the screen, so every action quietly does the right thing.\n\nKeeping the magic from breaking.",
    nameTracking: "tracking-[4.32px]",
    avatarSrc: "/assets/images/photos/leon-photo.png",
    variant: "reversed",
    socialLinks: [
      {
        src: "/assets/about/icons/linkedin-icon.svg",
        alt: "LinkedIn",
        href: "https://www.linkedin.com/in/leon-rud/",
        ariaLabel: "Visit Leon's LinkedIn profile",
      },
      {
        src: "/assets/about/icons/github-icon.svg",
        alt: "GitHub",
        href: "https://github.com/Leon-Rud",
        ariaLabel: "Visit Leon's GitHub profile",
      },
      {
        src: "/assets/about/icons/mail-icon.svg",
        alt: "Email",
        href: "mailto:leonrud6@gmail.com",
        ariaLabel: "Send email to Leon",
      },
    ],
  },
  {
    name: "Aleksandra",
    role: "UX - Words - Visuals",
    description:
      "I shape the user journey, ensuring everything feels like a thoughtful interaction.\n\nMaking the experience feel human.",
    nameTracking: "tracking-[3.6px]",
    avatarSrc: "/assets/images/photos/sasha-photo.png",
    variant: "default",
    socialLinks: [
      {
        src: "/assets/about/icons/linkedin-icon.svg",
        alt: "LinkedIn",
        href: "https://www.linkedin.com/in/sashirud/",
        ariaLabel: "Visit Aleksandra's LinkedIn profile",
      },
      {
        src: "/assets/about/icons/mail-icon.svg",
        alt: "Email",
        href: "mailto:leonrud6@gmail.com",
        ariaLabel: "Send email to Aleksandra",
      },
    ],
  },
];
