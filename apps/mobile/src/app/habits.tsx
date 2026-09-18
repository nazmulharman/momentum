import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { ApiService } from '@/services/api';

type HabitItem = {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  goal: string;
};

type GoalItem = {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
};

const INITIAL_HABITS: HabitItem[] = [
  { id: 'h1', name: 'Drink Water', streak: 12, completedToday: false, goal: '5 cups daily' },
  { id: 'h2', name: 'Read Book', streak: 5, completedToday: true, goal: '30 mins daily' },
  { id: 'h3', name: 'Morning Exercise', streak: 3, completedToday: false, goal: '1 hr workout' },
  { id: 'h4', name: 'Mindful Meditation', streak: 14, completedToday: true, goal: '15 mins daily' },
];

const INITIAL_GOALS: GoalItem[] = [
  { id: 'g1', title: 'Read 30 Books', current: 18, target: 30, unit: 'books' },
  { id: 'g2', title: 'Coding Masterclass', current: 75, target: 100, unit: '%' },
  { id: 'g3', title: 'Run 100 Kilometers', current: 42, target: 100, unit: 'km' },
];

export default function HabitsScreen() {
  const theme = useTheme();
  const responsive = useResponsive();

  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOALS);

  // New Habit inputs
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('');

  // New Goal inputs
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('10');
  const [newGoalUnit, setNewGoalUnit] = useState('hrs');

  useEffect(() => {
    async function initData() {
      const serverHabits = await ApiService.getHabits();
      if (serverHabits && Array.isArray(serverHabits) && serverHabits.length > 0) {
        setHabits(serverHabits);
      } else {
        const localH = ApiService.getLocalData('app_habits', INITIAL_HABITS);
        setHabits(localH);
      }
      const localG = ApiService.getLocalData('app_goals', INITIAL_GOALS);
      setGoals(localG);
    }
    initData();
  }, []);

  const saveHabits = (newHabits: HabitItem[]) => {
    setHabits(newHabits);
    ApiService.saveLocalData('app_habits', newHabits);
  };

  const saveGoals = (newGoals: GoalItem[]) => {
    setGoals(newGoals);
    ApiService.saveLocalData('app_goals', newGoals);
  };

  const toggleHabit = async (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const completed = !h.completedToday;
        return {
          ...h,
          completedToday: completed,
          streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      }
      return h;
    });
    saveHabits(updated);

    const target = updated.find(h => h.id === id);
    if (target) {
      await ApiService.updateHabit(id, target);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const newH: HabitItem = {
      id: 'h_' + Date.now(),
      name: newHabitName.trim(),
      streak: 1,
      completedToday: false,
      goal: newHabitGoal.trim() || 'Daily habit',
    };
    saveHabits([newH, ...habits]);
    setNewHabitName('');
    setNewHabitGoal('');

    await ApiService.createHabit('default-user-nazmul', newH);
  };

  const deleteHabit = (id: string) => {
    saveHabits(habits.filter(h => h.id !== id));
  };

  const updateGoalProgress = (id: string, delta: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const nextVal = Math.min(g.target, Math.max(0, g.current + delta));
        return { ...g, current: nextVal };
      }
      return g;
    });
    saveGoals(updated);
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    const targetNum = parseInt(newGoalTarget) || 10;
    const newG: GoalItem = {
      id: 'g_' + Date.now(),
      title: newGoalTitle.trim(),
      current: 0,
      target: targetNum,
      unit: newGoalUnit.trim() || 'units',
    };
    saveGoals([...goals, newG]);
    setNewGoalTitle('');
    setNewGoalTarget('10');
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
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
            <ThemedText type="subtitle">Habits & Goal Tracker</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Build daily routines & achieve your long-term milestones
            </ThemedText>
          </View>
          <View style={[styles.formatTag, { backgroundColor: theme.primary + '20' }]}>
            <ThemedText type="code" style={{ fontSize: 10, color: theme.primary }}>
              {responsive.isDesktop ? '💻 Widescreen Split Format' : '📱 Mobile Stack'}
            </ThemedText>
          </View>
        </View>

        {/* Top Habit Stats Metric Row */}
        <View style={styles.topMetricRow}>
          <ThemedView type="backgroundElement" style={styles.topMetricCard}>
            <ThemedText type="subtitle" style={{ color: theme.accent }}>
              {habits.filter(h => h.completedToday).length} / {habits.length}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Completed Today</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.topMetricCard}>
            <ThemedText type="subtitle" style={{ color: theme.warning }}>
              {Math.max(0, ...habits.map(h => h.streak))} Days 🔥
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Best Active Streak</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.topMetricCard}>
            <ThemedText type="subtitle" style={{ color: theme.success }}>
              {goals.length} Goals
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">In Active Tracking</ThemedText>
          </ThemedView>
        </View>

        {/* Dual Layout: Side-by-side 2-column on desktop vs vertical stack on mobile */}
        <View style={responsive.isDesktop ? styles.desktopTwoColGrid : styles.mobileStack}>
          {/* HABITS SECTION */}
          <View style={responsive.isDesktop ? styles.flexHalf : styles.fullWidth}>
            <ThemedView type="backgroundElement" style={styles.sectionCard}>
              <ThemedText type="smallBold" style={{ color: theme.primary }}>Add New Habit</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Habit name (e.g. Exercise)"
                  placeholderTextColor={theme.textSecondary}
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                />
                <TextInput
                  style={[styles.input, { width: 110, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Goal target"
                  placeholderTextColor={theme.textSecondary}
                  value={newHabitGoal}
                  onChangeText={setNewHabitGoal}
                />
                <Pressable
                  style={[styles.addBtn, { backgroundColor: theme.primary }]}
                  onPress={addHabit}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Add</ThemedText>
                </Pressable>
              </View>
            </ThemedView>

            <View style={styles.cardsList}>
              {habits.map(habit => (
                <ThemedView type="backgroundElement" key={habit.id} style={styles.habitCard}>
                  <View style={styles.habitMainRow}>
                    <Pressable
                      style={[
                        styles.habitCheckbox,
                        {
                          borderColor: theme.primary,
                          backgroundColor: habit.completedToday ? theme.success : 'transparent',
                        },
                      ]}
                      onPress={() => toggleHabit(habit.id)}
                    >
                      {habit.completedToday && <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 12 }}>✓</ThemedText>}
                    </Pressable>

                    <View style={styles.habitInfo}>
                      <ThemedText
                        type="default"
                        style={[styles.habitName, habit.completedToday ? { textDecorationLine: 'line-through', opacity: 0.6 } : null]}
                      >
                        {habit.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Target: {habit.goal}
                      </ThemedText>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: Spacing.half }}>
                      <View style={[styles.streakBadge, { backgroundColor: theme.warning + '20' }]}>
                        <ThemedText type="code" style={{ fontSize: 11, color: theme.warning }}>
                          {habit.streak} Days 🔥
                        </ThemedText>
                      </View>
                      <Pressable onPress={() => deleteHabit(habit.id)}>
                        <ThemedText type="small" style={{ color: theme.danger, fontSize: 11 }}>Delete</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </ThemedView>
              ))}
            </View>
          </View>

          {/* GOALS SECTION */}
          <View style={responsive.isDesktop ? styles.flexHalf : styles.fullWidth}>
            <ThemedView type="backgroundElement" style={styles.sectionCard}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>Add Long-term Goal</ThemedText>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Goal title..."
                  placeholderTextColor={theme.textSecondary}
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                />
                <TextInput
                  style={[styles.input, { width: 60, color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Target"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                />
                <Pressable
                  style={[styles.addBtn, { backgroundColor: theme.accent }]}
                  onPress={addGoal}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Create</ThemedText>
                </Pressable>
              </View>
            </ThemedView>

            <View style={styles.cardsList}>
              {goals.map(goal => {
                const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
                return (
                  <ThemedView type="backgroundElement" key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <ThemedText type="default" style={{ fontWeight: 'bold' }}>{goal.title}</ThemedText>
                      <Pressable onPress={() => deleteGoal(goal.id)}>
                        <ThemedText type="small" style={{ color: theme.danger, fontSize: 11 }}>Delete</ThemedText>
                      </Pressable>
                    </View>

                    <ThemedText type="small" themeColor="textSecondary">
                      Progress: {goal.current} / {goal.target} {goal.unit} ({pct}%)
                    </ThemedText>

                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
                    </View>

                    <View style={styles.goalActions}>
                      <Pressable
                        style={[styles.stepBtn, { backgroundColor: theme.backgroundSelected }]}
                        onPress={() => updateGoalProgress(goal.id, -1)}
                      >
                        <ThemedText type="smallBold">-1</ThemedText>
                      </Pressable>
                      <Pressable
                        style={[styles.stepBtn, { backgroundColor: theme.backgroundSelected }]}
                        onPress={() => updateGoalProgress(goal.id, 1)}
                      >
                        <ThemedText type="smallBold">+1</ThemedText>
                      </Pressable>
                      <Pressable
                        style={[styles.stepBtn, { backgroundColor: theme.accent + '20' }]}
                        onPress={() => updateGoalProgress(goal.id, 5)}
                      >
                        <ThemedText type="smallBold" style={{ color: theme.accent }}>+5</ThemedText>
                      </Pressable>
                    </View>
                  </ThemedView>
                );
              })}
            </View>
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
    paddingVertical: Spacing.two,
  },
  formatTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  topMetricRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  topMetricCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: Spacing.half,
  },
  mobileStack: {
    gap: Spacing.four,
  },
  desktopTwoColGrid: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  flexHalf: {
    flex: 1,
    gap: Spacing.three,
  },
  fullWidth: {
    width: '100%',
    gap: Spacing.three,
  },
  sectionCard: {
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
  addBtn: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  cardsList: {
    gap: Spacing.two,
  },
  habitCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  habitMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  habitCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goalCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  goalHeader: {
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
  goalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  stepBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
});
