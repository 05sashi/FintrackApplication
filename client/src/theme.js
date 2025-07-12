// src/theme.js
export const theme = {
  light: {
    background: 'bg-[#F7F9F9]', // Off-white
    foreground: 'bg-white',
    text: 'text-gray-800',
    subtext: 'text-gray-500',
    primary: 'text-[#19456B]', // Deep Navy
    accent: 'bg-[#19456B]', // Deep Navy
    accentHover: 'hover:bg-[#112d4e]',
    input: 'bg-gray-100 border-gray-300 focus:ring-[#19456B]',
    card: 'bg-white',
    shadow: 'shadow-xl',
    income: 'text-green-600',
    expense: 'text-red-600',
  },
  dark: {
    background: 'bg-[#0F172A]', // Deep Navy/Slate
    foreground: 'bg-[#1E293B]', // Lighter Slate
    text: 'text-gray-200',
    subtext: 'text-gray-400',
    primary: 'text-[#38BDF8]', // Sky Blue
    accent: 'bg-[#0EA5E9]', // Brighter Sky Blue
    accentHover: 'hover:bg-[#0284C7]',
    input: 'bg-[#334155] border-gray-600 focus:ring-[#38BDF8]',
    card: 'bg-[#1E293B]/80 backdrop-blur-sm border border-white/10', // Glassmorphism
    shadow: 'shadow-2xl shadow-sky-500/10',
    income: 'text-green-400',
    expense: 'text-red-400',
  },
};

export const gradients = {
  header: 'bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text',
  background: 'bg-gradient-to-br from-[#0F172A] via-[#0c1b33] to-[#1a0e29]',
};