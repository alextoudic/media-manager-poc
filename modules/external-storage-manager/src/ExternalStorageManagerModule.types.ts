export interface ExternalStorageManagerModule {
  getIsExternalStorageManagerAsync: () => Promise<boolean>;
  requestPermissionAsync: () => Promise<boolean>;
  deleteExternalFileAsync: (uri: string) => Promise<void>;
}