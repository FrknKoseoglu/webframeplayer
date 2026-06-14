'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { UpdateModal } from './UpdateModal';
import { LATEST_ELECTRON_VERSION, compareVersions } from '@/lib/version';

export function UpdateChecker() {
  const searchParams = useSearchParams();
  const [showUpdate, setShowUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    // Check url parameter directly
    const versionParam = searchParams.get('v');
    
    // Check local storage for persistent check
    const storedVersion = localStorage.getItem('electronAppVersion');
    
    const activeVersion = versionParam || storedVersion;

    if (activeVersion) {
      if (versionParam) {
        localStorage.setItem('electronAppVersion', versionParam);
        localStorage.setItem('isElectronApp', 'true'); // Automatically signify we are in electron
      }

      // Check if active version is less than LATEST_ELECTRON_VERSION
      if (compareVersions(activeVersion, LATEST_ELECTRON_VERSION) < 0) {
        const hasDismissed = sessionStorage.getItem(`updateDismissed_${LATEST_ELECTRON_VERSION}`);
        if (!hasDismissed) {
          setCurrentVersion(activeVersion);
          setShowUpdate(true);
        }
      }
    }
  }, [searchParams]);

  const handleClose = () => {
    setShowUpdate(false);
    sessionStorage.setItem(`updateDismissed_${LATEST_ELECTRON_VERSION}`, 'true');
  };

  return (
    <UpdateModal 
      isOpen={showUpdate} 
      onClose={handleClose} 
      currentVersion={currentVersion} 
      latestVersion={LATEST_ELECTRON_VERSION} 
    />
  );
}
