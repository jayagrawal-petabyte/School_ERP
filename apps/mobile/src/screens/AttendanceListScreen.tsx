import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/Header/AppHeader';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, ClassInfo } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AttendanceListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttendanceList'
>;

interface Props {
  navigation: AttendanceListScreenNavigationProp;
}

export default function AttendanceListScreen({ navigation }: Props) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await AttendanceService.getClasses();
        const classesWithCounts = await Promise.all(
          data.map(async (cls) => {
            const students = await AttendanceService.getStudents(cls.id);
            return {
              ...cls,
              studentCount: students.length,
            };
          })
        );
        setClasses(classesWithCounts);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const renderClassItem = ({ item }: { item: ClassInfo }) => {
    const classNameFull = `${item.name} - ${item.section}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.studentCount} Students</Text>
          </View>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.sectionName}>Division - {item.section}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('MarkAttendance', {
                classId: item.id,
                className: classNameFull,
              })
            }
          >
            <Text style={styles.primaryBtnText}>Mark Attendance</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                navigation.navigate('AttendanceHistory', {
                  classId: item.id,
                  className: classNameFull,
                })
              }
            >
              <Text style={styles.secondaryBtnText}>History Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                navigation.navigate('AttendanceReports', {
                  classId: item.id,
                  className: classNameFull,
                })
              }
            >
              <Text style={styles.secondaryBtnText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar barStyle="light-content" backgroundColor="#2F2D84" />

<AppHeader title="Attendance" />

<View style={styles.dashboardSummary}>
  <Text style={styles.academicsTitle}>Academics</Text>
  <Text style={styles.academicsSub}>
    Select standard division to manage attendance module
  </Text>
</View>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderClassItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },

 
  dashboardSummary: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  academicsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  academicsSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    marginBottom: SPACING.md,
  },
  className: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  actionsContainer: {
    gap: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
