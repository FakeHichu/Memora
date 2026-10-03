import { router } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export type PaletteCommand = {
  id: string;
  label: string;
  description?: string;
  category?: string;
  shortcut?: string;
  icon?: string;
  onExecute: () => void;
};

type CommandPaletteContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

// ============================================================================
// CONTEXT
// ============================================================================

const CommandPaletteContext = createContext<CommandPaletteContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

// ============================================================================
// DEFAULT COMMANDS
// ============================================================================

function getDefaultCommands(): PaletteCommand[] {
  return [
    {
      id: 'new-memory',
      label: 'New memory',
      description: 'Create a new photo memory',
      category: 'Create',
      icon: '📸',
      shortcut: 'N',
      onExecute: () => router.push('/(tabs)/create'),
    },
    {
      id: 'go-home',
      label: 'Go to Home',
      description: 'View your daily prompt and recent memories',
      category: 'Navigate',
      icon: '🏠',
      onExecute: () => router.push('/(tabs)/home'),
    },
    {
      id: 'go-memories',
      label: 'Go to Memories',
      description: 'Browse all your memories',
      category: 'Navigate',
      icon: '📅',
      onExecute: () => router.push('/(tabs)/memories'),
    },
    {
      id: 'go-search',
      label: 'Search memories',
      description: 'Search through all your memories',
      category: 'Navigate',
      icon: '🔍',
      shortcut: '/',
      onExecute: () => router.push('/(tabs)/search'),
    },
    {
      id: 'go-favorites',
      label: 'View favorites',
      description: 'See your favorite memories',
      category: 'Navigate',
      icon: '⭐',
      shortcut: 'F',
      onExecute: () => router.push('/favorites'),
    },
    {
      id: 'go-collections',
      label: 'View collections',
      description: 'Organize memories into collections',
      category: 'Navigate',
      icon: '📁',
      onExecute: () => router.push('/collections'),
    },
    {
      id: 'go-profile',
      label: 'Go to Profile',
      description: 'Account settings and statistics',
      category: 'Navigate',
      icon: '👤',
      onExecute: () => router.push('/(tabs)/profile'),
    },
    {
      id: 'go-circle',
      label: 'View Circle',
      description: 'Your shared class memories',
      category: 'Navigate',
      icon: '👥',
      onExecute: () => router.push('/(tabs)/circle'),
    },
    {
      id: 'go-settings',
      label: 'Settings',
      description: 'App settings and data management',
      category: 'Settings',
      icon: '⚙️',
      onExecute: () => router.push('/settings'),
    },
  ];
}

// ============================================================================
// PROVIDER
// ============================================================================

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Web keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CommandPaletteModal isOpen={isOpen} onClose={close} />
    </CommandPaletteContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

// ============================================================================
// MODAL
// ============================================================================

function CommandPaletteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const commands = getDefaultCommands();

  const filteredCommands =
    query.trim() === ''
      ? commands
      : commands.filter(
          (c) =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.description?.toLowerCase().includes(query.toLowerCase()) ||
            c.category?.toLowerCase().includes(query.toLowerCase()),
        );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      Keyboard.dismiss();
    }
    return undefined;
  }, [isOpen]);

  const handleExecute = (command: PaletteCommand) => {
    onClose();
    command.onExecute();
  };

  // Group by category
  const groups: Record<string, PaletteCommand[]> = {};
  for (const cmd of filteredCommands) {
    const cat = cmd.category || 'Actions';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(cmd);
  }

  type ListItem =
    | { type: 'header'; key: string; title: string }
    | { type: 'command'; key: string; command: PaletteCommand };

  const listItems: ListItem[] = [];
  for (const [category, cmds] of Object.entries(groups)) {
    listItems.push({ type: 'header', key: `header-${category}`, title: category });
    for (const cmd of cmds) {
      listItems.push({ type: 'command', key: cmd.id, command: cmd });
    }
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <Pressable
            style={styles.palette}
            onPress={(e) => e.stopPropagation()}
            accessibilityViewIsModal
            accessibilityLabel="Command palette"
          >
            {/* Search Input */}
            <View style={styles.searchRow}>
              <Text style={styles.searchIcon}>⌘</Text>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Search commands…"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (filteredCommands.length > 0) {
                    handleExecute(filteredCommands[0]);
                  }
                }}
                accessibilityLabel="Search commands"
              />
              <Pressable onPress={onClose} style={styles.escButton} accessibilityLabel="Close">
                <Text style={styles.escLabel}>ESC</Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Results */}
            <FlatList
              data={listItems}
              keyExtractor={(item) => item.key}
              style={styles.list}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return (
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryTitle}>{item.title.toUpperCase()}</Text>
                    </View>
                  );
                }

                const { command } = item;
                return (
                  <Pressable
                    onPress={() => handleExecute(command)}
                    style={({ pressed }) => [styles.commandRow, pressed && styles.commandRowPressed]}
                    accessibilityRole="button"
                    accessibilityLabel={command.label}
                  >
                    <Text style={styles.commandIcon}>{command.icon}</Text>
                    <View style={styles.commandText}>
                      <Text style={styles.commandLabel}>{command.label}</Text>
                      {command.description && (
                        <Text style={styles.commandDescription} numberOfLines={1}>
                          {command.description}
                        </Text>
                      )}
                    </View>
                    {command.shortcut && (
                      <View style={styles.shortcutBadge}>
                        <Text style={styles.shortcutText}>{command.shortcut}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No commands found for "{query}"</Text>
                </View>
              }
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {Platform.OS === 'web' ? '⌘K to open · Enter to select' : 'Tap to run a command'}
              </Text>
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 8, 12, 0.85)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  safeArea: {
    width: '100%',
    maxWidth: 560,
  },
  palette: {
    width: '100%',
    backgroundColor: colors.surfaceModal,
    borderRadius: radius.xl,
    borderWidth: borders.hairline,
    borderColor: colors.borderEmphasized,
    overflow: 'hidden',
    maxHeight: 480,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 32,
          elevation: 12,
        }),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    color: colors.textMuted,
  },
  searchInput: {
    flex: 1,
    ...typography.sans.body,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  escButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.xs,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  escLabel: {
    ...typography.mono.caption,
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  divider: {
    height: borders.hairline,
    backgroundColor: colors.borderSubtle,
  },
  list: {
    maxHeight: 360,
  },
  categoryHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  categoryTitle: {
    ...typography.mono.micro,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  commandRowPressed: {
    backgroundColor: colors.accentSubtle,
  },
  commandIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  commandText: {
    flex: 1,
    gap: 2,
  },
  commandLabel: {
    ...typography.sans.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  commandDescription: {
    ...typography.sans.caption2,
    color: colors.textMuted,
  },
  shortcutBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.xs,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  shortcutText: {
    ...typography.mono.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.sans.body,
    color: colors.textMuted,
  },
  footer: {
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  footerText: {
    ...typography.mono.micro,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
