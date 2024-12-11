import { requireNativeModule } from 'expo';
import { ExternalStorageManagerModule } from './ExternalStorageManagerModule.types';

export default requireNativeModule<ExternalStorageManagerModule>('ExternalStorageManager');
