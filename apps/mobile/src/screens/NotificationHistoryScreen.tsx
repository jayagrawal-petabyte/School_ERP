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
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type NotificationHistoryRouteProp = RouteProp<RootStackParamList,"NotificationHistory">;
type NotificationHistoryNavigationProp = NativeStackNavigationProp<RootStackParamList,"NotificationHistory">;
interface Props {
    route: NotificationHistoryRouteProp;
    navigation: NotificationHistoryNavigationProp;
}
type FilterType = "all" | "notification" | "announcement" | "draft" | "sent";
interface NotificationHistoryItem {
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

export default function NotificationHistoryScreen({ navigation }: Props) {
    const [notifications, setNotifications] = useState<
        NotificationHistoryItem[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const loadNotifications = async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            const response = await notificationApi.getNotificationHistory();
            setNotifications(response);
        } catch (error: any) {
            if (__DEV__) {
                console.log(error);
                Alert.alert("Error",error.response?.data?.message || "Unable to load notification history.",);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications(false);
    };
    useEffect(() => {
        loadNotifications();
    }, []);
    const filteredNotifications = useMemo(() => {
        return notifications.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.message.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesFilter = true;
            switch (activeFilter) {
                case "notification":
                case "announcement":
                    matchesFilter = item.type === activeFilter;
                    break;
                case "draft":
                case "sent":
                    matchesFilter = item.status === activeFilter;
                    break;
                default:
                    matchesFilter = true;
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

                        await loadNotifications(false);
                    } catch {
                        Alert.alert("Error", "Unable to delete announcement.");
                    }
                },
            },
        ]);
    };
    const openNotification = (item: NotificationHistoryItem) => {
        navigation.navigate("NotificationDetails", {
            notification: item,
        });
    };
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                    Loading notification history...
                </Text>
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
                <Text style={styles.headerTitle}>Notification History</Text>
                <TouchableOpacity onPress={() => navigation.navigate("CreateNotification")}>
                    <Text style={styles.createText}>+ Create</Text>
                </TouchableOpacity>
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
                data={["all", "notification", "announcement", "draft", "sent"]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.filterChip, activeFilter === item && styles.activeFilterChip,]} onPress={() => setActiveFilter(item as FilterType)}>
                        <Text style={[styles.filterText,activeFilter === item && styles.activeFilterText,]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
                    </TouchableOpacity>
                )}/>
            <FlatList
                data={filteredNotifications}
                keyExtractor={(item) => item.id}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => openNotification(item)}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.typeBadge, item.type === "announcement" ? styles.announcementBadge : styles.notificationBadge,]}>
                                <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                            </View>
                            <View style={[styles.statusBadge,item.status === "sent" ? styles.sentBadge : styles.draftBadge,]}>
                                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                        <Text style={styles.audience}>Audience: {item.audience.roles.join(", ")}</Text>
                        <View style={styles.footer}>
                            <Text style={styles.date}>Created: {item.createdAt}</Text>
                            {item.sentAt && (
                                <Text style={styles.date}>Sent: {item.sentAt}</Text>
                            )}
                        </View>
                        {item.type === "announcement" && (
                            <TouchableOpacity style={styles.deleteContainer} onPress={() => handleDelete(item.id)}>
                                <Text style={styles.deleteText}>Delete Announcement</Text>
                            </TouchableOpacity>
                        )}
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

    createText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: FONT_WEIGHT.bold,
    },

    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },

    searchInput: {
        height: 48,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: FONT_SIZE.md,
    },

    filterContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },

    filterChip: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        marginRight: SPACING.sm,
    },

    activeFilterChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    filterText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.medium,
    },

    activeFilterText: {
        color: "#FFFFFF",
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

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },

    typeBadge: {
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        alignSelf: "flex-start",
    },

    typeBadgeText: {
        color: "#FFFFFF",
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
    },

    notificationBadge: {
        backgroundColor: "#2563EB",
    },

    announcementBadge: {
        backgroundColor: "#F59E0B",
    },

    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
    },

    sentBadge: {
        backgroundColor: "#DCFCE7",
    },

    draftBadge: {
        backgroundColor: "#FEF3C7",
    },

    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
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
        lineHeight: 22,
        marginBottom: SPACING.md,
    },

    audience: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
        marginBottom: SPACING.sm,
    },

    footer: {
        marginTop: SPACING.sm,
    },

    date: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },

    deleteContainer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: "flex-end",
    },

    deleteText: {
        color: "#DC2626",
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
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
        marginBottom: SPACING.sm,
    },

    emptyMessage: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },

    audienceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.sm,
    },

    audienceLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontWeight: FONT_WEIGHT.medium,
    },

    audienceValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.bold,
        marginLeft: 4,
    },
});
