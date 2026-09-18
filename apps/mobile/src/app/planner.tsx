import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { ApiService } from '@/services/api';

type ViewMode = 'kanban' | 'daily' | 'weekly' | 'projects';

type KanbanTask = {
  id: string;
  title: string;
  stage: 'ToDo' | 'Doing' | 'Review' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  prj: string;
};

type ProjectItem = {
  id: string;
  name: string;
  status: 'In Progress' | 'On Hold' | 'Completed';
  tasksTotal: number;
  tasksDone: number;
};

const INITIAL_KANBAN: KanbanTask[] = [
  { id: 'k1', title: 'Design Landing Page', stage: 'ToDo', priority: 'High', prj: 'Web Dev' },
  { id: 'k2', title: 'Integrate Auth API', stage: 'Doing', priority: 'High', prj: 'Web Dev' },
  { id: 'k3', title: 'Write API Tests', stage: 'Review', priority: 'Medium', prj: 'Backend' },
  { id: 'k4', title: 'Draft Launch Email', stage: 'Done', priority: 'Low', prj: 'Marketing' },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  { id: 'p1', name: 'Website Development', status: 'In Progress', tasksTotal: 25, tasksDone: 18 },
  { id: 'p2', name: 'Marketing Campaign', status: 'On Hold', tasksTotal: 12, tasksDone: 6 },
  { id: 'p3', name: 'Mobile App Launch', status: 'In Progress', tasksTotal: 30, tasksDone: 15 },
];

