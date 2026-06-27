import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceReportsScreen from '../screens/AttendanceReportsScreen';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  AttendanceList: undefined;
  MarkAttendance: { classId: string; className: string };
  AttendanceHistory: { classId: string; className: string };
  AttendanceReports: { classId: string; className: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AttendanceList"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="AttendanceList"
        component={AttendanceListScreen}
        options={{ title: 'Attendance Dashboard' }}
      />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={({ route }) => ({ title: `Mark - ${route.params.className}` })}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={({ route }) => ({ title: `History - ${route.params.className}` })}
      />
      <Stack.Screen
        name="AttendanceReports"
        component={AttendanceReportsScreen}
        options={({ route }) => ({ title: `Reports - ${route.params.className}` })}
      />
    </Stack.Navigator>
  );
}
