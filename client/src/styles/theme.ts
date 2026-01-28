export const THEME = {
  font: {
    black: "font-black uppercase tracking-wider",
    bold: "font-bold",
    light: "font-medium text-brand-muted",
    mini: "text-[10px] font-black uppercase tracking-widest",
  },

  grid: "duo-grid",

  card: "duo-card",
  cardPrimary: "duo-card-primary",

  section: "p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8",

  input: `
    w-full bg-brand-bg border-2 border-brand-border
    rounded-xl px-4 py-3 outline-none
    focus:bg-white focus:border-brand-primary
    text-brand-text font-semibold transition-all
  `,

  buttonPrimary: "duo-btn-primary",
  buttonSecondary: `
    bg-white border-2 border-brand-border border-b-4
    text-brand-muted hover:text-brand-primary
    px-6 py-3 rounded-xl font-black uppercase text-[10px]
    tracking-widest transition-all
    active:translate-y-1 active:border-b-0
  `,
};
