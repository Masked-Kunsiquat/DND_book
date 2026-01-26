/**
 * Local file utilities for images.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { generateId } from './id';
import { createLogger } from './logger';

const log = createLogger('files');
const IMAGES_DIR_NAME = 'images';

function getImagesDir(): string | null {
  if (FileSystem.documentDirectory) {
    return `${FileSystem.documentDirectory}${IMAGES_DIR_NAME}/`;
  }
  if (FileSystem.cacheDirectory) {
    return `${FileSystem.cacheDirectory}${IMAGES_DIR_NAME}/`;
  }
  return null;
}

function getFileExtension(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
}

export async function ensureImagesDir(): Promise<string | null> {
  const dir = getImagesDir();
  if (!dir) {
    return null;
  }

  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function saveImageToLibrary(sourceUri: string): Promise<string> {
  if (!sourceUri) {
    throw new Error('Image URI is required.');
  }

  const dir = await ensureImagesDir();
  if (!dir) {
    log.warn('File system is unavailable; using source image URI.');
    return sourceUri;
  }
  const ext = getFileExtension(sourceUri);
  const filename = `${generateId()}.${ext}`;
  const destination = `${dir}${filename}`;

  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export function isManagedImageUri(uri: string): boolean {
  const dir = getImagesDir();
  if (!dir) return false;
  return uri.startsWith(dir);
}

export async function removeManagedImage(uri: string | null | undefined): Promise<void> {
  if (!uri) return;
  if (!isManagedImageUri(uri)) return;

  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    log.warn('Failed to remove image', error);
  }
}
