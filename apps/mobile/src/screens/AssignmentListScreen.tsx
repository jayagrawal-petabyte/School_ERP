import React, { useEffect, useState, useMemo } from 'react';
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
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AssignmentService, Assignment } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AssignmentListScreenRouteProp = RouteProp<RootStackParamList, 'AssignmentList'>;
type AssignmentListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AssignmentList'
>;

interface Props {
  route: AssignmentListScreenRouteProp;
  navigation: AssignmentListScreenNavigationProp;
}

type FilterStatus = 'all' | 'pending' | 'submitted' | 'graded';

export default function AssignmentListScreen({ route, navigation }: Props) {
  const { classId, className } = route.params;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Reload assignments when screen gains focus or mounts
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AssignmentService.getAssignments(classId);
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, classId]);

  // Handle filter/search logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        activeFilter === 'all' || item.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchQuery, activeFilter]);

  const getSubjectEmoji = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return '📐';
      case 'physics': return '⚛️';
      case 'chemistry': return '🧪';
      case 'english literature': return '📚';
      default: return '📝';
    }
  };

  const getStatusStyle = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return { bg: COLORS.absentLight, text: COLORS.absent, border: 'rgba(240, 68, 56, 0.15)' };
      case 'submitted':
        return { bg: COLORS.presentLight, text: COLORS.present, border: 'rgba(18, 183, 106, 0.15)' };
      case 'graded':
        return { bg: COLORS.festivalLight, text: COLORS.festival, border: 'rgba(46, 144, 250, 0.15)' };
      default:
        return { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const renderAssignmentCard = ({ item }: { item: Assignment }) => {
    const stylesStatus = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: item.id })}
      >
        <View style={styles.cardRow}>
          {/* Subject Emoji Avatar */}
          <View style={styles.subjectAvatar}>
            <Text style={styles.subjectEmoji}>{getSubjectEmoji(item.subject)}</Text>
          </View>

          {/* Core Info */}
          <View style={styles.infoCol}>
            <Text style={styles.subjectName}>{item.subject}</Text>
            <Text style={styles.assignmentTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          </View>

          {/* Status Badge & Score */}
          <View style={styles.statusCol}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: stylesStatus.bg, borderColor: stylesStatus.border }
              ]}
            >
              <Text style={[styles.statusText, { color: stylesStatus.text }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>

            {item.status === 'graded' && item.obtainedMarks !== undefined && (
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  customHeader: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellOutline: {
    width: 16,
    height: 18,
    alignItems: 'center',
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
