/**
 * Text-to-Speech service for Android
 * Uses expo-speech
 */

import * as Speech from 'expo-speech';

/**
 * Play text-to-speech message
 */
export const playTaskReminder = async (message: string): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('TTS error:', error);
  }
};

/**
 * Stop speaking
 */
export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping TTS:', error);
  }
};
