import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { getToken } from '../utils/security';

import HomeScreen from '../screens/HomeScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import TeacherProfileScreen from '../screens/TeacherProfileScreen';
import ParentProfileScreen from '../screens/ParentProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StudentResultsScreen from '../screens/StudentResults';
import LeaveRequestScreen from '../screens/LeaveRequestScreen';
import ReportCardScreen from '../screens/ReportCard';

import DrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

function AttendanceScreenWrapper({ route, navigation }: any) {
  const [role, setRole] = useState<'teacher' | 'student' | 'parent' | null>(null);

  useEffect(() => {
    async function loadRole() {
      const savedRole = await getToken('user_role');
      if (savedRole === 'teacher' || savedRole === 'student' || savedRole === 'parent') {
        setRole(savedRole);
      }
    }
    loadRole();
  }, []);

  if (role === null) {
    return null;
  }

  if (role === 'teacher') {
    return <Drawer.Screen
  name="Attendance"
  component={AttendanceListScreen}
/>
  } else {
    return <AttendanceHistoryScreen route={route} navigation={navigation} />;
  }
}

export default function DrawerNavigator() {
  const route: any = useRoute();
  const [role, setRole] = useState<'teacher' | 'student' | 'parent'>(
    route?.params?.initialRole || 'student'
  );

  useEffect(() => {
    async function loadRole() {
      const savedRole = await getToken('user_role');
      if (savedRole === 'teacher' || savedRole === 'student' || savedRole === 'parent') {
        setRole(savedRole as any);
      }
    }
    loadRole();
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props: any) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
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
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="Attendance"
        component={AttendanceScreenWrapper}
        initialParams={route.params}
      />

      <Drawer.Screen
        name="Assignments"
        component={AssignmentListScreen as any}
      />

      <Drawer.Screen
        name="Results"
        component={StudentResultsScreen as any}
      />

      <Drawer.Screen
        name="Report Card"
        component={ReportCardScreen as any}
      />

      <Drawer.Screen
        name="Leave"
        component={LeaveRequestScreen as any}
      />

      <Drawer.Screen
        name="Profile"
        component={
          role === 'teacher'
            ? TeacherProfileScreen
            : role === 'parent'
            ? ParentProfileScreen
            : StudentProfileScreen as any
        }
        initialParams={route.params}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Drawer.Navigator>
  );
}