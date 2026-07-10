import React from 'react';
import { Alert } from 'react-native';
import { clearAllTokens } from '../utils/security';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';

export default function DrawerContent(props: any) {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="school"
            size={42}
            color="#fff"
          />

          <Text style={styles.title}>School ERP</Text>

          <Text style={styles.subtitle}>Parent Portal</Text>
        </View>

        <DrawerItem
          label="Dashboard"
          icon={() => (
            <MaterialCommunityIcons
              name="view-dashboard"
              size={22}
              color="#fff"
            />
          )}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Dashboard')}
        />

        <DrawerItem
          label="Attendance"
          icon={() => (
            <MaterialIcons
              name="fact-check"
              size={22}
              color="#fff"
            />
          )}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Attendance')}
        />

        <DrawerItem
          label="Assignments"
          icon={() => (
            <Ionicons
              name="document-text"
              size={22}
              color="#fff"
            />
          )}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Assignments')}
        />

        <DrawerItem
          label="Profile"
          icon={() => (
            <FontAwesome5
              name="user-circle"
              size={20}
              color="#fff"
            />
          )}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Profile')}
        />

        <DrawerItem
          label="Settings"
          icon={() => (
            <Ionicons
              name="settings"
              size={22}
              color="#fff"
            />
          )}
          labelStyle={styles.label}
          onPress={() => props.navigation.navigate('Settings')}
        />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>P</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Parent</Text>
          <Text style={styles.role}>Guardian</Text>
        </View>

       <MaterialIcons
  name="logout"
  size={24}
  color="#fff"
  onPress={() => {
    Alert.alert(
      'Sign Out',
      'Do you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            await clearAllTokens();
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  }}
/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2D84',
  },

  header: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },

  subtitle: {
    color: '#d7d7d7',
    marginTop: 4,
  },

  label: {
    color: '#fff',
    fontSize: 16,
    marginLeft: -10,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#4d4ba3',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#2F2D84',
    fontWeight: '700',
    fontSize: 18,
  },

  name: {
    color: '#fff',
    fontWeight: '700',
  },

  role: {
    color: '#ddd',
    fontSize: 12,
  },
});