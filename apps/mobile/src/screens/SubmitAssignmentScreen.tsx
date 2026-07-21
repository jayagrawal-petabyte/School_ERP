import React, { useState, useEffect } from 'react';
import AppHeader from '../components/Header/AppHeader';
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import assignmentApi from "../services/assignmentApi";
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type SubmitAssignmentScreenRouteProp = RouteProp<RootStackParamList, 'SubmitAssignment'>;
type SubmitAssignmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList,'SubmitAssignment'>;
interface Props {
  route: SubmitAssignmentScreenRouteProp;
  navigation: SubmitAssignmentScreenNavigationProp;
}

export default function SubmitAssignmentScreen({ route, navigation }: Props) {
  const { assignmentId, title, subject } = route.params;
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<{uri: string; name: string; type: string; size?: number; } | null>(null);
  const handleAddAttachment = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/*",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];

    setAttachedFile({
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/octet-stream",
      size: file.size,
    });
  } catch (error) {
    if (__DEV__){
      console.log(error);
      Alert.alert("Unable to select file","Please try again.");
    }
  }
  };

  const handleRemoveAttachment = () => {
  setAttachedFile(null);
  };

  const handleSubmit = async () => {
  if (!attachedFile) {
    Alert.alert(
      "Attachment Required",
      "Please attach your assignment file before submitting."
    );
    return;
  }
  setIsSubmitting(true);
  try {
    await assignmentApi.submitAssignment(
      assignmentId,
      notes,
      attachedFile
    );
    Alert.alert(
      "Success",
      "Assignment submitted successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  } catch (error) {
    if (__DEV__) {
      console.error("Error submitting assignment:", error);
    }
    Alert.alert("Submission Failed", "Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
    

<AppHeader
  title="Submit Assignment"
  showBackButton
/>

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
          
          {!attachedFile && (
            <TouchableOpacity
                style={styles.uploadTrigger}
                onPress={handleAddAttachment}
                activeOpacity={0.7}>
            <Text style={styles.uploadIcon}>📎</Text>
            <Text style={styles.uploadText}>Attach Document (PDF, Word, or JPG)</Text>
            </TouchableOpacity>
            )}

          {attachedFile && (
            <View style={styles.attachedCard}>
              <Text style={styles.fileIcon}>📄</Text>
              <View style={styles.fileTextCol}>
                <Text style={styles.fileName}>{attachedFile?.name}</Text>
                <Text style={styles.fileSize}>{attachedFile?.size? `${(attachedFile.size / 1024 / 1024).toFixed(2)} MB`: ""}</Text>
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
          disabled={!attachedFile || isSubmitting}>
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
