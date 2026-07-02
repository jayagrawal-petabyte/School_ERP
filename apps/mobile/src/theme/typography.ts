import { fonts } from './fonts';

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  presets: {
    h1: {
      fontSize: 30,
      fontWeight: fonts.weights.bold,
    },
    h2: {
      fontSize: 24,
      fontWeight: fonts.weights.semibold,
    },
    h3: {
      fontSize: 20,
      fontWeight: fonts.weights.semibold,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: fonts.weights.regular,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: fonts.weights.regular,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: fonts.weights.regular,
    },
    buttonLarge: {
      fontSize: 16,
      fontWeight: fonts.weights.semibold,
    },
    buttonMedium: {
      fontSize: 14,
      fontWeight: fonts.weights.semibold,
    },
  },
};

export type TypographyType = typeof typography;
