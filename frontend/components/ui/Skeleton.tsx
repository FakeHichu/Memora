import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, borders } from '@/constants/theme';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animate?: boolean;
};

export function Skeleton({ width = '100%', height = 16, borderRadius, style, animate = true }: SkeletonProps) {
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
  const config = {
    timeline: { imageRadius: radius.lg, padding: spacing.md, gap: spacing.sm, titleWidth: '60%', subtitleWidth: '80%', metaWidth: '50%' },
    compact: { imageRadius: radius.md, padding: 0, gap: spacing.xs, titleWidth: '70%', subtitleWidth: '90%', metaWidth: '40%' },
    editorial: { imageRadius: radius.xl, padding: spacing.lg, gap: spacing.md, titleWidth: '50%', subtitleWidth: '70%', metaWidth: '60%' },
  }[variant];

  return (
    <View style={skeletonCardStyles.container}>
      <View style={[skeletonCardStyles.image, { aspectRatio }]}>
        <Skeleton width="100%" height={undefined} borderRadius={config.imageRadius} style={skeletonCardStyles.imageInner} />
      </View>
      <View style={[skeletonCardStyles.content, { padding: config.padding, gap: config.gap }]}>
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
  return (
    <View style={{ gap: spacing.xs }}>
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
  return (
    <View style={skeletonProfileStyles.container}>
      <View style={skeletonProfileStyles.header}>
        <Skeleton width={64} height={64} borderRadius={radius.circle} />
        <View style={[skeletonProfileStyles.info, { gap: spacing.sm }]}>
          <Skeleton width="50%" height={22} />
          <Skeleton width="30%" height={14} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <View style={[skeletonProfileStyles.stats, { gap: spacing.md }]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={skeletonProfileStyles.statCard}>
            <Skeleton width={48} height={28} borderRadius={radius.sm} />
            <Skeleton width={64} height={12} borderRadius={radius.xs} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonSettingsSection({ rows = 3 }: { rows?: number }) {
  return (
    <View style={[skeletonSettingsStyles.container, { gap: spacing.xs }]}>
      <Skeleton width="30%" height={16} borderRadius={radius.xs} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[skeletonSettingsStyles.row, { gap: spacing.md }]}>
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
  return (
    <View style={skeletonPostStyles.container}>
      <Skeleton width="100%" height={undefined} style={{ aspectRatio: 3 / 4, borderRadius: 0 }} />
      <View style={[skeletonPostStyles.details, { gap: spacing.lg }]}>
        <View style={[skeletonPostStyles.header, { gap: spacing.md }]}>
          <Skeleton width="80%" height={14} borderRadius={radius.xs} />
          <Skeleton width="60%" height={12} borderRadius={radius.xs} />
        </View>
        <Skeleton width="100%" height={16} borderRadius={radius.xs} />
        <View style={{ gap: spacing.sm }}>
          <Skeleton width="100%" height={20} borderRadius={radius.xs} />
          <Skeleton width="80%" height={20} borderRadius={radius.xs} />
          <Skeleton width="60%" height={20} borderRadius={radius.xs} />
        </View>
        <View style={[skeletonPostStyles.tags, { gap: spacing.xs }]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={60} height={24} borderRadius={radius.round} />
          ))}
        </View>
        <View style={[skeletonPostStyles.metadata, { gap: spacing.md }]}>
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
  return (
    <View style={[skeletonAuthStyles.container, { gap: spacing.lg }]}>
      <Skeleton width="48" height={48} borderRadius={radius.md} />
      <Skeleton width="30%" height={28} borderRadius={radius.xs} />
      <Skeleton width="50%" height={16} borderRadius={radius.xs} />
      <View style={[skeletonAuthStyles.form, { gap: spacing.md }]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={[skeletonAuthStyles.field, { gap: spacing.xs }]}>
            <Skeleton width="30%" height={12} borderRadius={radius.xs} />
            <Skeleton width="100%" height={50} borderRadius={radius.sm} />
          </View>
        ))}
      </View>
      <Skeleton width="100%" height={56} borderRadius={radius.round} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.backgroundElevated,
  },
});

const skeletonCardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
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

const skeletonProfileStyles = StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
});

const skeletonSettingsStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
});

const skeletonPostStyles = StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },
});

const skeletonAuthStyles = StyleSheet.create({
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
