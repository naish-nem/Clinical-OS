
import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Implement manual base64 encoding as required by Gemini Live API guidelines.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface LiveSessionProps {
  onTranscription: (text: string, isUser: boolean, isFinal: boolean) => void;
  onToolCall?: (functionCalls: any[]) => Promise<any[]>;
}

export const useLiveSession = ({ onTranscription, onToolCall }: LiveSessionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
  }, []);

  const startSession = useCallback(async (systemInstruction: string, tools?: any[]) => {
    try {
      // Create new instance right before session start to ensure latest environment context.
      const apiKey = process.env.API_KEY;
      console.log('[LiveSession] Starting session...');
      console.log('[LiveSession] API Key present:', !!apiKey);
      console.log('[LiveSession] API Key prefix:', apiKey?.substring(0, 10));

      if (!apiKey) {
        setError("API key is not configured. Please check your .env.local file.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      console.log('[LiveSession] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[LiveSession] Microphone access granted');

      console.log('[LiveSession] Connecting to Gemini Live API...');
      console.log('[LiveSession] Model: gemini-2.5-flash-native-audio-preview-12-2025');

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('[LiveSession] ✅ WebSocket connection OPENED successfully!');
            setIsActive(true);
            setError(null);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`.
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // SILENT MODE: Handle model output text but bypass audio decoding for clinical log focus.

            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              onTranscription(message.serverContent.inputTranscription.text, true, !!message.serverContent.turnComplete);
            }
            if (message.serverContent?.outputTranscription) {
              onTranscription(message.serverContent.outputTranscription.text, false, !!message.serverContent.turnComplete);
            }

            // Handle Tool Calls (Silent Insight Delivery)
            if (message.toolCall && onToolCall) {
              const responses = await onToolCall(message.toolCall.functionCalls);
              sessionPromise.then(session => {
                // Send function responses individually as per the API's multi-call handling pattern.
                for (const response of responses) {
                  session.sendToolResponse({
                    functionResponses: response
                  });
                }
              });
            }
          },
          onerror: (e: any) => {
            console.error('[LiveSession] ❌ WebSocket ERROR:', e);
            console.error('[LiveSession] Error details:', JSON.stringify(e, null, 2));
            const errorMessage = e?.message || e?.toString() || 'Unknown connection error';
            setError(`Live session failed: ${errorMessage}. Check console for details.`);
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          // Native-audio Live models expect AUDIO modality for stable session startup.
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: tools ? [{ functionDeclarations: tools }] : [],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Failed to start live consultation session.");
    }
  }, [onTranscription, onToolCall, stopSession]);

  return { isActive, startSession, stopSession, error };
};
