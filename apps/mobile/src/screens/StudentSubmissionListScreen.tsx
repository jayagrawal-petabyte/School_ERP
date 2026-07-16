import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type StudentSubmissionListRouteProp = RouteProp<RootStackParamList, "StudentSubmissionList">;
type StudentSubmissionListNavigationProp = NativeStackNavigationProp<RootStackParamList, "StudentSubmissionList">;
interface Props {
  route: StudentSubmissionListRouteProp;
  navigation: StudentSubmissionListNavigationProp;
}
interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  status: "Submitted" | "Late" | "Pending";
  marks?: number;
  remarks?: string;
  attachment?: {
    name: string;
    url?: string;
    size?: number;
  };
}

export default function StudentSubmissionListScreen({route, navigation,}: Props) {
    const { assignmentId } = route.params;
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const response = await assignmentApi.getAssignmentSubmissions(assignmentId);
            const formattedSubmissions = response.map((item: any) => ({
              id: item.id,
              studentId: item.studentId,
              studentName: item.studentName || item.student?.name || "Unknown Student",
              rollNumber: item.rollNumber || item.student?.rollNumber || "-",
              submittedAt: item.submittedAt || item.submitted_at,
              status: item.status === "late" ? "Late" : item.status === "submitted" ? "Submitted" : "Pending",
              marks: item.marks,
              remarks: item.notes,
              attachment: item.fileName || item.file_name ? {
                  name: item.fileName || item.file_name,
                  url: item.fileUrl || item.file_url,
                  size: item.fileSize || item.file_size,
              } : undefined,
            }));
            setSubmissions(response);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Unable to load submissions.");
        } finally {
            setLoading(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadSubmissions();
        setRefreshing(false);
    };
    useEffect(() => {loadSubmissions();}, [assignmentId]);
    const handleDownload = async (submissionId: string) => {
        try {
            await assignmentApi.downloadSubmission(submissionId);
            Alert.alert("Success", "Download started.");
        } catch (error) {
            Alert.alert("Error", "Unable to download submission.");
        }
    };
    const handleViewSubmission = (item: StudentSubmission) => {
        Alert.alert("Submission", `Student: ${item.studentName} Remarks: ${item.remarks || "No remarks provided."}`);
    };
    const handleGrade = (item: StudentSubmission) => {
        navigation.navigate("GradeSubmission", {submissionId: item.id, submission: item,});
    };
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
                <Text style={styles.loadingText}>Loading submissions...</Text>
            </SafeAreaView>
        );
    }
    if (!loading && submissions.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No submissions found.</Text>
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
            <Text style={styles.headerTitle}>Student Submissions</Text>
            <View style={{ width: 38 }} /></View>
            
            <FlatList 
            data={submissions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
            <View style={styles.card}>
                <View style={styles.topRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.studentName.charAt(0)}</Text>
                    </View>
                    <View style={styles.infoSection}>
                        <Text style={styles.studentName}>{item.studentName}</Text>
                        <Text style={styles.rollNumber}>Roll No. {item.rollNumber}</Text>
                    </View>
                    <View style={[styles.statusBadge, item.status === "Submitted" ? styles.submittedBadge : item.status === "Late" ? styles.lateBadge : styles.pendingBadge,]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Submitted On</Text>
                        <Text style={styles.detailValue}>{item.submittedAt}</Text>
                    </View> 
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Marks</Text>
                        <Text style={styles.detailValue}>{item.marks ?? "-"}</Text>
                    </View>
                </View>
                {item.attachment && (
                    <View style={styles.attachmentCard}>
                        <View>
                            <Text style={styles.fileName}>{item.attachment.name}</Text>
                            <Text style={styles.fileSubtitle}>{item.attachment?.size? `${(item.attachment.size / 1024).toFixed(1)} KB` : "Submitted File"}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDownload(item.id)}>
                            <Text style={styles.downloadText}>Download</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => handleViewSubmission(item)}>
                        <Text style={styles.secondaryButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => handleGrade(item)}>
                        <Text style={styles.primaryButtonText}>Grade</Text>
                    </TouchableOpacity>

                </View>

            </View>
            )}/>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },

    listContent: {
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

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },

    avatarText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
    },

    infoSection: {
        flex: 1,
    },

    studentName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },

    rollNumber: {
        marginTop: 4,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },

    statusBadge: {
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        alignItems: "center",
        justifyContent: "center",
    },

    submittedBadge: {
        backgroundColor: "#E8F5E9",
    },

    lateBadge: {
        backgroundColor: "#FFF3E0",
    },

    pendingBadge: {
        backgroundColor: "#FBE9E7",
    },

    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },

    detailsContainer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
        marginTop: SPACING.sm,
    },

    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.sm,
    },

    detailLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    detailValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
    },

    attachmentCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        padding: SPACING.md,
        marginTop: SPACING.md,
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

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: SPACING.lg,
        gap: SPACING.md,
    },

    primaryButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center", ...SHADOWS.sm,
    },

    primaryButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },

    secondaryButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center",
    },

    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },
});

