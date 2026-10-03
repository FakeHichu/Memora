import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography, layout, borders } from '@/constants/theme';
import {
  clearLocalPhotoPosts,
  exportAllData,
  exportDataAsJSON,
  importData,
} from '@/lib/photo-draft';
import { ProfileSection, ProfileRow, ProfileDivider } from '@/components/ui/ProfileSection';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

export default function SettingsScreen() {
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showImportInput, setShowImportInput] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      const json = exportDataAsJSON(data);

      if (Platform.OS === 'web') {
        // Web: trigger download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memora-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast({ message: `Exported ${data.posts.length} memories`, variant: 'success' });
      } else {
        await Share.share({
          message: json,
          title: `Memora Export - ${new Date().toLocaleDateString()}`,
        });
        showToast({ message: `Exported ${data.posts.length} memories`, variant: 'success' });
      }
    } catch {
      showToast({ message: 'Export failed. Try again.', variant: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      showToast({ message: 'Paste your JSON export first.', variant: 'warning' });
      return;
    }

    setIsImporting(true);
    try {
      const result = await importData(importJson.trim());
      setImportJson('');
      setShowImportInput(false);

      if (result.errors.length > 0 && result.imported === 0) {
        showToast({ message: result.errors[0], variant: 'error' });
      } else {
        showToast({
          message: `Imported ${result.imported} memories${result.skipped > 0 ? `, skipped ${result.skipped} duplicates` : ''}`,
          variant: 'success',
          duration: 4000,
        });
      }
    } catch {
      showToast({ message: 'Import failed. Check the JSON format.', variant: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    await clearLocalPhotoPosts();
    setConfirmClear(false);
    showToast({ message: 'All memories deleted', variant: 'error', duration: 2000 });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundPattern />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            variant="overlay"
            size="sm"
            accessibilityLabel="Go back"
          />
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* About */}
        <ProfileSection title="About">
          <View style={styles.appInfo}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>M</Text>
            </View>
            <View style={styles.appTextContainer}>
              <Text style={styles.appName}>Memora</Text>
              <Text style={styles.appTagline}>A private photo journal</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <ProfileDivider />
          <ProfileRow
            label="Privacy guarantee"
            value="Photos stay on your device. No tracking, no ads."
            icon="padlock"
          />
        </ProfileSection>

        {/* Appearance */}
        <ProfileSection title="Appearance">
          <ProfileRow
            label="Color theme"
            value="Dark (default)"
            icon="info"
          />
          <ProfileDivider />
          <ProfileRow
            label="App icon"
            value="Default"
            icon="picture"
          />
        </ProfileSection>

        {/* Data */}
        <ProfileSection title="Import & Export">
          <ProfileRow
            label="Export all memories"
            value={isExporting ? 'Exporting…' : 'Download as JSON'}
            icon="file"
            onPress={handleExport}
          />
          <ProfileDivider />
          <ProfileRow
            label="Import memories"
            value={showImportInput ? 'Paste JSON below' : 'Restore from JSON export'}
            icon="cloud"
            onPress={() => setShowImportInput(!showImportInput)}
          />

          {showImportInput && (
            <View style={styles.importContainer}>
              <TextInput
                value={importJson}
                onChangeText={setImportJson}
                placeholder='Paste your exported JSON here…'
                placeholderTextColor={colors.textMuted}
                style={styles.importInput}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Import JSON"
              />
              <View style={styles.importActions}>
                <Button title="Cancel" variant="secondary" size="sm" onPress={() => { setShowImportInput(false); setImportJson(''); }} />
                <Button
                  title={isImporting ? 'Importing…' : 'Import'}
                  variant="accent"
                  size="sm"
                  onPress={handleImport}
                  disabled={isImporting || !importJson.trim()}
                />
              </View>
            </View>
          )}
        </ProfileSection>

        {/* Keyboard Shortcuts */}
        {Platform.OS === 'web' && (
          <ProfileSection title="Keyboard Shortcuts">
            <View style={styles.shortcutsList}>
              {[
                { key: '⌘K', action: 'Command palette' },
                { key: '/', action: 'Focus search' },
                { key: 'Esc', action: 'Close dialogs' },
              ].map((s, i) => (
                <View key={i} style={styles.shortcutRow}>
                  <Text style={styles.shortcutKey}>{s.key}</Text>
                  <Text style={styles.shortcutAction}>{s.action}</Text>
                </View>
              ))}
            </View>
          </ProfileSection>
        )}

        {/* Danger Zone */}
        <ProfileSection title="Data & Safety">
          <ProfileRow
            label="Delete all memories"
            value="Permanently remove all local data"
            icon="trash"
            onPress={() => setConfirmClear(true)}
            destructive
          />
        </ProfileSection>
      </ScrollView>

      <ConfirmDialog
        visible={confirmClear}
        title="Delete all memories?"
        message="This permanently removes all photos and memories stored on this device. This cannot be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={handleClearData}
        onCancel={() => setConfirmClear(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.serif.title2,
    color: colors.textPrimary,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.chromeDark,
    borderWidth: borders.thin,
    borderColor: colors.chrome,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    ...typography.serif.title3,
    color: colors.chrome,
    fontWeight: '700',
  },
  appTextContainer: {
    flex: 1,
    gap: 2,
  },
  appName: {
    ...typography.sans.headline,
    color: colors.textPrimary,
  },
  appTagline: {
    ...typography.sans.subheadline,
    color: colors.textSecondary,
  },
  appVersion: {
    ...typography.mono.caption,
    color: colors.textMuted,
  },
  shortcutsList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  shortcutKey: {
    ...typography.mono.body,
    color: colors.accent,
    fontWeight: '700',
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: borders.hairline,
    borderColor: colors.accent,
    minWidth: 44,
    textAlign: 'center',
  },
  shortcutAction: {
    ...typography.sans.callout,
    color: colors.textSecondary,
  },
  importContainer: {
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: borders.hairline,
    borderTopColor: colors.borderSubtle,
  },
  importInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.mono.body,
    minHeight: 120,
    fontSize: 11,
  },
  importActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
});
