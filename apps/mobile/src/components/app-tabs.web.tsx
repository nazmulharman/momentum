import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

export default function AppTabs() {
  const responsive = useResponsive();

  return (
    <Tabs style={responsive.isDesktop ? styles.desktopWrapper : styles.mobileWrapper}>
      {/* Desktop Navigation Sidebar (Rendered on >= 768px or Desktop override) */}
      {responsive.isDesktop ? (
        <TabList asChild>
          <DesktopSidebarContainer responsive={responsive}>
            <TabTrigger name="home" href="/" asChild>
              <SidebarTabButton icon="🏠">Dashboard</SidebarTabButton>
            </TabTrigger>
            <TabTrigger name="planner" href="/planner" asChild>
              <SidebarTabButton icon="📅">Planner & Kanban</SidebarTabButton>
            </TabTrigger>
            <TabTrigger name="habits" href="/habits" asChild>
              <SidebarTabButton icon="🔥">Habits & Goals</SidebarTabButton>
            </TabTrigger>
            <TabTrigger name="focus" href="/focus" asChild>
              <SidebarTabButton icon="⏱️">Focus & Ambient</SidebarTabButton>
            </TabTrigger>
            <TabTrigger name="ai" href="/ai" asChild>
              <SidebarTabButton icon="🤖">AI Coach</SidebarTabButton>
            </TabTrigger>
          </DesktopSidebarContainer>
        </TabList>
      ) : (
        <MobileHeader responsive={responsive} />
      )}

      {/* Main Content Slot */}
      <TabSlot style={responsive.isDesktop ? styles.desktopContentArea : { flex: 1 }} />

      {/* Mobile Bottom Docked Navigation Bar (Rendered on < 768px or Mobile override) */}
      {!responsive.isDesktop && (
        <TabList asChild>
          <MobileTabListContainer>
            <TabTrigger name="home" href="/" asChild>
              <MobileTabButton icon="🏠">Dashboard</MobileTabButton>
            </TabTrigger>
            <TabTrigger name="planner" href="/planner" asChild>
              <MobileTabButton icon="📅">Planner</MobileTabButton>
            </TabTrigger>
            <TabTrigger name="habits" href="/habits" asChild>
              <MobileTabButton icon="🔥">Habits</MobileTabButton>
            </TabTrigger>
            <TabTrigger name="focus" href="/focus" asChild>
              <MobileTabButton icon="⏱️">Focus</MobileTabButton>
            </TabTrigger>
            <TabTrigger name="ai" href="/ai" asChild>
              <MobileTabButton icon="🤖">AI Coach</MobileTabButton>
            </TabTrigger>
          </MobileTabListContainer>
        </TabList>
      )}
    </Tabs>
  );
}

function DesktopSidebarContainer(props: TabListProps & { responsive: ReturnType<typeof useResponsive> }) {
  const { responsive, children, ...restProps } = props;
  const isDesktopActive =
    responsive.overrideFormat === 'desktop' ||
    (responsive.overrideFormat === 'auto' && responsive.actualIsDesktop);

  return (
    <View {...restProps} style={styles.desktopSidebar}>
      {/* Sidebar Header & Branding */}
      <ThemedView type="backgroundElement" style={styles.sidebarCard}>
        <View style={styles.brandRow}>
          <ThemedText type="subtitle" style={styles.brandTitle}>⚡ Smart Life</ThemedText>
          <View style={styles.proBadge}>
            <ThemedText type="code" style={styles.proBadgeText}>PRO</ThemedText>
          </View>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
          Productivity & Focus Hub
        </ThemedText>
      </ThemedView>

      {/* View Format Selector Toggle */}
      <ThemedView type="backgroundElement" style={styles.formatToggleCard}>
        <ThemedText type="smallBold" style={{ marginBottom: Spacing.one }}>View Format Mode</ThemedText>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => responsive.setOverrideFormat('desktop')}
            style={[styles.toggleBtn, isDesktopActive ? styles.toggleBtnActive : null]}
          >
            <ThemedText
              type="small"
              style={{ fontSize: 11, color: isDesktopActive ? '#ffffff' : undefined, fontWeight: 'bold' }}
            >
              💻 Computer
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => responsive.setOverrideFormat('mobile')}
            style={[styles.toggleBtn, responsive.overrideFormat === 'mobile' ? styles.toggleBtnActive : null]}
          >
            <ThemedText
              type="small"
              style={{
                fontSize: 11,
                color: responsive.overrideFormat === 'mobile' ? '#ffffff' : undefined,
                fontWeight: 'bold',
              }}
            >
              📱 Mobile
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* Navigation Buttons Container */}
      <ThemedView type="backgroundElement" style={styles.navListCard}>
        <View style={{ gap: Spacing.two }}>
          {children}
        </View>
      </ThemedView>

      {/* User Profile & Documentation Footer */}
      <ThemedView type="backgroundElement" style={styles.sidebarFooter}>
        <View style={styles.userRow}>
          <ThemedView type="backgroundSelected" style={styles.avatar}>
            <ThemedText type="smallBold">N</ThemedText>
          </ThemedView>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Nazmul Islam</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
              nazmul@smartlife.io
            </ThemedText>
          </View>
        </View>

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.docLink}>
            <ThemedText type="link" style={{ fontSize: 12 }}>Documentation</ThemedText>
            <SymbolView name={{ ios: 'arrow.up.right.square', web: 'link' }} size={12} />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

