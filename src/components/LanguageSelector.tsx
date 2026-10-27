"use client";

import React, { useState } from "react";
import { Globe, Check } from "lucide-react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/i18n";
import { speakText } from "@/lib/speech";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  className?: string;
}

export function LanguageSelector({
  currentLang,
  onSelectLanguage,
  className = "",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    onSelectLanguage(code);
    setIsOpen(false);
    // Audio confirmation in selected language
    const sampleGreetings: Record<LanguageCode, string> = {
      en: "Language set to English",
      hi: "भाषा बदलकर हिन्दी कर दी गई है",
      te: "భాష తెలుగులోకి మార్చబడింది",
      ta: "மொழி தமிழாக மாற்றப்பட்டது",
    };
    speakText(sampleGreetings[code], code);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Language / भाषा बदलें / భాష మార్చు / மொழியை மாற்றுக"
        className="tap-target px-3 py-2 bg-white/90 hover:bg-white border border-slate-300 rounded-xl shadow-sm text-slate-800 text-sm font-semibold flex items-center gap-2 transition"
      >
        <Globe className="w-4 h-4 text-sdg-burgundy" />
        <span>{activeLang.nativeLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full tap-target px-3 py-2.5 rounded-xl text-left text-sm flex items-center justify-between transition ${
                  isSelected
                    ? "bg-rose-50 text-sdg-burgundy font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>
                  <span className="block font-medium">{lang.nativeLabel}</span>
                  <span className="text-xs text-slate-500">{lang.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-sdg-burgundy" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
