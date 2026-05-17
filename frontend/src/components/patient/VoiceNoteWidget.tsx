import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Save, RotateCcw, Volume2 } from "lucide-react";

const VN = "pages.patientDetail.voiceNote";

interface VoiceNoteWidgetProps {
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceNoteWidget({ onTranscriptionComplete }: VoiceNoteWidgetProps) {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-PH";

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleRefine = () => {
    setIsRefining(true);
    // Mocking AI refinement (Phase 1.1 logic)
    setTimeout(() => {
      setTranscript(
        (prev) =>
          `${t(`${VN}.aiRefinedPrefix`)}${prev}.${t(`${VN}.aiRefinedSuffix`)}`,
      );
      setIsRefining(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          {t(`${VN}.title`)}
        </h3>
        <div className="flex gap-2">
          {transcript && (
            <button 
              onClick={() => setTranscript("")}
              className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-[120px] bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {transcript || (
          <span className="text-slate-400 italic">{t(`${VN}.placeholder`)}</span>
        )}
        {isListening && (
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute bottom-4 right-4 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t(`${VN}.recording`)}</span>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleListening}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all ${
            isListening 
              ? "bg-rose-500 text-white shadow-lg shadow-rose-200" 
              : "bg-white text-slate-700 border border-slate-100 hover:border-sky-500 hover:text-sky-600"
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? t(`${VN}.stopListening`) : t(`${VN}.startDictation`)}
        </button>

        <button
          disabled={!transcript || isListening || isRefining}
          onClick={handleRefine}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100"
        >
          <Sparkles className="w-5 h-5" />
          {isRefining ? t(`${VN}.refining`) : t(`${VN}.refineAi`)}
        </button>

        <button
          disabled={!transcript || isListening}
          onClick={() => onTranscriptionComplete(transcript)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-400 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
        >
          <Save className="w-5 h-5" />
          {t(`${VN}.applyNotes`)}
        </button>
      </div>
    </div>
  );
}
