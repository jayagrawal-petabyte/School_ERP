import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    fontSize: 22,
    marginRight: 12,
    color: colors.textPrimary,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});