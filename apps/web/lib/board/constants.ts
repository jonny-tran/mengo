export interface BoardColumnConfig {
  id: string;
  title: string;
}

export const DEFAULT_BOARD_COLUMNS: BoardColumnConfig[] = [
  { id: "todo", title: "To Do" },
  { id: "progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const BOARD_COLOR_VARIANTS = [
  {
    cardGradient:
      "from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10",
    cardBorder: "border-l-blue-500 dark:border-l-blue-400",
    headerBg:
      "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/50",
    badgeBg:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    cardGradient:
      "from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10",
    cardBorder: "border-l-amber-500 dark:border-l-amber-400",
    headerBg:
      "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-800/50",
    badgeBg:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    cardGradient:
      "from-emerald-50/80 via-green-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/10",
    cardBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    headerBg:
      "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-200/50 dark:border-emerald-800/50",
    badgeBg:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    cardGradient:
      "from-purple-50/80 via-violet-50/60 to-fuchsia-50/40 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-fuchsia-950/10",
    cardBorder: "border-l-purple-500 dark:border-l-purple-400",
    headerBg:
      "bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-purple-200/50 dark:border-purple-800/50",
    badgeBg:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  {
    cardGradient:
      "from-rose-50/80 via-pink-50/60 to-orange-50/40 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-orange-950/10",
    cardBorder: "border-l-rose-500 dark:border-l-rose-400",
    headerBg:
      "bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-200/50 dark:border-rose-800/50",
    badgeBg:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

export function createColumnId(label: string) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 6);
  return slug ? `${slug}-${suffix}` : `column-${suffix}`;
}

