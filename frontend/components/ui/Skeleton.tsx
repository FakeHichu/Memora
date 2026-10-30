import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, spacing, borders } from '@/constants/theme';
import { useAppTheme } from '@/providers/ThemeProvider';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animate?: boolean;
};

export function Skeleton({ width = '100%', height = 16, borderRadius, style, animate = true }: SkeletonProps) {
  const { colors } = useAppTheme();
  const styles = createSkeletonStyles(colors);
  const shimmerRef = useRef(new Animated.Value(0));

  useEffect(() => {
    if (!animate) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerRef.current, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerRef.current, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animate, shimmerRef]);

  // eslint-disable-next-line react-hooks/refs
  const opacity = shimmerRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius: borderRadius ?? radius.sm,
          opacity,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

// Pre-built skeleton shapes

export function SkeletonMemoryCard({ aspectRatio = 4 / 3, variant = 'timeline' }: { aspectRatio?: number; variant?: 'timeline' | 'compact' | 'editorial' }) {
  const { colors } = useAppTheme();
  const styles = createSkeletonMemoryStyles(colors);
  const config = {
    timeline: { imageRadius: radius.lg, padding: spacing.md, gap: spacing.sm, titleWidth: '60%', subtitleWidth: '80%', metaWidth: '50%' },
    compact: { imageRadius: radius.md, padding: 0, gap: spacing.xs, titleWidth: '70%', subtitleWidth: '90%', metaWidth: '40%' },
    editorial: { imageRadius: radius.xl, padding: spacing.lg, gap: spacing.md, titleWidth: '50%', subtitleWidth: '70%', metaWidth: '60%' },
  }[variant];

  return (
    <View style={styles.container}>
      <View style={[styles.image, { aspectRatio }]}>
        <Skeleton width="100%" height={undefined} borderRadius={config.imageRadius} style={styles.imageInner} />
      </View>
      <View style={[styles.content, { padding: config.padding, gap: config.gap }]}>
        <Skeleton width={config.titleWidth} height={18} borderRadius={radius.xs} />
        <Skeleton width={config.subtitleWidth} height={14} borderRadius={radius.xs} />
        <Skeleton width={config.metaWidth} height={12} borderRadius={radius.xs} />
      </View>
    </View>
  );
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lastLineWidth?: string;
}) {
  const { colors } = useAppTheme();
  const styles = createSkeletonStyles(colors);

  return (
    <View style={[styles.textContainer, { gap: spacing.xs }]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? (lastLineWidth as unknown as number) : '100%'}
          height={14}
        />
      ))}
    </View>
  );
}

export function SkeletonProfileHeader() {
  const { colors } = useAppTheme();
  const styles = createSkeletonProfileStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={64} height={64} borderRadius={radius.circle} />
        <View style={[styles.info, { gap: spacing.sm }]}>
          <Skeleton width="50%" height={22} />
          <Skeleton width="30%" height={14} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <View style={[styles.stats, { gap: spacing.md }]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={styles.statCard}>
            <Skeleton width={48} height={28} borderRadius={radius.sm} />
            <Skeleton width={64} height={12} borderRadius={radius.xs} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonSettingsSection({ rows = 3 }: { rows?: number }) {
  const { colors } = useAppTheme();
  const styles = createSkeletonSettingsStyles(colors);

  return (
    <View style={[styles.container, { gap: spacing.xs }]}>
      <Skeleton width="30%" height={16} borderRadius={radius.xs} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.row, { gap: spacing.md }]}>
          <Skeleton width={24} height={24} borderRadius={radius.circle} />
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton width="40%" height={16} />
            <Skeleton width="60%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonPostDetail() {
  const { colors } = useAppTheme();
  const styles = createSkeletonPostStyles(colors);

  return (
    <View style={styles.container}>
      <Skeleton width="100%" height={undefined} style={{ aspectRatio: 3 / 4, borderRadius: 0 }} />
      <View style={[styles.details, { gap: spacing.lg }]}>
        <View style={[styles.header, { gap: spacing.md }]}>
          <Skeleton width="80%" height={14} borderRadius={radius.xs} />
          <Skeleton width="60%" height={12} borderRadius={radius.xs} />
        </View>
        <Skeleton width="100%" height={16} borderRadius={radius.xs} />
        <View style={{ gap: spacing.sm }}>
          <Skeleton width="100%" height={20} borderRadius={radius.xs} />
          <Skeleton width="80%" height={20} borderRadius={radius.xs} />
          <Skeleton width="60%" height={20} borderRadius={radius.xs} />
        </View>
        <View style={[styles.tags, { gap: spacing.xs }]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={60} height={24} borderRadius={radius.round} />
          ))}
        </View>
        <View style={[styles.metadata, { gap: spacing.md }]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ flex: 1, gap: 4, alignItems: 'center' }}>
              <Skeleton width={40} height={16} borderRadius={radius.xs} />
              <Skeleton width={30} height={14} borderRadius={radius.xs} />
            </View>
          ))}
        </View>
        <Skeleton width="30%" height={16} borderRadius={radius.xs} />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonMemoryCard key={i} variant="compact" aspectRatio={1} />
        ))}
      </View>
    </View>
  );
}

export function SkeletonAuthForm() {
  const styles = createSkeletonAuthStyles();

  return (
    <View style={[styles.container, { gap: spacing.lg }]}>
      <Skeleton width={48} height={48} borderRadius={radius.md} />
      <Skeleton width="30%" height={28} borderRadius={radius.xs} />
      <Skeleton width="50%" height={16} borderRadius={radius.xs} />
      <View style={[styles.form, { gap: spacing.md }]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={[styles.field, { gap: spacing.xs }]}>
            <Skeleton width="30%" height={12} borderRadius={radius.xs} />
            <Skeleton width="100%" height={50} borderRadius={radius.sm} />
          </View>
        ))}
      </View>
      <Skeleton width="100%" height={56} borderRadius={radius.round} />
    </View>
  );
}

function createSkeletonStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    skeleton: {
      backgroundColor: colors.backgroundElevated,
    },
    textContainer: {
      gap: spacing.xs,
    },
  });
}

function createSkeletonMemoryStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    image: {
      width: '100%',
      backgroundColor: colors.backgroundElevated,
    },
    imageInner: {
      flex: 1,
    },
    content: {
      padding: 12,
      gap: 8,
    },
  });
}

function createSkeletonProfileStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.xl,
      gap: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    info: {
      flex: 1,
      gap: spacing.sm,
    },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      minWidth: '22%',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      padding: spacing.md,
      alignItems: 'center',
      gap: 4,
    },
  });
}

function createSkeletonSettingsStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.xl,
      gap: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
  });
}

function createSkeletonPostStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    details: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    metadata: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
  });
}

function createSkeletonAuthStyles() {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxxl,
      paddingBottom: spacing.massive,
      maxWidth: 480,
      width: '100%',
      alignSelf: 'center',
    },
    form: {
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    field: {
      gap: spacing.xs,
    },
  });
}
