import { useState, useEffect } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/constants';

/**
 * In-App Update Notifier Component
 * 
 * Checks GitHub releases for newer versions and notifies user
 * 
 * Usage:
 * <UpdateNotifier />
 * 
 * Note: Requires internet connection
 * Only shows on Android native apps
 */

interface GithubRelease {
  tag_name: string;
  html_url: string;
}

interface UpdateNotifierProps {
  owner?: string;
  repo?: string;
  onUpdateAvailable?: (version: string, url: string) => void;
}

export const UpdateNotifier = ({
  owner = 'sahaya-savari',
  repo = 'daily-spark',
  onUpdateAvailable,
}: UpdateNotifierProps) => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Fetch latest release from GitHub API
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases/latest`
        );

        if (!response.ok) {
          return;
        }

        const release: GithubRelease = await response.json();
        const latestTag = release.tag_name.replace('v', '');

        // Compare versions
        if (isNewerVersion(latestTag, APP_VERSION)) {
          setLatestVersion(latestTag);
          setDownloadUrl(release.html_url);
          setShowUpdateNotification(true);

          if (onUpdateAvailable) {
            onUpdateAvailable(latestTag, release.html_url);
          }
        }
      } catch (error) {
        console.debug('[UpdateNotifier] Failed to check for updates:', error);
      }
    };

    // Check for updates on mount and every 24 hours
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [owner, repo, onUpdateAvailable]);

  if (!showUpdateNotification || !latestVersion || !downloadUrl) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 p-4 rounded-xl bg-accent/10 border border-accent/30 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Update Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Daily Spark {latestVersion} is now available. Current: {APP_VERSION}
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                window.open(downloadUrl, '_blank');
                setShowUpdateNotification(false);
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUpdateNotification(false)}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compare semantic versions
 * Returns true if version1 is newer than version2
 */
const isNewerVersion = (version1: string, version2: string): boolean => {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const v1 = parts1[i] || 0;
    const v2 = parts2[i] || 0;

    if (v1 > v2) return true;
    if (v1 < v2) return false;
  }

  return false;
};

/**
 * Hook to check for updates without showing UI
 * Returns { hasUpdate, latestVersion, downloadUrl }
 */
export const useUpdateCheck = (owner = 'sahaya-savari', repo = 'daily-spark') => {
  const [updateInfo, setUpdateInfo] = useState<{
    hasUpdate: boolean;
    version: string | null;
    url: string | null;
  }>({
    hasUpdate: false,
    version: null,
    url: null,
  });

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases/latest`
        );

        if (!response.ok) return;

        const release: GithubRelease = await response.json();
        const latestTag = release.tag_name.replace('v', '');

        if (isNewerVersion(latestTag, APP_VERSION)) {
          setUpdateInfo({
            hasUpdate: true,
            version: latestTag,
            url: release.html_url,
          });
        }
      } catch (error) {
        console.debug('[useUpdateCheck] Failed:', error);
      }
    };

    checkUpdates();
  }, [owner, repo]);

  return updateInfo;
};
