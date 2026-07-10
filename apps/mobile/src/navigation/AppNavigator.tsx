import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import AttendanceListScreen from '../screens/AttendanceListScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceReportsScreen from '../screens/AttendanceReportsScreen';
import AssignmentListScreen from '../screens/AssignmentListScreen';
import AssignmentDetailsScreen from '../screens/AssignmentDetailsScreen';
import SubmitAssignmentScreen from '../screens/SubmitAssignmentScreen';
import LeaveRequestScreen from '../screens/LeaveRequestScreen';
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import NewPasswordScreen from '../screens/Auth/NewPasswordScreen';
import PasswordSuccessScreen from '../screens/Auth/PasswordSuccessScreen';
import MFAScreen from '../screens/Auth/MFAScreen';
import DashboardScreen from '../screens/Auth/DashboardScreen';
import ReportCardScreen from '../screens/ReportCard';
import StudentResultsScreen from '../screens/StudentResults';
import TeacherMarksEntryScreen from '../screens/TeacherMarksEntry';
import { RootStackParamList } from './types';
export { RootStackParamList };
import { theme } from '../theme';
import TeacherProfileScreen from '../screens/TeacherProfileScreen';
import ParentProfileScreen from '../screens/ParentProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
        orientation: 'portrait',
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: theme.fonts.weights.semibold,
          fontSize: theme.typography.sizes.md,
        },
        headerShadowVisible: false,
      }}
    >
      {/* Authentication screens */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="PasswordSuccess" component={PasswordSuccessScreen} />
      <Stack.Screen name="MFA" component={MFAScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Main app screens */}
      <Stack.Screen
  name="Home"
  component={DrawerNavigator}
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="AttendanceList"
        component={AttendanceListScreen}
        options={{ title: 'Attendance Dashboard' }}
      />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={({ route }) => ({ 
          title: `Mark - ${route.params.className}`,
          animation: 'slide_from_bottom',
        })}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={({ route }) => ({ 
          title: `History - ${route.params.className}`,
        })}
      />
      <Stack.Screen
        name="AttendanceReports"
        component={AttendanceReportsScreen}
        options={({ route }) => ({ 
          title: `Reports - ${route.params.className}`,
        })}
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
      <Stack.Screen
        name="LeaveRequest"
        component={LeaveRequestScreen}
        options={{ title: 'Apply Leave' }}
      />
      <Stack.Screen
        name="ReportCard"
        component={ReportCardScreen}
        options={{ title: 'Report Card' }}
      />
      <Stack.Screen
        name="StudentResults"
        component={StudentResultsScreen}
        options={{ title: 'Results' }}
      />
      <Stack.Screen
        name="TeacherMarksEntry"
        component={TeacherMarksEntryScreen}
        options={{ title: 'Marks Entry' }}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="TeacherProfile"
        component={TeacherProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="ParentProfile"
        component={ParentProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

