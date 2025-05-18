import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";

// 타입 정의
interface GalleryCategory {
  id: string;
  name: string;
}

export default function GalleryEditScreen() {
  const { user, isAdmin } = useAuth();

  // 상태 관리
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 권한 확인
  useEffect(() => {
    if (!user || !isAdmin) {
      Alert.alert("접근 제한", "관리자만 접근할 수 있습니다.");
      router.back();
    }
  }, [user, isAdmin]);

  // 카테고리 가져오기
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("gallery_categories")
          .select("id, name")
          .order("name");

        if (error) throw error;

        setCategories(data || []);
        if (data && data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("카테고리를 불러오는 중 오류가 발생했습니다.");
      }
    }

    fetchCategories();
  }, []);

  // 이미지 선택 함수
  const pickImage = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);

      // 파일 타입 및 확장자 구하기
      const uriParts = uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1];

      // 파일 이름 생성
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `gallery/${fileName}`;

      // 파일 데이터 가져오기
      const response = await fetch(uri);
      const blob = await response.blob();

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage.from("media").upload(filePath, blob, {
        contentType: `image/${fileExtension}`,
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      // 공개 URL 생성
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 갤러리 아이템 저장
  const handleSave = async () => {
    try {
      // 유효성 검사
      if (!title.trim()) {
        Alert.alert("오류", "제목을 입력해주세요.");
        return;
      }

      if (!selectedCategory) {
        Alert.alert("오류", "카테고리를 선택해주세요.");
        return;
      }

      if (!image) {
        Alert.alert("오류", "이미지를 선택해주세요.");
        return;
      }

      setIsLoading(true);

      // 이미지 업로드
      const imageUrl = await uploadImage(image);

      // 갤러리 아이템 저장
      const { data, error } = await supabase
        .from("gallery_items")
        .insert({
          title,
          description: description.trim() || null,
          category_id: selectedCategory,
          image_url: imageUrl,
        })
        .select();

      if (error) throw error;

      Alert.alert("성공", "갤러리 아이템이 등록되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving gallery item:", error);
      Alert.alert("오류", "갤러리 아이템 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>갤러리 항목 추가</Text>
      </View>

      <View style={styles.form}>
        {/* 이미지 선택 */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            disabled={isLoading || isUploading}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>이미지 선택</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 제목 입력 */}
        <Input
          label="제목"
          value={title}
          onChangeText={setTitle}
          placeholder="갤러리 항목 제목을 입력하세요"
          containerStyle={styles.input}
          disabled={isLoading}
        />

        {/* 설명 입력 */}
        <View style={styles.textAreaContainer}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="설명을 입력하세요 (선택사항)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* 카테고리 선택 */}
        <Text style={styles.label}>카테고리</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category.id)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            title="취소"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
            disabled={isLoading || isUploading}
          />

          <Button
            title={isLoading || isUploading ? "처리 중..." : "저장"}
            variant="primary"
            onPress={handleSave}
            style={styles.button}
            disabled={isLoading || isUploading}
            loading={isLoading || isUploading}
          />
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
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  form: {
    padding: theme.spacing.md,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  imagePicker: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  textAreaContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
    fontWeight: "500",
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minHeight: 100,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryContent: {
    paddingVertical: theme.spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    borderRadius: 16,
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  selectedCategoryText: {
    color: theme.colors.primary.contrast,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
