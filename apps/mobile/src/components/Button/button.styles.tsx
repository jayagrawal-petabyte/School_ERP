import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.secondary,
  },

  danger: {
    backgroundColor: colors.absent,
  },

  disabled: {
    backgroundColor: colors.border,
  },

  text: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});