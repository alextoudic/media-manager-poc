import { ExternalStorageManagerModule } from "./ExternalStorageManagerModule.types";

export default {
  getIsExternalStorageManagerAsync: () => Promise.resolve(true),
  requestPermissionAsync: () => Promise.resolve(true),
  deleteExternalFileAsync: (path: string) => {
    throw new Error("Method should only be used on Android.");
  }
} satisfies ExternalStorageManagerModule;
