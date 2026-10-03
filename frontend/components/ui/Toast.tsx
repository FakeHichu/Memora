import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography, borders } from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
};

type ToastItem = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
  dismissToast: () => void;
};

// ============================================================================
// CONTEXT
// ============================================================================

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  dismissToast: () => {},
});

// ============================================================================
// PROVIDER
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const slideY = useRef(new Animated.Value(80));
  const opacity = useRef(new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideY.current, { toValue: 80, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity.current, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [slideY, opacity]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const id = String(Date.now());
      setToast({ ...options, id });

      slideY.current.setValue(80);
      opacity.current.setValue(0);

      Animated.parallel([
        Animated.spring(slideY.current, {
          toValue: 0,
          damping: 20,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const duration = options.duration ?? (options.action ? 5000 : 2500);
      timerRef.current = setTimeout(dismiss, duration);
    },
    [slideY, opacity, dismiss],
  );

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismiss();
  }, [dismiss]);

  // Create animated style object to avoid eslint refs warning
  // eslint-disable-next-line react-hooks/refs
  const toastAnimatedStyle = { transform: [{ translateY: slideY.current }], opacity: opacity.current };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            variantStyles[toast.variant ?? 'default'],
            toastAnimatedStyle,
          ]}
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
        >
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.action && (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                dismissToast();
              }}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Text style={styles.actionLabel}>{toast.action.label}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useToast() {
  return useContext(ToastContext);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    maxWidth: 520,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    gap: spacing.md,
    zIndex: 9999,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }),
  },
  message: {
    ...typography.sans.callout,
    color: colors.textPrimary,
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  actionLabel: {
    ...typography.sans.callout,
    fontWeight: '700',
    color: colors.accent,
  },
});

const variantStyles = {
  default: {
    backgroundColor: colors.surfaceModal,
    borderColor: colors.borderEmphasized,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  error: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
  },
};