function MobileHeader({ responsive }: { responsive: ReturnType<typeof useResponsive> }) {
  return (
    <ThemedView type="backgroundElement" style={styles.mobileTopHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        <ThemedText type="subtitle" style={{ fontSize: 16 }}>⚡ Smart Life</ThemedText>
        <ThemedText type="code" style={{ fontSize: 10, opacity: 0.8 }}>Mobile Format</ThemedText>
      </View>
      <Pressable
        onPress={() => responsive.setOverrideFormat('desktop')}
        style={styles.mobileSwitchBtn}
      >
        <ThemedText type="small" style={{ fontSize: 11, color: '#4f46e5', fontWeight: 'bold' }}>
          💻 Switch Computer
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function SidebarTabButton({ children, icon, isFocused, ...props }: TabTriggerSlotProps & { icon: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.sidebarTabBtn, isFocused && styles.sidebarTabBtnActive]}
      >
        <ThemedText style={{ fontSize: 18 }}>{icon}</ThemedText>
        <ThemedText
          type={isFocused ? 'smallBold' : 'small'}
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={{ fontSize: 14 }}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function MobileTabButton({ children, icon, isFocused, ...props }: TabTriggerSlotProps & { icon: string }) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.mobileTabItem, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.mobileTabInner, isFocused && styles.mobileTabInnerActive]}
      >
        <ThemedText style={{ fontSize: 16 }}>{icon}</ThemedText>
        <ThemedText
          type={isFocused ? 'smallBold' : 'small'}
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={{ fontSize: 10 }}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function MobileTabListContainer(props: TabListProps) {
  return (
    <View {...props} style={styles.mobileTabContainer}>
      <ThemedView type="backgroundElement" style={styles.mobileTabInnerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop Layout
  desktopWrapper: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  desktopSidebar: {
    width: 270,
    padding: Spacing.three,
    gap: Spacing.two,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f030',
  },
  sidebarCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  proBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  formatToggleCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    backgroundColor: '#e2e8f020',
    padding: 4,
    borderRadius: Spacing.two,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Spacing.one,
  },
  toggleBtnActive: {
    backgroundColor: '#4f46e5',
  },
  navListCard: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Spacing.three,
  },
  sidebarTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  sidebarTabBtnActive: {
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
  sidebarFooter: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  desktopContentArea: {
    flex: 1,
    height: '100%',
  },

  // Mobile Layout
  mobileWrapper: {
    flex: 1,
    height: '100%',
  },
  mobileTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f020',
  },
  mobileSwitchBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    backgroundColor: '#4f46e520',
    borderRadius: Spacing.one,
  },
  mobileTabContainer: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
    zIndex: 100,
  },
  mobileTabInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: '#e2e8f030',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mobileTabItem: {
    flex: 1,
    alignItems: 'center',
  },
  mobileTabInner: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Spacing.two,
  },
  mobileTabInnerActive: {
    backgroundColor: '#4f46e520',
  },
  pressed: {
    opacity: 0.7,
  },
});
