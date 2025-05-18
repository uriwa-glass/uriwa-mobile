import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../shared/api/supabaseClient";
import { useAuth } from "../../../shared/contexts/AuthContext";
import theme from "../../../shared/styles/theme";
import Button from "../../../shared/components/Button";

// 화면 크기
const { width, height } = Dimensions.get("window");

// 타입 정의
interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category_id: string;
  created_at: string;
  category_name?: string;
}

export default function GalleryDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isAdmin } = useAuth();
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 갤러리 아이템 로드
  useEffect(() => {
    async function fetchGalleryItem() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("gallery_items")
          .select(
            `
            *,
            gallery_categories (
              name
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setGalleryItem({
            ...data,
            category_name: data.gallery_categories?.name,
          });
        }
      } catch (error) {
        console.error("Error fetching gallery item:", error);
        setError("갤러리 아이템을 로드하는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchGalleryItem();
    }
  }, [id]);

  // 공유 기능
  const handleShare = async () => {
    if (!galleryItem) return;

    try {
      await Share.share({
        title: galleryItem.title,
        message: `${galleryItem.title} - ${galleryItem.description || ""}\n\n${
          galleryItem.image_url
        }`,
        url: galleryItem.image_url,
      });
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  };

  // 삭제 기능
  const handleDelete = async () => {
    if (!galleryItem) return;

    try {
      setIsLoading(true);

      const { error } = await supabase.from("gallery_items").delete().eq("id", galleryItem.id);

      if (error) throw error;

      router.back();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      setError("갤러리 아이템을 삭제하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지가 로드 중이거나 오류가 발생한 경우
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (error || !galleryItem) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error || "갤러리 아이템을 찾을 수 없습니다."}</Text>
        <Button
          title="돌아가기"
          variant="primary"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 이미지 */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: galleryItem.image_url }} style={styles.image} resizeMode="contain" />
      </View>

      {/* 내용 */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{galleryItem.title}</Text>

          {galleryItem.category_name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{galleryItem.category_name}</Text>
            </View>
          )}
        </View>

        <Text style={styles.date}>{new Date(galleryItem.created_at).toLocaleDateString()}</Text>

        {galleryItem.description && (
          <Text style={styles.description}>{galleryItem.description}</Text>
        )}

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <Button
            title="공유하기"
            variant="outline"
            onPress={handleShare}
            style={styles.actionButton}
          />

          {isAdmin && (
            <>
              <Button
                title="수정하기"
                variant="primary"
                onPress={() => router.push(`/gallery-edit/${galleryItem.id}`)}
                style={styles.actionButton}
              />

              <Button
                title="삭제하기"
                variant="outline"
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: theme.colors.background.dark,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary.dark,
    fontWeight: "500",
  },
  date: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    borderColor: theme.colors.error.main,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error.main,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  errorButton: {
    minWidth: 120,
  },
});
