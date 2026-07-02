import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceReportsScreen from '../screens/AttendanceReportsScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import AssignmentDetailsScreen from '../screens/AssignmentDetailsScreen';
import SubmitAssignmentScreen from '../screens/SubmitAssignmentScreen';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  Home: undefined;
  AttendanceList: undefined;
  MarkAttendance: { classId: string; className: string };
  AttendanceHistory: { classId: string; className: string };
  AttendanceReports: { classId: string; className: string };
  AssignmentList: { classId: string; className: string };
  AssignmentDetails: { assignmentId: string };
  SubmitAssignment: { assignmentId: string; title: string; subject: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home Dashboard' }}
      />
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
      <Stack.Screen
        name="AssignmentList"
        component={AssignmentListScreen}
        options={{ title: 'Assignments' }}
      />
      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetailsScreen}
        options={{ title: 'Assignment Details' }}
      />
      <Stack.Screen
        name="SubmitAssignment"
        component={SubmitAssignmentScreen}
        options={{ title: 'Submit Assignment' }}
      />
    </Stack.Navigator>
  );
}

