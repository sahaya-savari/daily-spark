import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export async function shareTextFile(
  filename: string,
  content: string,
  mimeType: string
) {
  if (Capacitor.getPlatform() === 'web') {
    // No-op for web (or optionally trigger download)
    return;
  }
  // Always use Cache directory, never Documents/Downloads
  const writeResult = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: 'utf8',
  });
  await Share.share({
    title: filename,
    text: 'Daily Spark backup',
    url: writeResult.uri,
  });
}
