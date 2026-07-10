import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StudentResultsScreen from '../screens/StudentResults';
import LeaveRequestScreen from '../screens/LeaveRequestScreen';
import ReportCardScreen from '../screens/ReportCard';

import DrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const route: any = useRoute();

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props: any) => <DrawerContent {...props} />}
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
        component={HomeScreen as any}
        initialParams={route.params}
        options={{
          title: 'Dashboard',
        }}
      />

      <Drawer.Screen
        name="Attendance"
        component={AttendanceListScreen}
      />

      <Drawer.Screen
        name="Assignments"
        component={AssignmentListScreen as any}
      />

      <Drawer.Screen
        name="Results"
        component={StudentResultsScreen}
      />

      <Drawer.Screen
        name="Report Card"
        component={ReportCardScreen}
      />

      <Drawer.Screen
        name="Leave"
        component={LeaveRequestScreen}
      />

      <Drawer.Screen
        name="Profile"
        component={StudentProfileScreen as any}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
}