import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});