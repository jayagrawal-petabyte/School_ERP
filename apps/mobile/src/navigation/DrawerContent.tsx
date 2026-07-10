import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function DrawerContent(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#2D2C72' }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏫</Text>

          <Text style={styles.title}>
            School ERP
          </Text>

          <Text style={styles.subtitle}>
            Parent Portal
          </Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <View style={styles.profile}>
          <Text style={styles.avatar}>P</Text>

          <View>
            <Text style={styles.name}>
              Parent
            </Text>

            <Text style={styles.role}>
              Guardian
            </Text>
          </View>
        </View>

        <Text style={styles.logout}>
          Sign Out
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
  },

  logo: {
    fontSize: 34,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },

  subtitle: {
    color: '#ddd',
    marginTop: 4,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: '#555',
    padding: 20,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '700',
    marginRight: 10,
  },

  name: {
    color: '#fff',
    fontWeight: '700',
  },

  role: {
    color: '#ddd',
  },

  logout: {
    color: '#fff',
    marginTop: 20,
    fontWeight: '600',
  },
});