import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { SECURITY } from '../constants';
import { clearAllTokens } from '../utils/security';

export const useSession = (onSessionExpired) => {
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await clearAllTokens();
      onSessionExpired?.();
    }, SECURITY.SESSION_TIMEOUT_MS);
  }, [onSessionExpired]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    resetTimer();

    const subscription = AppState.addEventListener('change', (nextState) => {
      // When app goes to background, clear timer
      if (
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        clearTimer();
      }
   
      if (
        appStateRef.current !== 'active' &&
        nextState === 'active'
      ) {
        resetTimer();
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearTimer();
      subscription?.remove();
    };
  }, [resetTimer, clearTimer]);

  return { resetTimer, clearTimer };
};
