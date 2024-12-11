import { useCallback, useEffect, useState } from 'react';
import ExternalStorageManagerModule from './src/ExternalStorageManagerModule';

export const usePermission = () => {
  const [response, setResponse] = useState<boolean | null>(null);

  useEffect(() => {
    ExternalStorageManagerModule.getIsExternalStorageManagerAsync().then(setResponse);
  }, []);

  const requestPermission = useCallback(async () => {
    const requestResponse = await ExternalStorageManagerModule.requestPermissionAsync();
    setResponse(requestResponse);

    return requestResponse;
  }, []);

  return [response, requestPermission] as const;
};

export const deleteExternalFileAsync = (uri: string): Promise<boolean> =>
  ExternalStorageManagerModule.deleteExternalFileAsync(uri);
