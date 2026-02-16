/**
 * Haptic Feedback Utilities
 * 
 * Provides native-like haptic feedback for mobile interactions.
 * Falls back gracefully on devices that don't support vibration.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 40, 20],
  error: [30, 30, 30, 30],
  selection: 5,
};

/**
 * Check if the device supports vibration
 */
export const supportsHaptics = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 * @param pattern - The type of haptic feedback to trigger
 */
export const triggerHaptic = (pattern: HapticPattern = 'light'): void => {
  if (!supportsHaptics()) return;
  
  try {
    const vibrationPattern = patterns[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not supported
    console.debug('Haptic feedback not available');
  }
};

/**
 * Hook for haptic feedback in React components
 */
export const useHaptic = () => {
  const light = () => triggerHaptic('light');
  const medium = () => triggerHaptic('medium');
  const heavy = () => triggerHaptic('heavy');
  const success = () => triggerHaptic('success');
  const warning = () => triggerHaptic('warning');
  const error = () => triggerHaptic('error');
  const selection = () => triggerHaptic('selection');

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    trigger: triggerHaptic,
    isSupported: supportsHaptics(),
  };
};

export default triggerHaptic;