export default function PlannerScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const [mode, setMode] = useState<ViewMode>('kanban');

  // Kanban state
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(INITIAL_KANBAN);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardPrj, setNewCardPrj] = useState('Web Dev');
  const [newCardPriority, setNewCardPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Projects state
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [newPrjName, setNewPrjName] = useState('');

  // Daily checklist state
  const [dailyChecklist, setDailyChecklist] = useState([
    { id: 'd1', text: 'Drink water (500ml)', done: true },
    { id: 'd2', text: 'Set Top 3 Priorities', done: true },
    { id: 'd3', text: 'Review calendar events', done: false },
    { id: 'd4', text: 'Evening reflection & journal', done: false },
  ]);

  // Selected Day in Weekly view
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const localKanban = ApiService.getLocalData('app_kanban', INITIAL_KANBAN);
    const localProjects = ApiService.getLocalData('app_projects', INITIAL_PROJECTS);
    setKanbanTasks(localKanban);
    setProjects(localProjects);
  }, []);

  const saveKanban = (tasks: KanbanTask[]) => {
    setKanbanTasks(tasks);
    ApiService.saveLocalData('app_kanban', tasks);
  };

  const addKanbanCard = () => {
    if (!newCardTitle.trim()) return;
    const newCard: KanbanTask = {
      id: 'k_' + Date.now(),
      title: newCardTitle.trim(),
      stage: 'ToDo',
      priority: newCardPriority,
      prj: newCardPrj || 'General',
    };
    saveKanban([...kanbanTasks, newCard]);
    setNewCardTitle('');
  };

  const moveTask = (taskId: string) => {
    const stages: ('ToDo' | 'Doing' | 'Review' | 'Done')[] = ['ToDo', 'Doing', 'Review', 'Done'];
    const updated = kanbanTasks.map(t => {
      if (t.id === taskId) {
        const nextIndex = (stages.indexOf(t.stage) + 1) % stages.length;
        return { ...t, stage: stages[nextIndex] };
      }
      return t;
    });
    saveKanban(updated);
  };

  const deleteKanbanCard = (taskId: string) => {
    saveKanban(kanbanTasks.filter(t => t.id !== taskId));
  };

  const addProject = () => {
    if (!newPrjName.trim()) return;
    const newPrj: ProjectItem = {
      id: 'p_' + Date.now(),
      name: newPrjName.trim(),
      status: 'In Progress',
      tasksTotal: 10,
      tasksDone: 0,
    };
    const updated = [...projects, newPrj];
    setProjects(updated);
    ApiService.saveLocalData('app_projects', updated);
    setNewPrjName('');
  };

  const toggleDailyItem = (id: string) => {
    setDailyChecklist(dailyChecklist.map(d => d.id === id ? { ...d, done: !d.done } : d));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return theme.danger;
      case 'Medium': return theme.warning;
      default: return theme.primary;
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        responsive.isDesktop && styles.desktopContentContainer,
      ]}
    >
      <SafeAreaView style={[styles.safeArea, responsive.isDesktop && styles.desktopSafeArea]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle">Planner & Workspace</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Kanban boards, project tracking & daily schedule
            </ThemedText>
          </View>

          <View style={[styles.formatTag, { backgroundColor: theme.primary + '20' }]}>
            <ThemedText type="code" style={{ fontSize: 10, color: theme.primary }}>
              {responsive.isDesktop ? '💻 Computer Board' : '📱 Mobile List'}
            </ThemedText>
          </View>
        </View>

        {/* View Mode Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabsContainer}>
            {(['kanban', 'daily', 'weekly', 'projects'] as ViewMode[]).map(tab => (
              <Pressable
                key={tab}
                style={[
                  styles.tabButton,
                  mode === tab ? { backgroundColor: theme.primary } : { backgroundColor: theme.backgroundElement }
                ]}
                onPress={() => setMode(tab)}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: mode === tab ? '#ffffff' : theme.text }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* --- KANBAN VIEW --- */}
        {mode === 'kanban' && (
          <View style={styles.boardContainer}>
            {/* Quick Add Card Form */}
            <ThemedView type="backgroundElement" style={styles.quickAddBoard}>
              <ThemedText type="smallBold">Add New Kanban Card</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Task title..."
                  placeholderTextColor={theme.textSecondary}
                  value={newCardTitle}
                  onChangeText={setNewCardTitle}
                />
                <TextInput
                  style={[styles.input, { width: 100, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Project..."
                  placeholderTextColor={theme.textSecondary}
                  value={newCardPrj}
                  onChangeText={setNewCardPrj}
                />
                <Pressable
                  style={[styles.addCardBtn, { backgroundColor: theme.primary }]}
                  onPress={addKanbanCard}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Add</ThemedText>
                </Pressable>
              </View>

              {/* Priority Selector */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                <ThemedText type="small" themeColor="textSecondary">Priority:</ThemedText>
                {(['High', 'Medium', 'Low'] as const).map(p => (
                  <Pressable
                    key={p}
                    onPress={() => setNewCardPriority(p)}
                    style={[
                      styles.prioTag,
                      { backgroundColor: newCardPriority === p ? getPriorityColor(p) : theme.backgroundSelected }
                    ]}
                  >
                    <ThemedText type="code" style={{ fontSize: 10, color: newCardPriority === p ? '#fff' : theme.text }}>
                      {p}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ThemedView>

            <ThemedText type="small" themeColor="textSecondary" style={{ marginVertical: Spacing.one }}>
              💡 Tap any card to advance it to the next workflow stage
            </ThemedText>

            {/* Kanban Columns (Desktop multi-column grid vs mobile vertical column stack) */}
            <View style={responsive.isDesktop ? styles.desktopKanbanGrid : styles.mobileKanbanStack}>
              {['ToDo', 'Doing', 'Review', 'Done'].map(stage => {
                const stageTasks = kanbanTasks.filter(t => t.stage === stage);
                return (
                  <ThemedView
                    type="backgroundElement"
                    key={stage}
                    style={[styles.column, responsive.isDesktop && styles.desktopColumn]}
                  >
                    <View style={styles.columnHeader}>
                      <ThemedText type="smallBold">{stage}</ThemedText>
                      <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="code" style={{ fontSize: 10 }}>
                          {stageTasks.length}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.cardsList}>
                      {stageTasks.length === 0 ? (
                        <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic', paddingVertical: Spacing.one }}>
                          Empty
                        </ThemedText>
                      ) : (
                        stageTasks.map(task => (
                          <Pressable
                            key={task.id}
                            onPress={() => moveTask(task.id)}
                            style={({ pressed }) => [
                              styles.kanbanCard,
                              { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.9 : 1 }
                            ]}
                          >
                            <View style={styles.cardProjectRow}>
                              <ThemedText type="code" style={{ fontSize: 10, color: theme.accent }}>
                                {task.prj}
                              </ThemedText>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                                <View
                                  style={[
                                    styles.priorityIndicator,
                                    { backgroundColor: getPriorityColor(task.priority) }
                                  ]}
                                />
                                <Pressable onPress={() => deleteKanbanCard(task.id)} style={{ paddingLeft: 4 }}>
                                  <ThemedText type="small" style={{ color: theme.danger, fontSize: 11 }}>✕</ThemedText>
                                </Pressable>
                              </View>
                            </View>
                            <ThemedText type="smallBold" style={styles.cardTitle}>{task.title}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11, marginTop: 4 }}>
                              Stage: {task.stage} ➔
                            </ThemedText>
                          </Pressable>
                        ))
                      )}
                    </View>
                  </ThemedView>
                );
              })}
            </View>
          </View>
        )}

        {/* --- DAILY VIEW --- */}
        {mode === 'daily' && (
          <View style={responsive.isDesktop ? styles.desktopSplitView : styles.detailsContainer}>
            <ThemedView type="backgroundElement" style={[styles.infoCard, responsive.isDesktop && styles.flexHalf]}>
              <ThemedText type="smallBold" style={{ color: theme.primary, marginBottom: Spacing.two }}>
                Daily Planning Checklist
              </ThemedText>
              {dailyChecklist.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => toggleDailyItem(item.id)}
                  style={styles.checklistRow}
                >
                  <View style={[styles.checkbox, { borderColor: theme.border, backgroundColor: item.done ? theme.success : 'transparent' }]}>
                    {item.done && <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 10 }}>✓</ThemedText>}
                  </View>
                  <ThemedText
                    type="small"
                    style={[styles.checkText, item.done ? { textDecorationLine: 'line-through', opacity: 0.6 } : null]}
                  >
                    {item.text}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>

            <View style={[styles.detailsContainer, responsive.isDesktop && styles.flexHalf]}>
              <ThemedView type="backgroundElement" style={styles.infoCard}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>Today's Core Focus</ThemedText>
                <ThemedText type="default">"Complete Mobile App Features & Conduct Real User Verification"</ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.infoCard}>
                <ThemedText type="smallBold" style={{ color: theme.warning }}>Time-Blocking Schedule</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  • 09:00 AM - 10:30 AM: Deep Work & Code Architecture {'\n'}
                  • 11:00 AM - 12:30 PM: Feature Completion & Refactoring {'\n'}
                  • 02:00 PM - 04:00 PM: Verification & Browser Testing
                </ThemedText>
              </ThemedView>
            </View>
          </View>
        )}

        {/* --- WEEKLY VIEW --- */}
        {mode === 'weekly' && (
          <View style={styles.detailsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.two, paddingBottom: Spacing.two }}>
                {daysOfWeek.map((day, idx) => (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDayIndex(idx)}
                    style={[
                      styles.daySelectorBtn,
                      { backgroundColor: selectedDayIndex === idx ? theme.primary : theme.backgroundElement }
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: selectedDayIndex === idx ? '#fff' : theme.text }}
                    >
                      {day.substring(0, 3)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <ThemedView type="backgroundElement" style={styles.dayCard}>
              <ThemedText type="subtitle" style={{ color: theme.primary }}>{daysOfWeek[selectedDayIndex]}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                Scheduled Objectives & Key Milestones:
              </ThemedText>
              <View style={{ marginTop: Spacing.two, gap: Spacing.two }}>
                <ThemedText type="default">• Sprint Planning & Team Alignment</ThemedText>
                <ThemedText type="default">• Feature Deployment & QA Testing</ThemedText>
                <ThemedText type="default">• User Feedback Sync & Demo Session</ThemedText>
              </View>
            </ThemedView>
          </View>
        )}

        {/* --- PROJECTS VIEW --- */}
        {mode === 'projects' && (
          <View style={styles.detailsContainer}>
            <ThemedView type="backgroundElement" style={styles.infoCard}>
              <ThemedText type="smallBold">Create New Project</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Project name..."
                  placeholderTextColor={theme.textSecondary}
                  value={newPrjName}
                  onChangeText={setNewPrjName}
                />
                <Pressable
                  style={[styles.addCardBtn, { backgroundColor: theme.accent }]}
                  onPress={addProject}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Create</ThemedText>
                </Pressable>
              </View>
            </ThemedView>

            {/* Projects Grid for Desktop vs Vertical stack for Mobile */}
            <View style={responsive.isDesktop ? styles.desktopProjectsGrid : styles.detailsContainer}>
              {projects.map(prj => {
                const pct = prj.tasksTotal > 0 ? Math.round((prj.tasksDone / prj.tasksTotal) * 100) : 0;
                return (
                  <ThemedView
                    type="backgroundElement"
                    key={prj.id}
                    style={[styles.projectCard, responsive.isDesktop && styles.desktopProjectCard]}
                  >
                    <View style={styles.projectHeader}>
                      <ThemedText type="default" style={{ fontWeight: 'bold' }}>{prj.name}</ThemedText>
                      <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="code" style={{ color: theme.primary, fontSize: 11 }}>
                          {prj.status}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      Tasks Progress: {prj.tasksDone} / {prj.tasksTotal} completed ({pct}%)
                    </ThemedText>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.primary }]} />
                    </View>
                  </ThemedView>
                );
              })}
            </View>
          </View>
        )}
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
    paddingVertical: Spacing.two,
  },
  formatTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabScroll: {
    marginVertical: Spacing.one,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tabButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  boardContainer: {
    gap: Spacing.two,
  },
  quickAddBoard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  addCardBtn: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  prioTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  mobileKanbanStack: {
    gap: Spacing.three,
  },
  desktopKanbanGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  column: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  desktopColumn: {
    flex: 1,
    minWidth: 240,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  cardsList: {
    gap: Spacing.two,
  },
  kanbanCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  cardProjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 14,
  },
  detailsContainer: {
    gap: Spacing.three,
  },
  desktopSplitView: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  flexHalf: {
    flex: 1,
  },
  infoCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
  },
  daySelectorBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  dayCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  desktopProjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  projectCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  desktopProjectCard: {
    width: '48%',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e2e8f030',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
