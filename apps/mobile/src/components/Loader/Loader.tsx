import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import styles from './loader.styles';
import { colors } from '../../theme/colors';

const Loader = () => (
  <View style={styles.container}>
    <ActivityIndicator
      size="large"
      color={colors.primary}
    />
  </View>
);

export default Loader;