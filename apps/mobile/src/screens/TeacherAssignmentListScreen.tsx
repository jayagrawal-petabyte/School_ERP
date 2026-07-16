import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import { getToken } from "../utils/security";
import {COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS,} from "../constants/theme";

type TeacherAssignmentListRouteProp = RouteProp<RootStackParamList, "TeacherAssignmentList">;
type TeacherAssignmentListNavigationProp = NativeStackNavigationProp<RootStackParamList, "TeacherAssignmentList">;
interface Props {
  route: TeacherAssignmentListRouteProp;
  navigation: TeacherAssignmentListNavigationProp;
}

interface TeacherAssignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  totalStudents: number;
  submittedStudents: number;
  status: "active" | "draft" | "closed";
}

const mapTeacherAssignment = (item: any): TeacherAssignment => ({
  id: item.id,
  title: item.title,
  subject: item.subject,
  className: item.className ?? "-",
  dueDate: item.dueDate,
  totalStudents: item.totalStudents ?? 0,
  submittedStudents: item.submittedStudents ?? 0,
  status: item.status ?? "active",
});

type FilterStatus = | "active" | "draft" | "closed";

export default function TeacherAssignmentListScreen({navigation,}: Props) {
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("active");

    const loadData = async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }
      try {
        const response = await assignmentApi.getTeacherAssignments();
        const formattedAssignments = response.map(mapTeacherAssignment);
        setAssignments(formattedAssignments);
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Unable to load assignments.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    useEffect(() => {
      loadData();
    }, []);





    useEffect(()=>{
    loadData();
    const unsubscribe =
        navigation.addListener("focus",()=>{
            loadData(false);
        }
        );
    return unsubscribe;
    },[]);

    const onRefresh = async()=>{
        setRefreshing(true);
        await loadData(false);
    };

    const filteredAssignments = useMemo(()=>{
    return assignments.filter(item=>{

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch=item.title.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query) || item.className.toLowerCase().includes(query);
    const matchesStatus=item.status===activeFilter;

    return matchesSearch && matchesStatus;
    });
    },[assignments, searchQuery, activeFilter]);

    const getSubjectEmoji = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return '📐';
      case 'physics': return '⚛️';
      case 'chemistry': return '🧪';
      case 'english literature': return '📚';
      default: return '📝';
    }
    };

    const getStatusStyle = (status:TeacherAssignment["status"] ) => {
    switch(status){
        case "active": return{bg:COLORS.presentLight, text:COLORS.present, border:"rgba(18,183,106,0.15)"};
        case "draft": return{bg:COLORS.festivalLight, text:COLORS.festival, border:"rgba(46,144,250,0.15)"};
        case "closed": return{bg:COLORS.absentLight, text:COLORS.absent, border:"rgba(240,68,56,0.15)"};
        default: return{bg:COLORS.background, text:COLORS.textSecondary, border:COLORS.border};
    }
    };

    const renderAssignmentCard = ({item,}:{item:TeacherAssignment;})=>{
        const styleStatus = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TeacherAssignmentDetails', { assignmentId: item.id })}
              >
                <View style={styles.cardRow}>
                  {/* Subject Emoji Avatar */}
                  <View style={styles.subjectAvatar}>
                    <Text style={styles.subjectEmoji}>{getSubjectEmoji(item.subject)}</Text>
                  </View>

                <View style={styles.infoCol}>
                    <Text style={styles.subjectName}>{item.subject}</Text>
                    <Text style={styles.assignmentTitle}numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.className}>{item.className}</Text>
                    <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
                </View>

                <View style={styles.statusCol}>
                    <View style={[styles.statusBadge, {backgroundColor: styleStatus.bg, borderColor: styleStatus.border, },]}>
                        <Text style={[styles.statusText, {color: styleStatus.text, }, ]}>{item.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.submissionCount}>{item.submittedStudents}/{item.totalStudents}</Text>
                    <Text style={styles.submissionLabel}>Submitted</Text>
                </View>

                </View>
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.customHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Teacher Assignments</Text>
            <TouchableOpacity style={styles.bellButton}>
                <View style={styles.bellOutline}>
                    <View style={styles.bellCap} />
                    <View style={styles.bellBody} />
                    <View style={styles.bellClapper} />
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
        <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
            style={styles.searchInput}
            placeholder="Search assignments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
            />
        </View>
        </View>

        <View style={styles.filterTabsRow}>{(["active", "draft", "closed", ] as FilterStatus[]).map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterTabButton,activeFilter === filter && styles.filterTabButtonActive, ]} onPress={() => setActiveFilter(filter)}>
                <Text style={[styles.filterTabLabel, activeFilter === filter && styles.filterTabLabelActive, ]} > {filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
            </TouchableOpacity>
        ))}
        </View>

        {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
            <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>

        ) : (

        <FlatList
            data={filteredAssignments}
            keyExtractor={(item) => item.id}
            renderItem={renderAssignmentCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No assignments available.</Text>
                </View>
            }
        />)}

        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate("CreateAssignment")}>
            <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
    },

    backButtonText: {
        fontSize: 20,
        fontWeight: "bold",
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
        justifyContent: "center",
        alignItems: "center",
    },

    bellOutline: {
        width: 16,
        height: 18,
        alignItems: "center",
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

    searchSection: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: "#FFFFFF",
    },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        height: 42,
    },

    searchIcon: {
        fontSize: 12,
        marginRight: SPACING.xs,
    },

    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textPrimary,
        fontWeight: FONT_WEIGHT.medium,
    },

    filterTabsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 6,
    },

    filterTabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#FFFFFF",
    },

    filterTabButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    filterTabLabel: {
        fontSize: 11,
        fontWeight: FONT_WEIGHT.medium,
        color: COLORS.textSecondary,
    },

    filterTabLabelActive: {
        color: COLORS.textLight,
        fontWeight: FONT_WEIGHT.bold,
    },

    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,...SHADOWS.sm,
    },

    cardRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    subjectAvatar: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginRight: SPACING.md,
    },

    subjectEmoji: {
        fontSize: 22,
    },

    infoCol: {
        flex: 1,
    },

    subjectName: {
        fontSize: 10,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textMuted,
        textTransform: "uppercase",
    },

    assignmentTitle: {
        fontSize: 14,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },

    className: {
        fontSize: 11,
        color: COLORS.primary,
        marginTop: 3,
        fontWeight: FONT_WEIGHT.medium,
    },

    dueDate: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 3,
    },

    statusCol: {
        alignItems: "flex-end",
        justifyContent: "center",
    },

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        alignItems: "center",
        minWidth: 72,
    },

    statusText: {
        fontSize: 9,
        fontWeight: FONT_WEIGHT.bold,
    },

    submissionCount: {
        fontSize: 13,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.primary,
        marginTop: SPACING.sm,
    },

    submissionLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    fab: {
        position: "absolute",
        right: SPACING.lg,
        bottom: SPACING.xl,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",...SHADOWS.md,
    },

    fabIcon: {
        fontSize: 30,
        color: COLORS.textLight,
        fontWeight: FONT_WEIGHT.bold,
        marginTop: -2,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SPACING.xl * 2,
    },

    emptyText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: "center",
        fontWeight: FONT_WEIGHT.medium,
    },
});
