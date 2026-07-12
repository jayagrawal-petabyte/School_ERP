import React, { useState, useEffect } from 'react';
import AppHeader from '../components/Header/AppHeader';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LeaveRequestService, LeaveRequest } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type LeaveRequestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LeaveRequest'
>;

interface Props {
  navigation: LeaveRequestScreenNavigationProp;
}

type TabType = 'form' | 'history';
const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Family Event', 'Other'];

export default function LeaveRequestScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  
  // Form States
  const [leaveType, setLeaveType] = useState<string>('Sick Leave');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // History States
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await LeaveRequestService.getLeaveRequests();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleSubmit = async () => {
    if (!startDate.trim() || !endDate.trim() || !reason.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in all fields before submitting.', [{ text: 'OK' }]);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await LeaveRequestService.submitLeaveRequest(
        leaveType,
        startDate,
        endDate,
        reason
      );

      if (result.success) {
        Alert.alert('Success', 'Your leave request has been submitted to your class teacher.', [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and switch tab
              setStartDate('');
              setEndDate('');
              setReason('');
              setActiveTab('history');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pending':
        return { bg: COLORS.lateLight, text: COLORS.late, border: 'rgba(247, 144, 9, 0.15)' };
      case 'approved':
        return { bg: COLORS.presentLight, text: COLORS.present, border: 'rgba(18, 183, 106, 0.15)' };
      case 'rejected':
        return { bg: COLORS.absentLight, text: COLORS.absent, border: 'rgba(240, 68, 56, 0.15)' };
      default:
        return { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const renderHistoryItem = ({ item }: { item: LeaveRequest }) => {
    const statusStyles = getStatusStyle(item.status);

    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLeaveType}>{item.leaveType}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyles.bg, borderColor: statusStyles.border }
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyles.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDateRange}>
          📅 {item.startDate} to {item.endDate}
        </Text>

        <Text style={styles.cardReason} numberOfLines={2}>
          {item.reason}
        </Text>

        <Text style={styles.requestedAt}>Requested: {item.requestedAt}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
  

<AppHeader
  title="Leave Request"
  showBackButton
/>

      <View style={styles.container}>

      {/* Tabs segment */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'form' && styles.tabButtonActive]}
          onPress={() => setActiveTab('form')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabLabel, activeTab === 'form' && styles.tabLabelActive]}>
            Apply Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'form' ? (
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Leave Type Select Row */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Leave Type</Text>
            <View style={styles.typeGrid}>
              {LEAVE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typePill,
                    leaveType === type && styles.typePillActive
                  ]}
                  onPress={() => setLeaveType(type)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typePillLabel, leaveType === type && styles.typePillLabelActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date range inputs */}
          <View style={styles.datesRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Start Date</Text>
              <TextInput
                style={styles.inputField}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>End Date</Text>
              <TextInput
                style={styles.inputField}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Reason textbox */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Reason for Leave</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Provide a detailed explanation..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={5}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.textLight} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Leave Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* History tab list */
        <View style={{ flex: 1 }}>
          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Fetching request logs...</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.historyList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No leave requests filed yet.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 safeContainer: {
  flex: 1,
  backgroundColor: COLORS.background,
},
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  formContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  formGroup: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 4,
  },
  typePill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  typePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typePillLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  typePillLabelActive: {
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHT.bold,
  },
  datesRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 42,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    height: 120,
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  historyList: {
    padding: SPACING.lg,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeaveType: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.bold,
  },
  cardDateRange: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: FONT_WEIGHT.medium,
  },
  cardReason: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  requestedAt: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
