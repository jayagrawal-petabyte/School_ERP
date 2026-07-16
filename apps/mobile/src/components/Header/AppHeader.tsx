import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  showBackButton?: boolean;
};

export default function AppHeader({
  title,
  showBackButton = false,
}: Props) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#2F2D84" translucent />
      <View style={styles.statusBarBackdrop} />

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => {
          if (showBackButton) {
            navigation.goBack();
          } else {
            navigation.dispatch(DrawerActions.openDrawer());
          }
        }}
      >
        <Ionicons
          name={showBackButton ? 'arrow-back' : 'menu'}
          size={26}
          color="#fff"
        />
      </TouchableOpacity>

      <Text
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </Text>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => navigation.navigate('NotificationList')}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#2F2D84',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 5,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  iconBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBarBackdrop: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#2F2D84',
  },
});