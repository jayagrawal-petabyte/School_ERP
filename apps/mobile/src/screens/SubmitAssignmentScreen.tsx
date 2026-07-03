import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AssignmentService } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type SubmitAssignmentScreenRouteProp = RouteProp<RootStackParamList, 'SubmitAssignment'>;
type SubmitAssignmentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SubmitAssignment'
>;

interface Props {
  route: SubmitAssignmentScreenRouteProp;
  navigation: SubmitAssignmentScreenNavigationProp;
}

export default function SubmitAssignmentScreen({ route, navigation }: Props) {
  const { assignmentId, title, subject } = route.params;

  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // File upload simulation states
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Simulated upload progress timer
  useEffect(() => {
    let interval: any;
    if (isUploading) {
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setAttachedFile(`${subject.replace(/\s+/g, '_')}_Submission.pdf`);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isUploading]);

  const handleAddAttachment = () => {
    setUploadProgress(0);
    setIsUploading(true);
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!attachedFile) {
      Alert.alert('Attachment Required', 'Please attach your assignment file before submitting.', [
        { text: 'OK' },
      ]);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await AssignmentService.submitAssignment(
        assignmentId,
        notes,
        attachedFile
      );

      if (response.success) {
        Alert.alert('Success', 'Assignment submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Work</Text>
        <TouchableOpacity style={styles.bellButton}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.subjectText}>{subject}</Text>
          <Text style={styles.assignmentTitle}>{title}</Text>
        </View>

        {/* Notes Input block */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Remarks for Teacher</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add notes or write remarks here..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Attachment Card */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>Attachment</Text>
          
          {!attachedFile && !isUploading && (
            <TouchableOpacity style={styles.uploadTrigger} onPress={handleAddAttachment} activeOpacity={0.7}>
              <Text style={styles.uploadIcon}>📎</Text>
              <Text style={styles.uploadText}>Attach Document (PDF, Word, or JPG)</Text>
            </TouchableOpacity>
          )}

          {isUploading && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Uploading file... {uploadProgress}%</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          )}

          {attachedFile && !isUploading && (
            <View style={styles.attachedCard}>
              <Text style={styles.fileIcon}>📄</Text>
              <View style={styles.fileTextCol}>
                <Text style={styles.fileName}>{attachedFile}</Text>
                <Text style={styles.fileSize}>1.8 MB • PDF Document</Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveAttachment}>
                <Text style={styles.removeIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Submission Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!attachedFile || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!attachedFile || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Assignment</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  subjectText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  formGroup: {
    gap: SPACING.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
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
  uploadTrigger: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  uploadIcon: {
    fontSize: 20,
  },
  uploadText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  attachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
  },
  fileIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  fileTextCol: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  fileSize: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  removeIcon: {
    fontSize: 16,
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
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
