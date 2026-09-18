import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Pressable, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useResponsive } from '@/hooks/use-responsive';

type FocusNote = {
  id: string;
  text: string;
  done: boolean;
};

export default function FocusScreen() {
  const theme = useTheme();
  const responsive = useResponsive();

  // Pomodoro Timer States
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes default
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(1500);

  // Ambient Sound State & Synthesizer Ref
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioCtxRef = useRef<any>(null);
  const soundNodeRef = useRef<any>(null);

  // Notes state
  const [notes, setNotes] = useState<FocusNote[]>([
    { id: 'n1', text: 'Structure backend schema mapping', done: true },
    { id: 'n2', text: 'Write tests for task rescheduling API', done: false },
    { id: 'n3', text: 'Verify mobile app screens like a real user', done: false },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Pomodoro Countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Audio Synthesizer for Ambient Sounds (Web Audio API)
  const stopAmbientAudio = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop?.();
        soundNodeRef.current.disconnect?.();
      } catch (e) {}
      soundNodeRef.current = null;
    }
  };

  const playAmbientAudio = (soundName: string) => {
    stopAmbientAudio();
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        if (soundName === 'Rain') {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        } else if (soundName === 'Forest') {
          output[i] = Math.sin(i / 100) * 0.05 + (Math.random() * 2 - 1) * 0.05;
        } else {
          output[i] = (Math.random() * 2 - 1) * 0.1;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = soundName === 'Rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = soundName === 'Rain' ? 800 : 1200;

      whiteNoise.connect(filter);
      filter.connect(ctx.destination);
      whiteNoise.start();

      soundNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn('Audio Synth Error:', e);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientAudio();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const selectDuration = (mins: number) => {
    setIsActive(false);
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
  };

  const toggleSound = (soundName: string) => {
    if (activeSound === soundName) {
      setActiveSound(null);
      stopAmbientAudio();
    } else {
      setActiveSound(soundName);
      playAmbientAudio(soundName);
    }
  };

  const toggleNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const newN: FocusNote = {
      id: 'n_' + Date.now(),
      text: newNoteText.trim(),
      done: false,
    };
    setNotes([...notes, newN]);
    setNewNoteText('');
  };

  const clearCompletedNotes = () => {
    setNotes(notes.filter(n => !n.done));
  };

  const calculateProgressPct = () => {
    if (duration === 0) return 0;
    return Math.round(((duration - timeLeft) / duration) * 100);
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
        {/* Title */}
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle">Focus & Soundscape Studio</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Immerse yourself using Pomodoro timer & acoustic soundscapes
            </ThemedText>
          </View>
          <View style={[styles.formatTag, { backgroundColor: theme.primary + '20' }]}>
            <ThemedText type="code" style={{ fontSize: 10, color: theme.primary }}>
              {responsive.isDesktop ? '💻 Computer Split Workspace' : '📱 Mobile Stack'}
            </ThemedText>
          </View>
        </View>

        {/* Dual Layout: Widescreen split on desktop vs vertical column on mobile */}
        <View style={responsive.isDesktop ? styles.desktopTwoColGrid : styles.mobileStack}>
          {/* TIMER & SOUNDS COLUMN */}
          <View style={responsive.isDesktop ? styles.flexHalf : styles.fullWidth}>
            {/* Pomodoro Timer Card */}
            <ThemedView type="backgroundElement" style={styles.timerCard}>
              <View style={styles.cardHeaderRow}>
                <ThemedText type="smallBold">Pomodoro Focus Timer</ThemedText>
                <ThemedText type="code" style={{ color: theme.accent, fontSize: 11 }}>
                  {calculateProgressPct()}% Progress
                </ThemedText>
              </View>

              <ThemedText type="title" style={styles.timerDisplay}>
                {formatTime(timeLeft)}
              </ThemedText>

              {/* Progress bar line */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${calculateProgressPct()}%`, backgroundColor: theme.primary }
                  ]}
                />
              </View>

              {/* Preset Duration Buttons */}
              <View style={styles.presetsRow}>
                {[25, 50, 15, 5].map(mins => (
                  <Pressable
                    key={mins}
                    style={[
                      styles.presetBtn,
                      { backgroundColor: duration === mins * 60 ? theme.primary : theme.backgroundSelected }
                    ]}
                    onPress={() => selectDuration(mins)}
                  >
                    <ThemedText type="smallBold" style={{ color: duration === mins * 60 ? '#fff' : theme.text }}>
                      {mins}m
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Controls */}
              <View style={styles.controlsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.controlBtn,
                    { backgroundColor: isActive ? theme.warning : theme.success, opacity: pressed ? 0.9 : 1 }
                  ]}
                  onPress={handleStartPause}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>
                    {isActive ? 'Pause' : 'Start Focus'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.controlBtn,
                    { backgroundColor: theme.danger, opacity: pressed ? 0.9 : 1 }
                  ]}
                  onPress={handleReset}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>
                    Reset
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>

            {/* Ambient Soundscape Synthesizer */}
            <ThemedView type="backgroundElement" style={styles.soundSection}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>Acoustic Soundscapes</ThemedText>
              <View style={styles.soundsRow}>
                {['Rain', 'Forest', 'White Noise'].map(sound => (
                  <Pressable
                    key={sound}
                    onPress={() => toggleSound(sound)}
                    style={({ pressed }) => [
                      styles.soundCard,
                      {
                        backgroundColor: activeSound === sound ? theme.accent : theme.backgroundSelected,
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: activeSound === sound ? '#ffffff' : theme.text }}
                    >
                      {sound}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: activeSound === sound ? '#ffffff' : theme.textSecondary }}>
                      {activeSound === sound ? '🔊 Active' : '🔇 Off'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ThemedView>
          </View>

          {/* FOCUS SCRATCHPAD COLUMN */}
          <View style={responsive.isDesktop ? styles.flexHalf : styles.fullWidth}>
            <ThemedView type="backgroundElement" style={styles.notesSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two }}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>Focus Scratchpad & Quick Tasks</ThemedText>
                {notes.some(n => n.done) && (
                  <Pressable onPress={clearCompletedNotes}>
                    <ThemedText type="small" style={{ color: theme.danger, fontSize: 11 }}>Clear Done</ThemedText>
                  </Pressable>
                )}
              </View>

              <View style={styles.noteInputRow}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="Add note or subtask..."
                  placeholderTextColor={theme.textSecondary}
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                  onSubmitEditing={addNote}
                />
                <Pressable
                  style={[styles.addNoteBtn, { backgroundColor: theme.primary }]}
                  onPress={addNote}
                >
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>+ Add</ThemedText>
                </Pressable>
              </View>

              <View style={styles.notesList}>
                {notes.map(note => (
                  <Pressable
                    key={note.id}
                    onPress={() => toggleNote(note.id)}
                    style={styles.noteItem}
                  >
                    <View style={[styles.checkbox, { borderColor: theme.border, backgroundColor: note.done ? theme.success : 'transparent' }]}>
                      {note.done && <ThemedText type="smallBold" style={{ color: '#fff', fontSize: 10 }}>✓</ThemedText>}
                    </View>
                    <ThemedText
                      type="small"
                      style={[styles.noteText, note.done ? { textDecorationLine: 'line-through', opacity: 0.6 } : null]}
                    >
                      {note.text}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {responsive.isDesktop && (
                <View style={styles.sessionLogBox}>
                  <ThemedText type="smallBold" style={{ color: theme.primary, marginBottom: 4 }}>
                    📊 Session Productivity Summary
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    • 3 Completed Pomodoros today (75 mins total focus){'\n'}
                    • Ambient acoustic soundscape: {activeSound || 'None'}{'\n'}
                    • Next break scheduled in {formatTime(timeLeft)}
                  </ThemedText>
                </View>
              )}
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
  mobileStack: {
    gap: Spacing.three,
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
  timerCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 54,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginVertical: Spacing.two,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f030',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  presetBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  controlBtn: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  soundSection: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
  },
  soundsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  soundCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: 4,
  },
  notesSection: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  noteInputRow: {
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
  addNoteBtn: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.two,
  },
  notesList: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  noteItem: {
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
  noteText: {
    fontSize: 14,
  },
  sessionLogBox: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#4f46e510',
  },
});
