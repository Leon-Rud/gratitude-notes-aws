/**
 * Shared design constants for the application.
 * These complement the Tailwind design tokens in tailwind.config.cjs
 */

/** Card shadow used across note cards (NoteCard, AddNoteCard, NoteFormCard) */
export const CARD_SHADOW =
  "shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]";

/** Hover effect for interactive gallery items (scale up on hover) */
export const HOVER_SCALE_EFFECT =
  "cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110";
