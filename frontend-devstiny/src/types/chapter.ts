export type ChapterStatus = "completed" | "active" | "locked";

export interface Chapter {
  id: number;
  label: string;       // e.g. "PROLOGUE", "CHAPTER 1"
  title: string;       // e.g. "THE AWAKENING"
  type: string;        // e.g. "STORY", "HTML"
  typeColor: string;
  typeBg: string;
  accentColor: string; // Tailwind text color for icon/title highlight
  icon: string;
  image?: string;
  story: string;       // narrative description
  skills: string[];
  xp: number;
  gold: number;
  duration: string;
  status: ChapterStatus;
  btnClass: string;
  href?: string;
}
