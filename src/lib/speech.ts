"use client";

import { LanguageCode, SUPPORTED_LANGUAGES } from "@/i18n";

/**
 * FairShift - Web Speech API Service
 * 100% Client-Side, Zero Paid APIs, High Inclusivity for Low-Literacy Workers
 */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * Text-to-Speech (TTS): Reads any label, payslip, or warning aloud in the chosen language.
 */
export function speakText(
  text: string,
  lang: LanguageCode = "en",
  onEnd?: () => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis not supported in this browser.");
    if (onEnd) onEnd();
    return () => {};
  }

  // Cancel any ongoing utterance
  window.speechSynthesis.cancel();

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  const locale = langInfo ? langInfo.speechLocale : "en-IN";

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = 0.95; // Slightly slower for enhanced clarity
  utterance.pitch = 1.0;

  // Try to find native regional voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.toLowerCase() === locale.toLowerCase() || v.lang.startsWith(lang)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speech-to-Text (STT): Worker speaks hazard or feedback using native microphone.
 */
export function startVoiceRecognition(
  lang: LanguageCode = "en",
  onResult: (transcript: string) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    const errorMsg = "Speech recognition is not supported in this browser. Please type your message.";
    if (onError) onError(errorMsg);
    return { stop: () => {} };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    recognition.lang = langInfo ? langInfo.speechLocale : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (onError) onError(`Mic error: ${event.error || "Unable to listen"}`);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore already stopped
        }
      },
    };
  } catch (err: unknown) {
    console.error("Failed to start speech recognition:", err);
    if (onError) onError("Failed to initialize microphone.");
    return { stop: () => {} };
  }
}
