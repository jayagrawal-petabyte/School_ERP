import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

import DrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          width: 290,
          backgroundColor: '#2D2C72',
        },
        headerStyle: {
          backgroundColor: '#2D2C72',
        },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#d9d9d9',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={HomeScreen}
      />

      <Drawer.Screen
        name="Attendance"
        component={AttendanceListScreen}
      />

      <Drawer.Screen
        name="Assignments"
        component={AssignmentListScreen}
      />

      <Drawer.Screen
        name="Profile"
        component={StudentProfileScreen}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
}