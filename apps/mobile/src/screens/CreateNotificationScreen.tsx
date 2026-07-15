import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import notificationApi from "../services/notificationApi";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    FONT_WEIGHT,
    SHADOWS,
} from "../constants/theme";

type CreateNotificationRouteProp = RouteProp<RootStackParamList,"CreateNotification">;
type CreateNotificationNavigationProp = NativeStackNavigationProp<RootStackParamList,"CreateNotification">;
interface Props {route: CreateNotificationRouteProp;navigation: CreateNotificationNavigationProp;}
type NotificationType = | "general" | "announcement" | "reminder" | "alert";
export default function CreateNotificationScreen({ navigation }: Props) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<NotificationType>("general");
    const [targetAudience,setTargetAudience] = useState<"students"|"teachers"|"all"|"class">("students");
    const [studentsSelected, setStudentsSelected] = useState(true);
    const [teachersSelected, setTeachersSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert("Validation", "Please enter a title.");
            return false;
        }
        if (!message.trim()) {
            Alert.alert("Validation", "Please enter a message.");
            return false;
        }
        if (!targetAudience) {
            Alert.alert("Validation", "Please select an audience.");
    return false;
}
        return true;
    };

    const handleSend = async () => {
        if (!validateForm()) return;
        try {
            setLoading(true);
            let audience: "students" | "teachers" | "all" | "class";
            if (studentsSelected && teachersSelected) {
                Alert.alert("Invalid Audience", "Please select either Students or Teachers.");
                return;     
            }
            if (!studentsSelected && !teachersSelected) {
              Alert.alert("Invalid Audience","Please select an audience.");
              return;
            }
            const audience: | "students" | "teachers" = studentsSelected ? "students" : "teachers";
            await notificationApi.createAndSendNotification({
                title,
                message,
                type,
                targetAudience: audience,
            });
            Alert.alert("Success","Notification sent successfully.",[{text: "OK",onPress: () => navigation.goBack(),},],);
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Unable to send notification.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!validateForm()) return;
        try {
            setLoading(true);
            let audience: "students" | "teachers" | "all" | "class";
            if (studentsSelected && teachersSelected) {
                Alert.alert("Invalid Audience", "Please select either Students or Teachers.");
                return;     
            }
            if (!studentsSelected && !teachersSelected) {
              Alert.alert("Invalid Audience","Please select an audience.");
              return;
            }
            const audience: | "students" | "teachers" = studentsSelected ? "students" : "teachers";
            await notificationApi.createNotification({title,message,type,targetAudience: audience,});
            Alert.alert("Success", "Draft saved successfully.", [{text: "OK", onPress: () => navigation.goBack(),},]);
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.response?.data?.message || "Unable to save draft.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.customHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Notification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter notification title"
                    placeholderTextColor={COLORS.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                />
                <Text style={styles.label}>Message</Text>
                <TextInput
                    style={styles.messageInput}
                    placeholder="Enter notification message"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                />
                <Text style={styles.label}>Notification Type</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            type === "general" && styles.selectedCard,
                        ]}
                        onPress={() => setType("general")}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                type === "general" && styles.selectedText,
                            ]}
                        >
                            Notification
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            type === "announcement" && styles.selectedCard,
                        ]}
                        onPress={() => setType("announcement")}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                type === "announcement" && styles.selectedText,
                            ]}
                        >
                            Announcement
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.label}>Audience</Text>
                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setStudentsSelected(!studentsSelected)}
                >
                    <View
                        style={[
                            styles.checkbox,
                            studentsSelected && styles.checkboxSelected,
                        ]}
                    />
                    <Text style={styles.checkboxText}>Students</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setTeachersSelected(!teachersSelected)}
                >
                    <View
                        style={[
                            styles.checkbox,
                            teachersSelected && styles.checkboxSelected,
                        ]}
                    />
                    <Text style={styles.checkboxText}>Teachers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSaveDraft}
                    disabled={loading}
                >
                    <Text style={styles.secondaryButtonText}>Save Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSend}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>
                            Send Notification
                        </Text>
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

    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },

    input: {
        height: 50,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },

    messageInput: {
        minHeight: 140,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.lg,
    },

    optionCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        marginHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
    },

    selectedCard: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    optionText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },

    selectedText: {
        color: "#FFFFFF",
        fontWeight: FONT_WEIGHT.bold,
    },

    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: SPACING.md,
        backgroundColor: "#FFFFFF",
    },

    checkboxSelected: {
        backgroundColor: COLORS.primary,
    },

    checkboxText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },

    secondaryButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center",
        marginTop: SPACING.xl,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },

    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },

    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.xl,
        ...SHADOWS.sm,
    },

    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },

    disabledButton: {
        opacity: 0.6,
    },

    helperText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        marginBottom: SPACING.lg,
        textAlign: "center",
        lineHeight: 20,
    },

    sectionContainer: {
        marginBottom: SPACING.lg,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
});
