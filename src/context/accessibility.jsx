import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AccessibilityContext = createContext(undefined);

export function AccessibilityProvider({ children }) {
  const [zoom, setZoom] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom * 100}%`;
  }, [zoom]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const value = useMemo(
    () => ({
      zoom,
      increaseZoom: () =>
        setZoom((current) => Math.min(1.6, parseFloat((current + 0.1).toFixed(2)))),
      decreaseZoom: () =>
        setZoom((current) => Math.max(0.8, parseFloat((current - 0.1).toFixed(2)))),
      resetZoom: () => setZoom(1),
      speak,
      stopSpeaking,
      isSpeaking,
    }),
    [zoom, isSpeaking],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

