import { useState } from "react";
import { View, Pressable, Image, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onImageSelected: (
    imageData: {
      uri: string;
      name: string;
      type: string;
    } | null
  ) => void;
  required?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onImageSelected,
  required = false,
}: ImageUploadFieldProps) {
  const [localUri, setLocalUri] = useState<string | null>(value);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = uri.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        setLocalUri(uri);
        onImageSelected({
          uri,
          name: filename,
          type,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeImage = () => {
    setLocalUri(null);
    onImageSelected(null);
  };

  return (
    <View className="grid gap-2">
      <Label>
        {label} {required && "*"}
      </Label>

      {localUri ? (
        <View className="relative">
          <Image
            source={{ uri: localUri }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <Pressable
            onPress={removeImage}
            className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
          >
            <Icon as={X} size={16} className="text-white" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pickImage}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center bg-gray-50"
        >
          <Icon as={Upload} size={32} className="text-gray-400 mb-2" />
          <Text className="text-sm text-gray-600 text-center">
            Tap to upload image
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            JPEG, PNG, WebP (max 5MB)
          </Text>
        </Pressable>
      )}
    </View>
  );
}
