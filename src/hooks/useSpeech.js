import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Seleccion de voz del locutor de La Kamelia:
 * 1) variante/localizacion es-CO (Bogotá, Colombia) si el navegador la ofrece,
 * 2) castellano de España (es-ES),
 * 3) cualquier voz en espanol, 4) la voz por defecto del sistema.
 */
function pickStudioVoice(voices) {
  if (!voices.length) return null;

  const bogota = voices.find((voice) => /^es[-_]CO$/i.test(voice.lang));
  if (bogota) return bogota;

  const spanish = voices.filter((voice) => /^es[-_]/i.test(voice.lang));
  if (spanish.length) {
    const preferredOrder = ['es-CO', 'es-ES'];
    for (const lang of preferredOrder) {
      const match = spanish.find(
        (voice) => voice.lang.toLowerCase().replace('_', '-') === lang.toLowerCase()
      );
      if (match) return match;
    }
    return spanish[0];
  }

  return voices[0];
}

function buildSpeechText(message) {
  const honoree = message.honoree_name?.trim();
  const sender = message.client_name?.trim();
  const text = message.message_text?.trim();

  const parts = [];
  if (honoree) parts.push(`Atencion por favor. Este saludo es para ${honoree}.`);
  if (sender) parts.push(`De parte de ${sender}.`);
  if (text) parts.push(text);
  return parts.join(' ');
}

export default function useSpeech() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [robotMode, setRobotMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [lastError, setLastError] = useState('');
  const [ready, setReady] = useState(false);
  const autoVoiceRef = useRef(false);

  useEffect(() => {
    if (!supported) return undefined;

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return false;
      setVoices(list);
      if (!autoVoiceRef.current) {
        autoVoiceRef.current = true;
        const preferred = pickStudioVoice(list);
        if (preferred) setVoiceName(preferred.name);
      }
      setReady(true);
      return true;
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Algunos navegadores cargan las voces de forma diferida.
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (loadVoices() || attempts >= 12) window.clearInterval(interval);
    }, 500);

    return () => {
      window.clearInterval(interval);
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentId(null);
  }, [supported]);

  const speak = useCallback(
    (message) => {
      if (!supported) {
        setLastError('Tu navegador no soporta la sintesis de voz.');
        return;
      }

      const text = buildSpeechText(message);
      if (!text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const selected = voices.find((voice) => voice.name === voiceName) || pickStudioVoice(voices);

      if (selected) utterance.voice = selected;
      // lang obligatorio: castellano de España (es-ES). La voz preferida sigue
      // siendo la variante es-CO (Bogotá, Colombia) si esta existe.
      utterance.lang = 'es-ES';
      utterance.rate = robotMode ? Math.min(rate + 0.15, 2) : rate;
      utterance.pitch = robotMode ? 0.5 : pitch;
      utterance.volume = 1;

      utterance.onstart = () => {
        setSpeaking(true);
        setCurrentId(message.id);
        setLastError('');
      };
      utterance.onend = () => {
        setSpeaking(false);
        setCurrentId(null);
      };
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          setLastError(`No se pudo leer el mensaje: ${event.error}`);
        }
        setSpeaking(false);
        setCurrentId(null);
      };

      setLastError('');
      window.speechSynthesis.speak(utterance);
    },
    [robotMode, rate, pitch, supported, voiceName, voices]
  );

  const speakMessage = useCallback((message, withPriority = false) => {
    const payload = withPriority
      ? { ...message, message_text: `Prioridad ${message.priority}. ${message.message_text}` }
      : message;
    speak(payload);
  }, [speak]);

  return {
    supported,
    ready,
    voices,
    voiceName,
    setVoiceName,
    hasSpanishVoice: voices.some((voice) => /^es[-_]/i.test(voice.lang)),
    rate,
    setRate,
    pitch,
    setPitch,
    robotMode,
    setRobotMode,
    speaking,
    currentId,
    lastError,
    speak,
    speakMessage,
    stop,
  };
}
