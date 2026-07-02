import { colors } from './colors';
import { fonts } from './fonts';
import { spacing } from './spacing';
import { typography } from './typography';

export const shadows = {
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const theme = {
  colors,
  fonts,
  spacing,
  typography,
  shadows,
};

export { colors } from './colors';
export { fonts } from './fonts';
export { spacing } from './spacing';
export { typography } from './typography';

export type ThemeType = typeof theme;
