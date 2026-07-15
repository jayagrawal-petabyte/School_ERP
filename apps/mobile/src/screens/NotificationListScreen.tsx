import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert,
    Platform,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import notificationApi from "../services/notificationApi";
import { getToken } from "../utils/security";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type NotificationListRouteProp = RouteProp<RootStackParamList, "Notifications">;
type NotificationListNavigationProp = NativeStackNavigationProp<RootStackParamList,"Notifications">;
interface Props {route: NotificationListRouteProp;navigation: NotificationListNavigationProp;}
type FilterType = type FilterType = | "all" | "general" | "announcement" | "reminder" | "alert";
interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type FilterType = | "all" | "general" | "announcement" | "reminder" | "alert";
    status: "draft" | "sent";
    createdAt: string;
    sentAt?: string;
    targetAudience: "students" | "teachers" | "all" | "class";
    createdBy: string;
}

export default function NotificationListScreen({ navigation }: Props) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [role, setRole] = useState<"teacher" | "student">("student");
    const loadNotifications = async (
        userRole: string,
        showLoader = true
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            let response;
            if (userRole === "teacher") {
                response = await notificationApi.getNotificationHistory();
            } else {
                response = await notificationApi.getMyNotifications();
            }
            const formattedNotifications = (response || []).map((item: any) => {
                const notification = item.notification || item.notifications || item;
                return {
                    id:
                        notification.id ||
                        item.notificationId,

                    title:
                        notification.title ||
                        "",

                    message:
                        notification.message ||
                        "",

                    type:
                        notification.type ||
                        "general",

                    status:
                        notification.status ||
                        "sent",

                    targetAudience:
                        notification.targetAudience ||
                        notification.target_audience ||
                        "students",

                    createdAt:
                        notification.createdAt ||
                        notification.created_at ||
                        item.deliveredAt ||
                        item.delivered_at ||
                        "",

                    sentAt:
                        notification.sentAt ||
                        notification.sent_at,

                    createdBy:
                        notification.createdBy ||
                        notification.created_by ||
                        "",
                };
            });

        setNotifications(formattedNotifications);
    } catch (error: any) {
        if (__DEV__) {
            console.log(error);
        }

        Alert.alert(
            "Error",
            "Unable to load notifications."
        );

        setNotifications([]);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications(role, false);
    };

    useEffect(() => {
        const initialize = async () => {
            const storedRole = await getToken("user_role");

            const userRole = storedRole === "teacher" ? "teacher" : "student";

            setRole(userRole);

            await loadNotifications(userRole);
        };

        initialize();
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.message.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesFilter = true;

            switch (activeFilter) {
                case "all":
                    matchesFilter = true;
                    break;

                default:
                    matchesFilter = item.type === activeFilter;
            }

            return matchesSearch && matchesFilter;
        });
    }, [notifications, searchQuery, activeFilter]);

    const handleDelete = (id: string) => {
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
                        await notificationApi.deleteAnnouncement(id);

                        setNotifications((prev) =>
                            prev.filter((item) => item.id !== id),
                        );
                    } catch (error) {
                        Alert.alert("Error", "Unable to delete announcement.");
                    }
                },
            },
        ]);
    };

    const openNotification = (item: NotificationItem) => {
        navigation.navigate("NotificationDetails", {
            notification: item,
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />

                <Text style={styles.loadingText}>Loading notifications...</Text>
            </SafeAreaView>
        );
    }

    if (!loading && filteredNotifications.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No notifications found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.customHeader}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {role === "teacher" && (
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert(
                                "Coming Soon",
                                "Bulk actions will be added later.",
                            )
                        }
                    >
                        <Text style={styles.markAllText}>Manage</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notifications..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                horizontal
                data={["all", "general", "announcement", "reminder", "alert",]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            activeFilter === item && styles.activeFilterChip,
                        ]}
                        onPress={() => setActiveFilter(item as FilterType)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                activeFilter === item &&
                                    styles.activeFilterText,
                            ]}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Text>
                    </TouchableOpacity>
                )}
            />
            <FlatList
                data={filteredNotifications}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card]}
                        onPress={() => openNotification(item)}
                    >
                        <View style={styles.cardHeader}>
                            <View
                                style={[
                                    styles.typeBadge,
                                    styles[`${item.type}Badge`],
                                ]}
                            >
                                <Text style={styles.typeBadgeText}>
                                    {item.type.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <View style={styles.footer}>
                            <Text style={styles.time}>{item.createdAt}</Text>
                            {role === "teacher" &&
                                item.type === "announcement" && (
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Text style={styles.deleteText}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                )}
                        </View>
                    </TouchableOpacity>
                )}
            />
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

    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
    },

    markAllText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.semibold,
    },

    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
    },

    searchInput: {
        height: 48,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
    },

    filterContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        gap: SPACING.sm,
    },

    filterChip: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        marginRight: SPACING.sm,
        alignItems: "center",
        justifyContent: "center",
    },

    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    filterText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    activeFilterText: {
        color: COLORS.textLight,
        fontWeight: FONT_WEIGHT.bold,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },

    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
    },

    typeBadge: {
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        alignSelf: "flex-start",
    },

    typeBadgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        color: "#FFFFFF",
    },

    notificationBadge: {
        backgroundColor: "#2563EB",
    },

    title: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },

    message: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    time: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },

    deleteText: {
        color: COLORS.absent,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },

    announcementBadge: {
        backgroundColor: "#F59E0B",
    },

    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: SPACING.xl,
    },

    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
    },

    emptyMessage: {
        marginTop: SPACING.sm,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },

    badgeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    unreadCountBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.absent,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: SPACING.xs,
        paddingHorizontal: 5,
    },

    unreadCountText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: FONT_WEIGHT.bold,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },

    notificationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
});
