import * as Speech from 'expo-speech';

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

export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping TTS:', error);
  }
};
