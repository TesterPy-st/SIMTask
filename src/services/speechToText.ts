/**
 * Speech-to-text service using Web Speech API
 * Cross-platform support with Android Chrome compatibility
 */

import { isWeb } from '../utils/platformDetection';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface SpeechToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

/**
 * Check if speech recognition is available
 */
export const isSpeechRecognitionAvailable = (): boolean => {
  if (!isWeb()) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  // Check for standard Web Speech API
  const SpeechRecognition = window.SpeechRecognition || 
                            window.webkitSpeechRecognition;
  
  return !!SpeechRecognition;
};

/**
 * Check if running on Android Chrome
 */
export const isAndroidChrome = (): boolean => {
  if (!isWeb() || typeof window === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');

  return isAndroid && isChrome;
};

/**
 * Get user-friendly availability message
 */
export const getAvailabilityMessage = (): string | null => {
  if (!isWeb()) {
    return null; // Native apps use expo-speech
  }

  if (typeof window === 'undefined') {
    return 'Speech recognition not available in this environment';
  }

  if (!isSpeechRecognitionAvailable()) {
    if (isAndroidChrome()) {
      return 'Voice input is not supported on this browser version. Please use text input or try a different browser.';
    }
    return 'Speech recognition is not supported in your browser. Please use text input instead.';
  }

  // Check HTTPS requirement
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return 'Speech recognition requires HTTPS. Please use text input.';
  }

  return null;
};

/**
 * Start speech recognition
 */
export const startSpeechRecognition = async (
  options: SpeechToTextOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionAvailable()) {
      reject(new Error(getAvailabilityMessage() || 'Speech recognition not available'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition API not found'));
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.lang = options.language || 'en-US';
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || false;
    recognition.maxAlternatives = 3;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          finalTranscript = result[0].transcript;
          
          if (options.onResult) {
            options.onResult({
              transcript: finalTranscript,
              confidence: result[0].confidence
            });
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      reject(new Error(errorMessage));
    };

    recognition.onend = () => {
      if (options.onEnd) {
        options.onEnd();
      }
      
      if (finalTranscript) {
        resolve(finalTranscript);
      } else if (!recognition.aborted) {
        reject(new Error('No speech detected. Please try again.'));
      }
    };

    recognition.start();
    
    // Store recognition instance for cancellation
    (window as any).currentSpeechRecognition = recognition;
  });
};

/**
 * Stop ongoing speech recognition
 */
export const stopSpeechRecognition = (): void => {
  if (typeof window !== 'undefined' && (window as any).currentSpeechRecognition) {
    try {
      (window as any).currentSpeechRecognition.aborted = true;
      (window as any).currentSpeechRecognition.stop();
    } catch (error) {
      // Ignore errors when stopping
    }
    (window as any).currentSpeechRecognition = null;
  }
};

/**
 * Get available languages for speech recognition
 */
export const getAvailableLanguages = (): string[] => {
  const commonLanguages = [
    'en-US',
    'en-GB',
    'es-ES',
    'fr-FR',
    'de-DE',
    'it-IT',
    'pt-BR',
    'ja-JP',
    'ko-KR',
    'zh-CN',
  ];
  
  return commonLanguages;
};
