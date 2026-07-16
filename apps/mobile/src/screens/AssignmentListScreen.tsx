import React, { useEffect, useState, useMemo } from "react";
import AppHeader from '../components/Header/AppHeader';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    StatusBar,
    Platform,
    Alert,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import assignmentApi from "../services/assignmentApi";
import { Assignment } from "../services/api";
import {COLORS,SPACING,FONT_SIZE,FONT_WEIGHT,SHADOWS,} from "../constants/theme";

type AssignmentListScreenRouteProp = RouteProp<RootStackParamList,"AssignmentList">;
type AssignmentListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList,"AssignmentList">;

interface Props {route: AssignmentListScreenRouteProp;navigation: AssignmentListScreenNavigationProp;}

type FilterStatus = "all" | "pending" | "submitted" | "late" | "graded";
const mapAssignment = (assignment: any, status: "pending" | "submitted" | "late" | "graded" = "pending"): Assignment => {
    return {
        id: assignment.id,
        classId: assignment.classId || "",
        title: assignment.title,
        subject: assignment.subject,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks || 0,
        assignedBy: assignment.createdBy || "Teacher",
        status: "pending",
        obtainedMarks: undefined,
        feedback: undefined,
        submission: undefined,
    };
};

export default function AssignmentListScreen({ route, navigation }: Props) {
  const classId = route?.params?.classId;
  const className = route?.params?.className || 'All Classes';

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);

    // Reload assignments when screen gains focus or mounts
    const loadData = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }
        try {
            const response = await assignmentApi.getAssignments();
            const classAssignments = response.filter((item: any) => String(item.classId) === String(classId));
            const formattedAssignments = await Promise.all(classAssignments.map(async (item: any) => {
                try {
                    const submission = await assignmentApi.getSubmissionStatus(item.id);
                    const status = submission?.status === "submitted" ? "submitted" : submission?.status === "late" ? "late" : submission?.status === "graded" ? "graded" : "pending";
                    return mapAssignment(item, status);
                } catch (error) {
                  console.log(`Unable to fetch submission status for assignment ${item.id}`, error);
                    return mapAssignment(item, "pending");
                }}));
            setAssignments(formattedAssignments);
          } catch (error) {
            console.log(error);
            Alert.alert("Unable to load assignments", "Please try again.");
          } finally {
            setLoading(false);
            setRefreshing(false);
          }
    };
    
    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener("focus", () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation, classId]);
  // Reload assignments when screen gains focus or mounts
  const loadData = async (showLoader = true) => {
  if (showLoader) {
    setLoading(true);
  }
  try {
    const response = await assignmentApi.getAssignments();
    console.log("Assignments:", response);
    const formattedAssignments = response
      .filter(
        (item: any) =>
          !classId || String(item.classId) === String(classId)
      )
      .map(mapAssignment);
    setAssignments(formattedAssignments || []);
  } catch (error) {
    console.log(error);
    Alert.alert(
      "Unable to load assignments",
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
  };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(false);
    };

    const filteredAssignments = useMemo(() => {
        return assignments.filter((item) => {
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch =
                item.title.toLowerCase().includes(query) ||
                item.subject.toLowerCase().includes(query);

            const matchesStatus =
                activeFilter === "all" || item.status === activeFilter;
            return matchesSearch && matchesStatus;
        });
    }, [assignments, searchQuery, activeFilter]);

    const getSubjectEmoji = (subject: string) => {
        switch (subject.toLowerCase()) {
            case "mathematics":
                return "📐";
            case "physics":
                return "⚛️";
            case "chemistry":
                return "🧪";
            case "english literature":
                return "📚";
            default:
                return "📝";
        }
    };

    const getStatusStyle = (status: Assignment["status"]) => {
        switch (status) {
            case "pending":
                return {
                    bg: COLORS.absentLight,
                    text: COLORS.absent,
                    border: "rgba(240, 68, 56, 0.15)",
                };
            case "submitted":
                return {
                    bg: COLORS.presentLight,
                    text: COLORS.present,
                    border: "rgba(18, 183, 106, 0.15)",
                };
            case "late":
                return {
                    bg: COLORS.festivalLight,
                    text: COLORS.festival,
                    border: "rgba(245, 158, 11, 0.15)",
                };
            case "graded":
                return {
                    bg: COLORS.festivalLight,
                    text: COLORS.festival,
                    border: "rgba(46, 144, 250, 0.15)",
                };
            default:
                return {
                    bg: COLORS.background,
                    text: COLORS.textSecondary,
                    border: COLORS.border,
                };
        }
    };

    const renderAssignmentCard = ({ item }: { item: Assignment }) => {
        const stylesStatus = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate("AssignmentDetails", {
                        assignmentId: item.id,
                    })
                }
            >
                <View style={styles.cardRow}>
                    {/* Subject Emoji Avatar */}
                    <View style={styles.subjectAvatar}>
                        <Text style={styles.subjectEmoji}>
                            {getSubjectEmoji(item.subject)}
                        </Text>
                    </View>

                    {/* Core Info */}
                    <View style={styles.infoCol}>
                        <Text style={styles.subjectName}>{item.subject}</Text>
                        <Text style={styles.assignmentTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
                    </View>

                    {/* Status Badge & Score */}
                    <View style={styles.statusCol}>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: stylesStatus.bg,
                                    borderColor: stylesStatus.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: stylesStatus.text },
                                ]}
                            >
                                {item.status.toUpperCase()}
                            </Text>
                        </View>

                        {item.status === "graded" &&
                            item.obtainedMarks !== undefined && (
                                <Text style={styles.scoreText}>
                                    {item.obtainedMarks}/{item.maxMarks} Marks
                                </Text>
                            )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Visual Header */}
            <View style={styles.customHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assignments</Text>
                <TouchableOpacity style={styles.bellButton}>
                    <View style={styles.bellOutline}>
                        <View style={styles.bellCap} />
                        <View style={styles.bellBody} />
                        <View style={styles.bellClapper} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Search Input Bar */}
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

            {/* Status Filter Tabs (Pills) */}
            <View style={styles.filterTabsRow}>
                {(
                    ["all", "pending", "submitted", "late", "graded"] as FilterStatus[]
                ).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterTabButton,
                            activeFilter === filter &&
                                styles.filterTabButtonActive,
                        ]}
                        onPress={() => setActiveFilter(filter)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterTabLabel,
                                activeFilter === filter &&
                                    styles.filterTabLabelActive,
                            ]}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>
                        Fetching assignments...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAssignments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderAssignmentCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No assignments found in this section.
                            </Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
    

<AppHeader
  title="Assignments"
  showBackButton
/>



      <View style={styles.container}>
      {/* Search Input Bar */}
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

      {/* Status Filter Tabs (Pills) */}
      <View style={styles.filterTabsRow}>
        {(['all', 'pending', 'submitted', 'graded'] as FilterStatus[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTabButton,
              activeFilter === filter && styles.filterTabButtonActive
            ]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterTabLabel,
                activeFilter === filter && styles.filterTabLabelActive
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching assignments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item.id}
          renderItem={renderAssignmentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assignments found in this section.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 safeContainer: {
  flex: 1,
  backgroundColor: COLORS.background,
},
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    // Removed paddingTop for Android StatusBar to avoid gap
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 6,
  },
  filterTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
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
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.md,
  },
  subjectEmoji: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  subjectName: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  assignmentTitle: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  dueDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  statusText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
