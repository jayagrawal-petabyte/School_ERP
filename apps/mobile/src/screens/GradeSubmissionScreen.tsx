import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type GradeSubmissionRouteProp = RouteProp<RootStackParamList,"GradeSubmission">;
type GradeSubmissionNavigationProp = NativeStackNavigationProp<RootStackParamList,"GradeSubmission">;
interface Props {
  route: GradeSubmissionRouteProp;
  navigation: GradeSubmissionNavigationProp;
}
interface SubmissionDetails {
  id: string;
  studentName: string;
  rollNumber: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
  remarks?: string;
  attachment?: {
    name: string;
    url?: string;
  };
  maxMarks: number;
  obtainedMarks?: number;
  teacherFeedback?: string;
}

export default function GradeSubmissionScreen({route, navigation,}: Props) {
    const { submissionId } = route.params;
    const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
    const [marks, setMarks] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadSubmission = async () => {
  setLoading(true);

  await new Promise(resolve => setTimeout(resolve, 300));

  const response: SubmissionDetails = {
    id: submissionId,
    studentName: "Rahul Sharma",
    rollNumber: "01",
    assignmentTitle: "Mathematics Assignment",
    submittedAt: "10 Jul 2026",
    status: "Submitted",
    remarks: "Please check my assignment.",
    attachment: {
      name: "Rahul_Assignment.pdf",
    },
    maxMarks: 100,
    obtainedMarks: 92,
    teacherFeedback: "Excellent work.",
  };

  setSubmission(response);
  setMarks(response.obtainedMarks.toString());
  setFeedback(response.teacherFeedback ?? "");

  setLoading(false);
};

    useEffect(() => {loadSubmission();}, [submissionId]);

    const handleDownload = async () => {
        if (!submission) return;
        try {
            await assignmentApi.downloadSubmission(submission.id);
            Alert.alert("Success", "Download started.");
        } catch (error) {
            Alert.alert("Error", "Unable to download file.");
        }
    };

    const handleSubmit = async () => {
        if (!submission) return;
        if (!marks.trim()) {
            Alert.alert("Validation", "Please enter marks.");
            return;
        }
        const numericMarks = Number(marks);
        if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > submission.maxMarks) {
            Alert.alert("Validation", `Marks should be between 0 and ${submission.maxMarks}.`);
            return;
        }
        try {
            setSubmitting(true);
            await assignmentApi.gradeSubmission(submission.id, numericMarks, feedback); //Backend API not supported for Grading yet
            Alert.alert("Success", "Submission graded successfully.");
            navigation.goBack();
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Unable to submit grade.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
                <Text style={styles.loadingText}>Loading submission...</Text>
            </SafeAreaView>
        );
    }
    if (!submission) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Submission not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
            <View style={styles.customHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Grade Submission</Text>
                <View style={{ width: 40 }} /></View>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Student Details</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{submission.studentName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Roll Number</Text>
                            <Text style={styles.infoValue}>{submission.rollNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Assignment</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Title</Text>
                            <Text style={styles.infoValue}>{submission.assignmentTitle}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Submitted On</Text>
                            <Text style={styles.infoValue}>{submission.submittedAt}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={styles.infoValue}>{submission.status}</Text>
                        </View>

                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Student Remarks</Text>
                        <Text style={styles.description}>{submission.remarks ? submission.remarks : "No remarks provided."}</Text>

                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Submitted File</Text>
                        {submission.attachment ? (
                            <TouchableOpacity style={styles.fileCard} onPress={handleDownload}>
                                <View>
                                    <Text style={styles.fileName}>{submission.attachment.name}</Text>
                                    <Text style={styles.fileSubtitle}>Tap to download</Text>
                                </View>
                                <Text style={styles.downloadText}>Download</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.noFileText}>No file submitted.</Text>
                        )}

                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Marks</Text>
                        <TextInput 
                        style={styles.input}
                        keyboardType="numeric"
                        value={marks}
                        onChangeText={setMarks}
                        placeholder={`Out of ${submission.maxMarks}`}
                        placeholderTextColor={COLORS.textSecondary}/>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Teacher Feedback</Text>
                        <TextInput
                            style={styles.feedbackInput}
                            multiline
                            value={feedback}
                            onChangeText={setFeedback}
                            placeholder="Enter your feedback..."
                            placeholderTextColor={COLORS.textSecondary}
                            textAlignVertical="top"/>
                    </View>
                    <TouchableOpacity style={[styles.submitButton, submitting && styles.submitButtonDisabled,]} disabled={submitting} onPress={handleSubmit}>
                        {submitting ? (
                            <ActivityIndicator color="#FFFFFF"/>
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Grade</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },

    content: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },

    backButton: {
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 19,
    },

    backButtonText: {
        fontSize: 22,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.bold,
    },

    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border, ...SHADOWS.sm,
    },

    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
    },

    infoLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    infoValue: {
        flex: 1,
        textAlign: "right",
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
        marginLeft: SPACING.md,
    },

    description: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },

    input: {
        height: 50,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
    },

    feedbackInput: {
        minHeight: 120,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        textAlignVertical: "top",
    },

    fileCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: SPACING.md,
    },

    fileName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.semibold,
        color: COLORS.textPrimary,
    },

    fileSubtitle: {
        marginTop: 4,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },

    downloadText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },

    noFileText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: SPACING.sm,
    },

    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SPACING.md,
        marginTop: SPACING.md,
        marginBottom: SPACING.xl, ...SHADOWS.sm,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
});