import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AssignmentService, Assignment } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AssignmentDetailsScreenRouteProp = RouteProp<RootStackParamList, 'AssignmentDetails'>;
type AssignmentDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AssignmentDetails'
>;

interface Props {
  route: AssignmentDetailsScreenRouteProp;
  navigation: AssignmentDetailsScreenNavigationProp;
}

export default function AssignmentDetailsScreen({ route, navigation }: Props) {
  const { assignmentId } = route.params;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await AssignmentService.getAssignmentDetails(assignmentId);
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDetails();
    });
    return unsubscribe;
  }, [navigation, assignmentId]);

  const getStatusStyle = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return { bg: COLORS.absentLight, text: COLORS.absent, border: 'rgba(240, 68, 56, 0.15)' };
      case 'submitted':
        return { bg: COLORS.presentLight, text: COLORS.present, border: 'rgba(18, 183, 106, 0.15)' };
      case 'graded':
        return { bg: COLORS.festivalLight, text: COLORS.festival, border: 'rgba(46, 144, 250, 0.15)' };
      default:
        return { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Details...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Assignment not found.</Text>
      </View>
    );
  }

  const stylesStatus = getStatusStyle(assignment.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity style={styles.bellButton}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Assignment Details Block */}
        <View style={styles.detailCard}>
          <Text style={styles.subjectName}>{assignment.subject}</Text>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <Text style={styles.assignedBy}>Assigned by {assignment.assignedBy}</Text>

          {/* Grid Metadata Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>DUE DATE</Text>
              <Text style={styles.metaValue}>{assignment.dueDate}</Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>WEIGHTAGE</Text>
              <Text style={styles.metaValue}>{assignment.maxMarks} Marks</Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>STATUS</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: stylesStatus.bg, borderColor: stylesStatus.border }
                ]}
              >
                <Text style={[styles.statusText, { color: stylesStatus.text }]}>
                  {assignment.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description Section */}
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{assignment.description}</Text>
          </View>

          {/* Reference files */}
          <View style={styles.textSection}>
            <Text style={styles.sectionTitle}>Reference Files</Text>
            <View style={styles.attachmentBox}>
              <Text style={styles.attachmentIcon}>📄</Text>
              <View style={styles.attachmentTextCol}>
                <Text style={styles.attachmentName}>{assignment.subject}_Guidelines.pdf</Text>
                <Text style={styles.attachmentSize}>2.4 MB • PDF Document</Text>
              </View>
              <Text style={styles.downloadArrow}>↓</Text>
            </View>
          </View>
        </View>

        {/* Submission log or Grade Details */}
        {assignment.submission && (
          <View style={styles.submissionCard}>
            <Text style={styles.sectionTitle}>Your Submission</Text>
            
            <View style={styles.subRow}>
              <Text style={styles.subLabel}>Submitted At:</Text>
              <Text style={styles.subValue}>{assignment.submission.submittedAt}</Text>
            </View>

            <View style={styles.subRow}>
              <Text style={styles.subLabel}>Attached File:</Text>
              <View style={styles.fileBadge}>
                <Text style={styles.fileIcon}>📎</Text>
                <Text style={styles.fileNameText} numberOfLines={1}>{assignment.submission.fileName}</Text>
              </View>
            </View>

            <View style={styles.subNotesBox}>
              <Text style={styles.subNotesLabel}>Student Remarks:</Text>
              <Text style={styles.subNotesContent}>{assignment.submission.notes || 'No remarks provided.'}</Text>
            </View>

            {/* Grading results */}
            {assignment.status === 'graded' && (
              <View style={styles.gradeSection}>
                <View style={styles.divider} />
                <Text style={styles.gradeTitle}>Evaluation Result</Text>
                
                <View style={styles.gradeDisplayRow}>
                  <View style={styles.gradeCircle}>
                    <Text style={styles.gradeScoreNum}>{assignment.obtainedMarks}</Text>
                    <Text style={styles.gradeScoreMax}>/ {assignment.maxMarks}</Text>
                  </View>
                  
                  <View style={styles.feedbackCol}>
                    <Text style={styles.feedbackHeading}>Teacher's Feedback:</Text>
                    <Text style={styles.feedbackText}>
                      "{assignment.feedback || 'Good work.'}"
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Submit Button Bar */}
      {assignment.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() =>
              navigation.navigate('SubmitAssignment', {
                assignmentId: assignment.id,
                title: assignment.title,
                subject: assignment.subject,
              })
            }
          >
            <Text style={styles.submitBtnText}>Submit Assignment</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  customHeader: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellOutline: {
    width: 16,
    height: 18,
    alignItems: 'center',
  },
  bellCap: {
    width: 4,
    height: 2,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bellBody: {
    width: 14,
    height: 10,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginTop: 1,
  },
  bellClapper: {
    width: 6,
    height: 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 3,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  subjectName: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  assignedBy: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  metaBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metaLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  metaValue: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 8,
    fontWeight: FONT_WEIGHT.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  textSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  attachmentIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  attachmentTextCol: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  attachmentSize: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  downloadArrow: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    marginTop: SPACING.md,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  subValue: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  fileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 64, 84, 0.1)',
    maxWidth: '60%',
  },
  fileIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  fileNameText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  subNotesBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  subNotesLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  subNotesContent: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  gradeSection: {
    marginTop: SPACING.sm,
  },
  gradeTitle: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  gradeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.festival,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  gradeScoreNum: {
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.festival,
  },
  gradeScoreMax: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  feedbackCol: {
    flex: 1,
  },
  feedbackHeading: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  feedbackText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.absent,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
