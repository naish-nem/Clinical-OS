
import { useState, useEffect, useRef, useCallback } from 'react';

// --- Start: Type definitions for Web Speech API ---
// This avoids needing to install a separate @types package and provides the necessary types for the hook.

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}
// --- End: Type definitions for Web Speech API ---

// Access browser-specific SpeechRecognition, which might not be on the window type.
const SpeechRecognition: SpeechRecognitionStatic | undefined =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (onResult: (transcript: string) => void, lang: string) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(!!SpeechRecognition);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Use a ref to track listening intent to avoid issues with stale closures in callbacks.
  const listeningIntentRef = useRef(false);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.lang = lang;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setError(null); // Clear error on successful result
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      // If recognition ended but our intent was to keep listening (e.g., after silence), restart it.
      if (listeningIntentRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Error restarting speech recognition:", e);
          listeningIntentRef.current = false;
          setIsListening(false);
        }
      } else {
        // If it ended and we didn't intend to listen, just update state.
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      setError(`${event.error}${event.message ? `: ${event.message}` : ''}`);
      listeningIntentRef.current = false;
      setIsListening(false);
    };

    // Cleanup function to stop listening when the component unmounts or lang changes.
    return () => {
      listeningIntentRef.current = false;
      recognition.stop();
    };
  }, [onResult, lang, isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setError(null); // Clear previous errors
        listeningIntentRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unknown error occurred when starting recognition.");
        }
        listeningIntentRef.current = false;
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      listeningIntentRef.current = false; // Signal that we are intentionally stopping.
      recognitionRef.current.stop();
      // onend will fire and update isListening state to false.
    }
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening, error };
};
