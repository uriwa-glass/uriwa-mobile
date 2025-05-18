import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  ImageStyle,
} from "react-native";
import theme from "../styles/theme";
import typography from "../styles/typography";

export interface ClassCardProps {
  id: string;
  title: string;
  instructor: string;
  category?: string;
  imageUrl?: string;
  duration?: string;
  sessions?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  compact?: boolean;
  onPress?: () => void;
}

/**
 * 수업 정보를 표시하는 카드 컴포넌트
 */
const ClassCard: React.FC<ClassCardProps> = ({
  id,
  title,
  instructor,
  category,
  imageUrl,
  duration,
  sessions,
  description,
  style,
  imageStyle,
  compact = false,
  onPress,
}) => {
  // 기본 이미지
  const defaultImage: ImageSourcePropType = require("../../web/mobile/assets/placeholder-class.jpg");

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 이미지 섹션 */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <Image
          source={imageUrl ? { uri: imageUrl } : defaultImage}
          style={[styles.image, compact && styles.compactImage, imageStyle]}
          resizeMode="cover"
        />
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
      </View>

      {/* 콘텐츠 섹션 */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
          {title}
        </Text>
        <Text style={styles.instructor}>{instructor}</Text>

        {/* 세부 정보 (컴팩트 모드가 아닐 때만 표시) */}
        {!compact && (
          <>
            {(duration || sessions) && (
              <View style={styles.detailsRow}>
                {duration && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>기간</Text>
                    <Text style={styles.detailValue}>{duration}</Text>
                  </View>
                )}
                {sessions && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>횟수</Text>
                    <Text style={styles.detailValue}>{sessions}</Text>
                  </View>
                )}
              </View>
            )}

            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  compactContainer: {
    flexDirection: "row",
    height: 100,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  compactImageContainer: {
    height: 100,
    width: 100,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  compactImage: {
    width: 100,
    height: 100,
  },
  categoryBadge: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main + "CC", // 80% opacity
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    color: theme.colors.primary.contrast,
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
  },
  content: {
    padding: theme.spacing.md,
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  instructor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    marginRight: theme.spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default ClassCard;
