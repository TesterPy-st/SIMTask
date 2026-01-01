/**
 * Text-to-Speech service with platform detection
 * Native: expo-speech
 * Web: Web Speech API
 */

import { isWeb } from '../utils/platformDetection';

/**
 * Play text-to-speech message
 */
export const playTaskReminder = async (message: string): Promise<void> => {
  try {
    if (isWeb()) {
      // Use Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new (window as any).SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.pitch = 1.0;
        utterance.rate = 0.9;
        
        // Stop any ongoing speech
        (window as any).speechSynthesis.cancel();
        
        (window as any).speechSynthesis.speak(utterance);
      } else {
        console.warn('Web Speech API not supported in this browser');
      }
    } else {
      // Use expo-speech for native
      const Speech = await import('expo-speech');
      
      const isSpeaking = await Speech.isSpeakingAsync();
      
      if (isSpeaking) {
        await Speech.stop();
      }
      
      await Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        voice: undefined,
      });
    }
  } catch (error) {
    console.error('TTS error:', error);
  }
};

/**
 * Stop speaking
 */
export const stopSpeaking = async (): Promise<void> => {
  try {
    if (isWeb()) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        (window as any).speechSynthesis.cancel();
      }
    } else {
      const Speech = await import('expo-speech');
      await Speech.stop();
    }
  } catch (error) {
    console.error('Error stopping TTS:', error);
  }
};
