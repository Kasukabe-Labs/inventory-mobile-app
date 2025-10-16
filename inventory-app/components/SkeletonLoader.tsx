import { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";

export const SkeletonLoader = () => {
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ style }: { style?: any }) => (
    <Animated.View style={[styles.skeletonBox, style, { opacity }]} />
  );

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <SkeletonBox style={styles.skeletonTitle} />
        <SkeletonBox style={styles.skeletonSubtitle} />
      </View>

      <View style={styles.skeletonList}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonCard}>
            <SkeletonBox style={styles.skeletonImage} />
            <View style={styles.skeletonDetails}>
              <SkeletonBox style={styles.skeletonBadge} />
              <SkeletonBox style={styles.skeletonProductName} />
              <SkeletonBox style={styles.skeletonSku} />
              <View style={styles.skeletonFooter}>
                <SkeletonBox style={styles.skeletonPrice} />
                <SkeletonBox style={styles.skeletonStatus} />
              </View>
              <View style={styles.skeletonActions}>
                <SkeletonBox style={styles.skeletonButton} />
                <SkeletonBox style={styles.skeletonButton} />
                <SkeletonBox style={styles.skeletonButton} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    paddingTop: 40,
  },
  skeletonHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  skeletonTitle: {
    height: 28,
    width: 150,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    width: 80,
  },
  skeletonList: {
    padding: 12,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 160,
  },
  skeletonImage: {
    width: 120,
    height: 160,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  skeletonDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  skeletonBadge: {
    height: 18,
    width: 70,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonProductName: {
    height: 20,
    width: "90%",
    marginBottom: 6,
  },
  skeletonSku: {
    height: 14,
    width: "60%",
    marginBottom: 12,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  skeletonPrice: {
    height: 22,
    width: 80,
  },
  skeletonStatus: {
    height: 22,
    width: 70,
    borderRadius: 6,
  },
  skeletonActions: {
    flexDirection: "row",
    gap: 6,
  },
  skeletonButton: {
    flex: 1,
    height: 24,
    borderRadius: 6,
  },
  skeletonBox: {
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
});
