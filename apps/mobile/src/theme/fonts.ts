export const fonts = {
  families: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type FontsType = typeof fonts;
