import React, { useState } from "react";
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

import notificationApi from "../services/notificationApi";

import {
    COLORS,
    SPACING,
    FONT_SIZE,
    FONT_WEIGHT,
    SHADOWS,
} from "../constants/theme";

type NotificationDetailsRouteProp = RouteProp<
    RootStackParamList,
    "NotificationDetails"
>;
type NotificationDetailsNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "NotificationDetails"
>;
interface Props {
    route: NotificationDetailsRouteProp;
    navigation: NotificationDetailsNavigationProp;
}
interface NotificationDetails {
    id: string;

    title: string;

    message: string;

    type: "notification" | "announcement";

    status: "draft" | "sent";

    createdAt: string;

    sentAt?: string;

    audience: {
        roles: string[];
        userIds: string[];
    };

    createdBy: string;
}

export default function NotificationDetailsScreen({
    route,
    navigation,
}: Props) {
    const { notification } = route.params;

    const [notificationData, setNotificationData] = useState(notification);

    const [deleting, setDeleting] = useState(false);
    const handleDelete = () => {
        if (notificationData.type !== "announcement") {
            Alert.alert("Not Allowed", "Only announcements can be deleted.");

            return;
        }

        Alert.alert("Delete Announcement", "Are you sure?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        setDeleting(true);

                        await notificationApi.deleteAnnouncement(
                            notificationData.id,
                        );

                        setDeleting(false);

                        navigation.goBack();
                    } catch (error) {
                        setDeleting(false);

                        Alert.alert("Error", "Unable to delete notification.");
                    }
                },
            },
        ]);
    };

    const handleMarkAsRead = () => {
        setNotificationData({
            ...notificationData,
            status: "sent",
        });

        Alert.alert("Success", "Notification marked as read.");
    };

    if (!notificationData) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Notification not found.</Text>
            </SafeAreaView>
        );
    }

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
                <Text style={styles.headerTitle}>Notification Details</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.topRow}>
                        <View
                            style={[
                                styles.typeBadge,
                                notificationData.type === "announcement"
                                    ? styles.announcementBadge
                                    : styles.notificationBadge,
                            ]}
                        >
                            <Text style={styles.typeBadgeText}>
                                {notificationData.type.toUpperCase()}
                            </Text>
                        </View>
                        {notificationData.status === "draft" && (
                            <View
                                style={{
                                    backgroundColor: "#FEF3C7",
                                    borderRadius: 15,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={styles.unreadText}>Draft</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.title}>{notificationData.title}</Text>
                    <Text style={styles.date}>
                        {notificationData.createdAt}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.message}>
                        {notificationData.message}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleMarkAsRead}
                >
                    <Text style={styles.primaryButtonText}>Mark as Read</Text>
                </TouchableOpacity>
                {notificationData.type === "announcement" && (
                    <TouchableOpacity
                        style={[
                            styles.deleteButton,
                            deleting && styles.deleteButtonDisabled,
                        ]}
                        disabled={deleting}
                        onPress={handleDelete}
                    >
                        {deleting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.deleteButtonText}>
                                Delete Announcement
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
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
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
        ...SHADOWS.sm,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },

    typeBadge: {
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        alignSelf: "flex-start",
    },

    typeBadgeText: {
        color: "#FFFFFF",
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },

    unreadText: {
        color: "#B45309",
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },

    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },

    date: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.lg,
    },

    message: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
        lineHeight: 26,
    },

    notificationBadge: {
        backgroundColor: "#2563EB",
    },

    announcementBadge: {
        backgroundColor: "#F59E0B",
    },

    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },

    primaryButtonText: {
        color: COLORS.textLight,
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },

    deleteButton: {
        backgroundColor: "#DC2626",
        borderRadius: 10,
        paddingVertical: SPACING.md,
        justifyContent: "center",
        alignItems: "center",
        ...SHADOWS.sm,
    },

    deleteButtonDisabled: {
        opacity: 0.6,
    },

    deleteButtonText: {
        color: "#FFFFFF",
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
    },
});
