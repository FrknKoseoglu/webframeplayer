// Defines the minimum required Electron version for the web app to function optimally, or to inform users of new updates.
export const LATEST_ELECTRON_VERSION = '0.3.0';

/**
 * Compare two semantic version strings.
 * Returns 1 if v1 > v2, -1 if v1 < v2, and 0 if they are equal.
 */
export function compareVersions(v1: string, v2: string): number {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}
