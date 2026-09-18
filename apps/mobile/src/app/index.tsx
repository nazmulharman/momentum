import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, TextInput, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { ApiService } from '@/services/api';

export type TaskItem = {
  id: string;
  title: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  category: string;
};

const INITIAL_TASKS: TaskItem[] = [
  { id: '1', title: 'Design Facebook Campaign', time: '10:00 AM', status: 'In Progress', progress: 65, category: 'Marketing' },
  { id: '2', title: 'Sync with Dev Team', time: '02:00 PM', status: 'Pending', progress: 0, category: 'Engineering' },
  { id: '3', title: 'Review Marketing Copy', time: '04:30 PM', status: 'Completed', progress: 100, category: 'Marketing' },
  { id: '4', title: 'Daily Workout & Stretch', time: '07:00 AM', status: 'Completed', progress: 100, category: 'Health' },
];

const CATEGORIES = ['General', 'Marketing', 'Engineering', 'Health', 'Design'];

export default function DashboardScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    async function loadTasks() {
      const serverTasks = await ApiService.getTasks();
      if (serverTasks && Array.isArray(serverTasks) && serverTasks.length > 0) {
        setTasks(serverTasks);
      } else {
        const local = ApiService.getLocalData('app_tasks', INITIAL_TASKS);
        setTasks(local);
      }
    }
    loadTasks();
  }, []);

  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    ApiService.saveLocalData('app_tasks', newTasks);
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      progress: 0,
      category: selectedCategory,
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setTaskTitle('');
    await ApiService.createTask('default-user-nazmul', newTask);
  };

  const toggleTaskStatus = async (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const isComp = t.status === 'Completed';
        return {
          ...t,
          status: isComp ? ('Pending' as const) : ('Completed' as const),
          progress: isComp ? 0 : 100,
        };
      }
      return t;
    });
    saveTasks(updated);

    const target = updated.find(t => t.id === id);
    if (target) {
      await ApiService.updateTask(id, { status: target.status, progress: target.progress });
    }
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    await ApiService.deleteTask(id);
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const overdue = tasks.filter(t => t.status === 'Pending' && t.category === 'Marketing').length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, score };
  };

  const stats = getStats();

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Pending') return t.status !== 'Completed';
    if (filter === 'Completed') return t.status === 'Completed';
    return true;
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        responsive.isDesktop && styles.desktopContentContainer,
      ]}
    >
      <SafeAreaView style={[styles.safeArea, responsive.isDesktop && styles.desktopSafeArea]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
              <ThemedText type="small" themeColor="textSecondary">{todayDateString}</ThemedText>
              <View style={[styles.formatTag, { backgroundColor: theme.primary + '20' }]}>
                <ThemedText type="code" style={{ fontSize: 10, color: theme.primary }}>
                  {responsive.isDesktop ? '💻 Computer Widescreen Format' : '📱 Mobile Format'}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="subtitle" style={styles.userName}>Good Day, Nazmul 👋</ThemedText>
          </View>
          <ThemedView type="backgroundSelected" style={styles.avatar}>
            <ThemedText type="smallBold">N</ThemedText>
          </ThemedView>
        </View>

        {/* Dynamic Responsive Layout: Multi-column desktop grid vs 1-column mobile stack */}
        <View style={responsive.isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {/* Main Column (Quick Add & Schedule Tasks) */}
          <View style={responsive.isDesktop ? styles.desktopMainCol : styles.fullWidth}>
            {/* Quick Add Task Card */}
            <ThemedView type="backgroundElement" style={styles.quickAddCard}>
              <ThemedText type="smallBold" style={styles.cardTitle}>Quick Add Task</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="What needs to be done?"
                  placeholderTextColor={theme.textSecondary}
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  onSubmitEditing={handleAddTask}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={handleAddTask}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>Add Task</ThemedText>
                </Pressable>
              </View>

              {/* Category selector pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.two }}>
                <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                  {CATEGORIES.map(cat => (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.catBadge,
                        {
                          backgroundColor: selectedCategory === cat ? theme.primary : theme.backgroundSelected,
                        },
                      ]}
                    >
                      <ThemedText
                        type="code"
                        style={{ fontSize: 11, color: selectedCategory === cat ? '#fff' : theme.text }}
                      >
                        {cat}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </ThemedView>

            {/* Schedule & Filters */}
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold">Today's Schedule ({filteredTasks.length})</ThemedText>
              <View style={styles.filterRow}>
                {(['All', 'Pending', 'Completed'] as const).map(f => (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[
                      styles.filterBtn,
                      { backgroundColor: filter === f ? theme.accent : theme.backgroundElement }
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: filter === f ? '#fff' : theme.textSecondary, fontWeight: filter === f ? 'bold' : 'normal' }}
                    >
                      {f}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Task items list */}
            {filteredTasks.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyState}>
                <ThemedText type="small" themeColor="textSecondary">No tasks found in this section.</ThemedText>
              </ThemedView>
            ) : (
              filteredTasks.map(task => (
                <ThemedView type="backgroundElement" key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <Pressable
                      style={styles.checkboxTouch}
                      onPress={() => toggleTaskStatus(task.id)}
                    >
                      <View
                        style={[
                          styles.taskCheckbox,
                          {
                            borderColor: theme.primary,
                            backgroundColor: task.status === 'Completed' ? theme.success : 'transparent',
                          },
                        ]}
                      >
                        {task.status === 'Completed' && (
                          <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 10 }}>✓</ThemedText>
                        )}
                      </View>
                    </Pressable>

                    <View style={styles.taskDetails}>
                      <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="code" style={{ fontSize: 10 }}>{task.category}</ThemedText>
                      </View>
                      <ThemedText type="default" style={task.status === 'Completed' ? styles.completedText : null}>
                        {task.title}
                      </ThemedText>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: Spacing.half }}>
                      <ThemedText type="small" themeColor="textSecondary">{task.time}</ThemedText>
                      <Pressable onPress={() => deleteTask(task.id)} style={styles.deleteBtn}>
                        <ThemedText type="small" style={{ color: theme.danger, fontSize: 12 }}>Delete</ThemedText>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.taskFooter}>
                    <View style={styles.taskProgressBox}>
                      <ThemedText type="small" themeColor="textSecondary" style={{ marginRight: Spacing.two }}>
                        {task.progress}%
                      </ThemedText>
                      <View style={[styles.progressTrack, { flex: 1, height: 6 }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${task.progress}%`,
                              backgroundColor: task.status === 'Completed' ? theme.success : theme.accent,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Pressable
                      onPress={() => toggleTaskStatus(task.id)}
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            task.status === 'Completed'
                              ? theme.success + '20'
                              : task.status === 'In Progress'
                              ? theme.accent + '20'
                              : theme.warning + '20',
                        },
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={{
                          fontSize: 12,
                          color:
                            task.status === 'Completed'
                              ? theme.success
                              : task.status === 'In Progress'
                              ? theme.accent
                              : theme.warning,
                        }}
                      >
                        {task.status}
                      </ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
              ))
            )}
          </View>

          {/* Side Column (Stats, Metrics, Focus & Habit Widgets) */}
          <View style={responsive.isDesktop ? styles.desktopSideCol : styles.fullWidth}>
            {/* Productivity Score & Metrics Card */}
            <ThemedView type="backgroundElement" style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <ThemedText type="smallBold">Productivity Score</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.primary }}>{stats.score}%</ThemedText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${stats.score}%`, backgroundColor: theme.primary }]} />
              </View>
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <ThemedText type="subtitle" style={{ color: theme.success }}>{stats.completed}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Completed</ThemedText>
                </View>
                <View style={[styles.metricItem, styles.borderLeft, { borderLeftColor: theme.border }]}>
                  <ThemedText type="subtitle" style={{ color: theme.warning }}>{stats.pending}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Pending</ThemedText>
                </View>
                <View style={[styles.metricItem, styles.borderLeft, { borderLeftColor: theme.border }]}>
                  <ThemedText type="subtitle" style={{ color: theme.danger }}>{stats.overdue}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Overdue</ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Split Focus & Habits Widgets */}
            <View style={styles.splitWidgets}>
              <ThemedView type="backgroundElement" style={styles.splitCard}>
                <ThemedText type="small" themeColor="textSecondary">Focus Time</ThemedText>
                <ThemedText type="subtitle" style={styles.splitValue}>1h 45m</ThemedText>
                <ThemedText type="small" style={{ color: theme.success }}>+12% today</ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.splitCard}>
                <ThemedText type="small" themeColor="textSecondary">Habit Streak</ThemedText>
                <ThemedText type="subtitle" style={styles.splitValue}>7 Days 🔥</ThemedText>
                <ThemedText type="small" style={{ color: theme.accent }}>Water: 4/5</ThemedText>
              </ThemedView>
            </View>

            {/* Desktop Exclusive Quick Insights Card */}
            {responsive.isDesktop && (
              <ThemedView type="backgroundElement" style={styles.desktopInsightCard}>
                <ThemedText type="smallBold" style={{ color: theme.primary, marginBottom: Spacing.one }}>
                  💡 Desktop Insights
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Your peak focus hours are between 10:00 AM and 1:00 PM. Keep your current momentum up!
                </ThemedText>
              </ThemedView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: BottomTabInset + Spacing.four,
    alignItems: 'center',
  },
  desktopContentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  desktopSafeArea: {
    maxWidth: 1300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  userName: {
    marginTop: Spacing.one,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mobileStack: {
    gap: Spacing.three,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  desktopMainCol: {
    flex: 6,
    gap: Spacing.three,
  },
  desktopSideCol: {
    flex: 4,
    gap: Spacing.three,
  },
  fullWidth: {
    width: '100%',
  },
  statsCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f030',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
  },
  splitWidgets: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  splitCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  splitValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  quickAddCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTitle: {
    marginBottom: Spacing.one,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? Spacing.two : Spacing.one,
    fontSize: 14,
  },
  addButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  filterBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  emptyState: {
    padding: Spacing.five,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  taskCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkboxTouch: {
    padding: Spacing.one,
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {
    flex: 1,
    gap: Spacing.half,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  deleteBtn: {
    padding: 2,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  taskProgressBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  statusBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  desktopInsightCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
});
