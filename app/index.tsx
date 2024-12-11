import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import * as ExternalStorageManager from "../modules/external-storage-manager";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const deleteFile = (path: string) => {
  if (Platform.OS === "android") {
    return ExternalStorageManager.deleteExternalFileAsync(path);
  }

  return FileSystem.deleteAsync(path);
};

export default function Index() {
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ["photo"],
  });
  const [isExternalStorageManager, requestExternalStoragePermission] =
    ExternalStorageManager.usePermission();
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);

  const getPhotos = async () => {
    if (permissionResponse?.status !== "granted") {
      await requestPermission();
    }
    if (isExternalStorageManager === false) {
      await requestExternalStoragePermission();
    }

    const { assets } = await MediaLibrary.getAssetsAsync();
    setPhotos(assets);
  };

  const imageWidth = width / 2 - 32;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: top,
        paddingBottom: bottom,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          paddingVertical: 16,
        }}
      >
        <Button onPress={getPhotos} title="Refetch Photos" />
      </View>

      <View
        style={{
          marginHorizontal: 16,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {photos.map((photo) => (
          <Pressable
            key={photo.id}
            onLongPress={async () => {
              try {
                const done = await deleteFile(photo.uri);

                if (done) {
                  setPhotos(photos.filter((p) => p.id !== photo.id));
                } else {
                  Alert.alert("Failed to delete file");
                }
              } catch (e) {
                console.error(e);
              }
            }}
            style={{
              width: imageWidth,
            }}
          >
            <Image
              style={{
                width: imageWidth,
                height: imageWidth,
              }}
              source={{ uri: photo.uri }}
            />
            <Text>{photo.filename}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
