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
  Platform,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type TeacherAssignmentDetailsRouteProp = RouteProp<RootStackParamList,"TeacherAssignmentDetails">;
type TeacherAssignmentDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList,"TeacherAssignmentDetails">;
interface Props {
  route: TeacherAssignmentDetailsRouteProp;
  navigation: TeacherAssignmentDetailsNavigationProp;
}
interface AssignmentDetails {id: string; title: string; subject: string; className: string; description: string; dueDate: string; maxMarks: number; submittedStudents: number; totalStudents: number; referenceFile?: {name: string; url?: string;};}

export default function TeacherAssignmentDetailsScreen({route, navigation,}: Props) {
    const { assignmentId } = route.params;
    const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const loadAssignment = async()=>{
        try{
            setLoading(true);
            const response = await assignmentApi.getAssignment(assignmentId);
const details: AssignmentDetails = {
    id: response.id,
    title: response.title,
    subject: response.subject,
    className: response.className ?? "-",
    description: response.description ?? "",
    dueDate: response.dueDate,
    maxMarks: response.maxMarks ?? 0,
    submittedStudents: response.submittedStudents ?? 0,
    totalStudents: response.totalStudents ?? 0,
    referenceFile: response.referenceFile,
};

setAssignment(details);
        }catch(error){
            console.log(error);
            Alert.alert("Error", "Unable to load assignment.");
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
    loadAssignment();}, [assignmentId]);

    const handleDelete = ()=>{
        Alert.alert("Delete Assignment", "Are you sure you want to delete this assignment?",[{
            text:"Cancel", style:"cancel"}, {text:"Delete", style:"destructive", onPress:async()=>{
                try{
                    setDeleting(true);
                    await assignmentApi.deleteAssignment(assignmentId);
                    Alert.alert("Success", "Assignment deleted successfully.");
                    navigation.goBack();
                }catch(error){
                    console.log(error);
                    Alert.alert("Error", "Unable to delete assignment.");
                }finally{
                    setDeleting(false);
                }
            }}
        ]);
    };

    const handleDownload = async () => {
      if (!assignment?.referenceFile) {
        Alert.alert("No File", "No reference material available.");
        return;
      }
      try {
        await assignmentApi.downloadReferenceMaterial(assignment.id);
      } catch (error) {
        Alert.alert("Error", "Unable to download reference material.");
      }
    };

    const submissionPercentage = assignment && assignment.totalStudents > 0 ? Math.round((assignment.submittedStudents / assignment.totalStudents) * 100) : 0;
    const handleViewSubmissions = ()=>{
        navigation.navigate("StudentSubmissionList",{assignmentId});
    };
    const handleEdit = ()=>{navigation.navigate("CreateAssignment");};
    if (loading) {
        return (
        <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
            <Text style={styles.loadingText}>Loading assignment...</Text>
        </SafeAreaView>);
    }
    
    if (!assignment) {
        return (
        <SafeAreaView style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Assignment not found.</Text>
        </SafeAreaView>);
    }

    return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
        <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment Details</Text>
        <View style={{ width: 40 }} /></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.subjectBadge}>
                    <Text style={styles.subjectBadgeText}>{assignment?.subject}</Text>
                </View>
                <Text style={styles.assignmentTitle}>{assignment?.title}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Class</Text>
                    <Text style={styles.infoValue}>{assignment?.className}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Due Date</Text>
                    <Text style={styles.infoValue}>{assignment?.dueDate}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Maximum Marks</Text>
                    <Text style={styles.infoValue}>{assignment?.maxMarks}</Text>
                </View>

            </View>
        
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{assignment?.description}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Reference Material</Text>
                {assignment?.referenceFile ? (
                    <TouchableOpacity style={styles.referenceCard} onPress={handleDownload}>
                        <View>
                            <Text style={styles.fileName}>{assignment.referenceFile.name}</Text>
                            <Text style={styles.downloadLabel}>Tap to download</Text>
                        </View>
                        <Text style={styles.downloadIcon}>⬇</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.noFileText}>No reference material uploaded.</Text>
                )}
            </View>
            
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Submission Summary</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryNumber}>{assignment?.submittedStudents}</Text>
                        <Text style={styles.summaryLabel}>Submitted</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryNumber}>{(assignment?.totalStudents ?? 0) - (assignment?.submittedStudents ?? 0)}</Text>
                        <Text style={styles.summaryLabel}>Pending</Text>
                    </View>
                </View>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, {width: `${submissionPercentage}%`,},]}/>
                    </View>
                    <Text style={styles.progressText}>{submissionPercentage}% Submitted</Text>
                </View>

            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewSubmissions}>
                <Text style={styles.primaryButtonText}>View Student Submissions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEdit}>
                <Text style={styles.secondaryButtonText}>Edit Assignment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.deleteButton, deleting && styles.deleteButtonDisabled,]} disabled={deleting} onPress={handleDelete}>
                {deleting ? (
                    <ActivityIndicator color="#FFFFFF"/>
                ) : (
                    <Text style={styles.deleteButtonText}>Delete Assignment</Text>
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
        paddingBottom: 80,
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
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
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

    subjectBadge: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        marginBottom: SPACING.sm,
    },

    subjectBadgeText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },

    assignmentTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.sm,
        paddingVertical: 2,
    },

    infoLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    infoValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.semibold,
    },

    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },

    description: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },

    referenceCard: {
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

    downloadLabel: {
        marginTop: 4,
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
    },

    downloadIcon: {
        fontSize: 20,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.bold,
    },

    noFileText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontStyle: "italic",
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.lg,
        gap: SPACING.md,
    },

    summaryBox: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        alignItems: "center",
        paddingVertical: SPACING.lg,
    },

    summaryNumber: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },

    summaryLabel: {
        marginTop: SPACING.xs,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },

    progressContainer: {
        marginTop: SPACING.sm,
    },

    progressTrack: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },

    progressText: {
        marginTop: SPACING.xs,
        textAlign: "right",
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.md, ...SHADOWS.sm,
    },

    primaryButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },

    secondaryButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.md,
    },

    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },

    deleteButton: {
        backgroundColor: COLORS.absent,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.xl, ...SHADOWS.sm,
    },

    deleteButtonDisabled: {
        opacity: 0.6,
    },

    deleteButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
});
