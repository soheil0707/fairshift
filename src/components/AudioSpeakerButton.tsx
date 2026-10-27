"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { speakText, stopSpeech } from "@/lib/speech";
import { LanguageCode } from "@/i18n";

interface AudioSpeakerButtonProps {
  text: string;
  lang: LanguageCode;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "secondary" | "subtle";
}

export function AudioSpeakerButton({
  text,
  lang,
  ariaLabel = "Read label aloud",
  size = "md",
  className = "",
  variant = "subtle",
}: AudioSpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(text, lang, () => {
        setIsPlaying(false);
      });
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 p-1 text-xs",
    md: "w-10 h-10 p-2 text-sm",
    lg: "w-12 h-12 p-2.5 text-base",
  };

  const variantClasses = {
    subtle: "bg-slate-100 hover:bg-slate-200 text-slate-700 active:bg-slate-300 border border-slate-300",
    primary: "bg-sdg-burgundy text-white hover:bg-rose-900 active:bg-rose-950 shadow-sm",
    secondary: "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`tap-target rounded-full transition-all flex items-center justify-center shrink-0 ${sizeClasses[size]} ${variantClasses[variant]} ${
        isPlaying ? "ring-2 ring-sdg-burgundy animate-pulse" : ""
      } ${className}`}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-current animate-bounce" />
      ) : (
        <Volume2 className="w-5 h-5 text-current" />
      )}
    </button>
  );
}
