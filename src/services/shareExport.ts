import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

function toBase64(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function shareTextFile(
  filename: string,
  content: string,
  mimeType: string
) {
  if (Capacitor.getPlatform() === 'web') {
    const base64 = await toBase64(content);
    await Share.share({
      title: filename,
      text: 'Daily Spark export',
      files: [
        {
          name: filename,
          data: base64,
          mimeType,
        },
      ],
    });
  } else {
    // Android: Write file and share
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: 'utf8',
    });
    await Share.share({
      title: filename,
      text: 'Daily Spark export',
      url: writeResult.uri,
    });
  }
}
