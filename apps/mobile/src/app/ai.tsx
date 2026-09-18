import React, { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { ApiService } from '@/services/api';

type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

export default function AiCoachScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const [loading, setLoading] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello Nazmul! I am your AI Productivity Coach. Ask me anything about your tasks, schedule optimization, habit building, or tap one of the quick shortcuts below!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const sendCustomPrompt = async (promptText: string, actionType?: string) => {
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    const apiResult = await ApiService.callAiCoach('default-user-nazmul', actionType || 'custom', { prompt: promptText });

    let responseText = '';
    if (apiResult && apiResult.response) {
      responseText = apiResult.response;
    } else {
      const queryLower = promptText.toLowerCase();
      if (queryLower.includes('plan') || actionType === 'plan') {
        responseText =
          `📅 **Suggested Daily Focus Plan:**\n\n` +
          `• **09:00 AM - 10:30 AM:** Core Deep Work Block: High-Priority Task Execution\n` +
          `• **10:45 AM - 11:30 AM:** Team Communications & Inbox Sweep\n` +
          `• **01:30 PM - 03:00 PM:** Focus Session: Project Deliverables\n` +
          `• **04:30 PM - 05:00 PM:** Daily Reflection & Habit Log`;
      } else if (queryLower.includes('prioritize') || actionType === 'prioritize') {
        responseText =
          `⚡ **Smart Priority Recommendations:**\n\n` +
          `1. **High Impact:** Design Facebook Campaign & Web Dev Core Auth\n` +
          `2. **Medium Impact:** Dev Team Sync & API Code Review\n` +
          `3. **Quick Wins:** Habit Check-ins & Daily Journaling`;
      } else if (queryLower.includes('break') || actionType === 'breakdown') {
        responseText =
          `📋 **Actionable Subtask Breakdown:**\n\n` +
          `• [ ] Step 1: Define key requirements & specs (20 mins)\n` +
          `• [ ] Step 2: Implement core prototype component (45 mins)\n` +
          `• [ ] Step 3: Run validation & verify edge cases (25 mins)\n` +
          `• [ ] Step 4: Final review & documentation (15 mins)`;
      } else if (queryLower.includes('review') || actionType === 'review') {
        responseText =
          `📊 **Weekly Performance Review:**\n\n` +
          `• **Completion Rate:** 84% tasks completed on time!\n` +
          `• **Focus Consistency:** Peak productivity hours between 10 AM - 1 PM.\n` +
          `• **Recommendation:** Maintain your 7-day habit streak for drinking water!`;
      } else {
        responseText =
          `💡 **AI Productivity Insight:**\n\n` +
          `Great question! To optimize "${promptText}", I recommend breaking down your objective into 25-minute Pomodoro sessions and blocking time on your Planner board. Would you like me to add this to your schedule?`;
      }
    }

    setLoading(false);
    const aiMsg: ChatMessage = {
      id: 'a_' + Date.now(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMsg]);
  };

  const handleShortcutClick = (actionKey: string, promptLabel: string) => {
    sendCustomPrompt(promptLabel, actionKey);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'm_init',
        sender: 'ai',
        text: 'Chat cleared. How can I assist you with your productivity goals today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <ThemedText type="subtitle">AI Productivity Coach ⭐</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Smart assistance for schedule optimization & task planning
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
              <View style={[styles.formatTag, { backgroundColor: theme.primary + '20' }]}>
                <ThemedText type="code" style={{ fontSize: 10, color: theme.primary }}>
                  {responsive.isDesktop ? '💻 Computer Split AI Panel' : '📱 Mobile Chat'}
                </ThemedText>
              </View>
              <Pressable onPress={clearChat} style={styles.clearBtn}>
                <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 12 }}>Clear</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Dual Layout: Split 2-column on desktop vs full chat on mobile */}
        <View style={responsive.isDesktop ? styles.desktopTwoColGrid : styles.mobileStack}>
          {/* SHORTCUTS & PROMPT TEMPLATES (Left Column on Desktop) */}
          <View style={responsive.isDesktop ? styles.desktopSidebarCol : styles.fullWidth}>
            <ThemedView type="backgroundElement" style={styles.shortcutsCard}>
              <ThemedText type="smallBold" style={{ color: theme.primary, marginBottom: Spacing.two }}>
                Quick Action Shortcuts
              </ThemedText>

              <View style={responsive.isDesktop ? styles.shortcutsVertical : styles.shortcutsGrid}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }
                  ]}
                  onPress={() => handleShortcutClick('plan', 'Plan My Day')}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>📅 Plan My Day</ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }
                  ]}
                  onPress={() => handleShortcutClick('prioritize', 'Prioritize Tasks')}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>⚡ Prioritize Tasks</ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.success, opacity: pressed ? 0.85 : 1 }
                  ]}
                  onPress={() => handleShortcutClick('breakdown', 'Break Down Task')}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>📋 Subtask Breakdown</ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: theme.warning, opacity: pressed ? 0.85 : 1 }
                  ]}
                  onPress={() => handleShortcutClick('review', 'Weekly Summary')}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>📊 Performance Review</ThemedText>
                </Pressable>
              </View>
            </ThemedView>

            {responsive.isDesktop && (
              <ThemedView type="backgroundElement" style={styles.coachingTopicCard}>
                <ThemedText type="smallBold" style={{ color: theme.accent, marginBottom: Spacing.one }}>
                  💡 Suggested Coaching Topics
                </ThemedText>
                <View style={{ gap: Spacing.one }}>
                  <Pressable onPress={() => sendCustomPrompt('How can I overcome afternoon procrastination?')}>
                    <ThemedText type="small" themeColor="textSecondary">• Overcoming afternoon fatigue</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => sendCustomPrompt('Suggest a time blocking template for software development.')}>
                    <ThemedText type="small" themeColor="textSecondary">• Time blocking for developers</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => sendCustomPrompt('How do I build a habit of reading 30 mins every night?')}>
                    <ThemedText type="small" themeColor="textSecondary">• Building reading routines</ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            )}
          </View>

          {/* CHAT MESSAGES & INPUT AREA (Right Column on Desktop) */}
          <View style={responsive.isDesktop ? styles.desktopMainChatCol : styles.fullWidth}>
            <ThemedView type="backgroundElement" style={styles.chatCard}>
              <View style={styles.messagesTimeline}>
                {messages.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                      {
                        backgroundColor: msg.sender === 'user' ? theme.primary : theme.backgroundSelected,
                      },
                    ]}
                  >
                    <View style={styles.msgHeader}>
                      <ThemedText
                        type="code"
                        style={{ fontSize: 10, color: msg.sender === 'user' ? '#ffffffcc' : theme.accent }}
                      >
                        {msg.sender === 'user' ? 'YOU' : 'AI COACH'}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={{ fontSize: 10, color: msg.sender === 'user' ? '#ffffffaa' : theme.textSecondary }}
                      >
                        {msg.timestamp}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="default"
                      style={{ color: msg.sender === 'user' ? '#ffffff' : theme.text, lineHeight: 20 }}
                    >
                      {msg.text}
                    </ThemedText>
                  </View>
                ))}

                {loading && (
                  <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.backgroundSelected }]}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
                      AI Coach is crafting your response...
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Chat Input Container */}
              <View style={styles.inputBoxContainer}>
                <TextInput
                  style={[
                    styles.chatInput,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder="Ask your AI Coach anything..."
                  placeholderTextColor={theme.textSecondary}
                  value={inputPrompt}
                  onChangeText={setInputPrompt}
                  onSubmitEditing={() => sendCustomPrompt(inputPrompt)}
                  multiline={responsive.isDesktop}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.sendBtn,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed || loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => sendCustomPrompt(inputPrompt)}
                  disabled={loading}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>Send</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
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
    paddingVertical: Spacing.two,
  },
  formatTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clearBtn: {
    padding: Spacing.one,
  },
  mobileStack: {
    gap: Spacing.three,
  },
  desktopTwoColGrid: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'flex-start',
  },
  desktopSidebarCol: {
    flex: 4,
    gap: Spacing.three,
  },
  desktopMainChatCol: {
    flex: 8,
  },
  fullWidth: {
    width: '100%',
    gap: Spacing.three,
  },
  shortcutsCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  shortcutsVertical: {
    gap: Spacing.two,
  },
  actionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachingTopicCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  chatCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: 400,
  },
  messagesTimeline: {
    gap: Spacing.three,
    minHeight: 280,
  },
  messageBubble: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    maxWidth: '90%',
    gap: Spacing.one,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputBoxContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
