"use client";

import React, { useState } from "react";
import { MessageSquareHeart, X, Mic, MicOff, Shield, Send, CheckCircle } from "lucide-react";
import { submitAnonymousFeedback } from "@/lib/data/store";
import { LanguageCode, getTranslation } from "@/i18n";
import { startVoiceRecognition, speakText } from "@/lib/speech";
import { AudioSpeakerButton } from "./AudioSpeakerButton";

interface WorkerFeedbackModalProps {
  orgId: string;
  lang: LanguageCode;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkerFeedbackModal({
  orgId,
  lang,
  onClose,
  onSuccess,
}: WorkerFeedbackModalProps) {
  const [ratingManager, setRatingManager] = useState(4);
  const [ratingSafety, setRatingSafety] = useState(4);
  const [ratingPay, setRatingPay] = useState(4);
  const [ratingWorkload, setRatingWorkload] = useState(3);
  const [comment, setComment] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStopFn, setVoiceStopFn] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const emojis = ["😡", "🙁", "😐", "🙂", "🤩"];
  const emojiLabels = ["Poor", "Below Average", "Neutral", "Good", "Excellent"];

  const handleToggleVoice = () => {
    if (isRecording) {
      if (voiceStopFn) voiceStopFn();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const controller = startVoiceRecognition(
        lang,
        (transcript) => {
          setComment((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => setIsRecording(false),
        () => setIsRecording(false)
      );
      setVoiceStopFn(() => controller.stop);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save with NO worker or user identifier
    submitAnonymousFeedback({
      orgId,
      ratingManager,
      ratingSafety,
      ratingPay,
      ratingWorkload,
      comment: comment.trim() || undefined,
    });

    const voiceThanks: Record<LanguageCode, string> = {
      en: "Thank you for your anonymous feedback. Your identity is 100% protected.",
      hi: "आपकी गोपनीय राय के लिए धन्यवाद। आपकी पहचान पूरी तरह सुरक्षित है।",
      te: "మీ గోప్యమైన ఫీడ్‌బ్యాక్‌కు ధన్యవాదాలు. మీ గోప్యత రక్షించబడుతుంది.",
      ta: "உங்கள் ரகசியக் கருத்துக்கு நன்றி. உங்கள் அடையாளம் பாதுகாக்கப்படும்.",
    };
    speakText(voiceThanks[lang], lang);

    setIsSubmitting(false);
    setIsDone(true);

    setTimeout(() => {
      onSuccess();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sdg-teal flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{t("anonymousFeedbackTitle")}</h3>
                <AudioSpeakerButton text={t("anonymousFeedbackTitle")} lang={lang} size="sm" />
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Tracking • Untraceable Identity</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="tap-target w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{t("feedbackSuccess")}</h4>
            <p className="text-xs text-slate-500">{t("feedbackNotice")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Privacy notice banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t("feedbackNotice")}</span>
            </div>

            {/* Rating 1: Supervisor Support */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">{t("rateManager")}</label>
                <AudioSpeakerButton text={t("rateManager")} lang={lang} size="sm" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingManager(val)}
                    aria-label={`Rate ${val} of 5: ${emojiLabels[val - 1]}`}
                    className={`tap-target rounded-2xl flex flex-col items-center justify-center p-2 transition ${
                      ratingManager === val
                        ? "bg-amber-100 border-2 border-amber-500 scale-105 shadow-sm"
                        : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{emojis[val - 1]}</span>
                    <span className="text-[10px] text-slate-600 mt-1">{val}★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating 2: Site Safety */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">{t("rateSafety")}</label>
                <AudioSpeakerButton text={t("rateSafety")} lang={lang} size="sm" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingSafety(val)}
                    aria-label={`Rate ${val} of 5`}
                    className={`tap-target rounded-2xl flex flex-col items-center justify-center p-2 transition ${
                      ratingSafety === val
                        ? "bg-amber-100 border-2 border-amber-500 scale-105 shadow-sm"
                        : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{emojis[val - 1]}</span>
                    <span className="text-[10px] text-slate-600 mt-1">{val}★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating 3: Pay Fairness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">{t("ratePay")}</label>
                <AudioSpeakerButton text={t("ratePay")} lang={lang} size="sm" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingPay(val)}
                    aria-label={`Rate ${val} of 5`}
                    className={`tap-target rounded-2xl flex flex-col items-center justify-center p-2 transition ${
                      ratingPay === val
                        ? "bg-amber-100 border-2 border-amber-500 scale-105 shadow-sm"
                        : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{emojis[val - 1]}</span>
                    <span className="text-[10px] text-slate-600 mt-1">{val}★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating 4: Workload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">{t("rateWorkload")}</label>
                <AudioSpeakerButton text={t("rateWorkload")} lang={lang} size="sm" />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRatingWorkload(val)}
                    aria-label={`Rate ${val} of 5`}
                    className={`tap-target rounded-2xl flex flex-col items-center justify-center p-2 transition ${
                      ratingWorkload === val
                        ? "bg-amber-100 border-2 border-amber-500 scale-105 shadow-sm"
                        : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{emojis[val - 1]}</span>
                    <span className="text-[10px] text-slate-600 mt-1">{val}★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice / Text comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Voice or Written Opinion</span>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`tap-target px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                    isRecording ? "bg-rose-600 text-white animate-pulse" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? "Listening..." : "Speak"}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("commentPlaceholder")}
                className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-sdg-burgundy outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full tap-target bg-sdg-burgundy text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:bg-rose-900 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{t("submitFeedback")}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
