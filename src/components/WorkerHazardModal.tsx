"use client";

import React, { useState } from "react";
import { AlertTriangle, Mic, MicOff, Camera, X, CheckCircle, Loader2, Send } from "lucide-react";
import { Organization, HazardReport } from "@/lib/data/types";
import { reportHazard } from "@/lib/data/store";
import { LanguageCode, getTranslation } from "@/i18n";
import { AudioSpeakerButton } from "./AudioSpeakerButton";
import { startVoiceRecognition, speakText } from "@/lib/speech";
import { SECTORS } from "@/config/sectors";

interface WorkerHazardModalProps {
  workerId: string;
  workerName: string;
  organization: Organization;
  lang: LanguageCode;
  onClose: () => void;
  onSuccess: (hazard: HazardReport) => void;
}

export function WorkerHazardModal({
  workerId,
  workerName,
  organization,
  lang,
  onClose,
  onSuccess,
}: WorkerHazardModalProps) {
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStopFn, setVoiceStopFn] = useState<(() => void) | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);
  const sectorConfig = SECTORS[organization.sector] || SECTORS.construction;

  // Toggle voice recognition
  const handleToggleVoice = () => {
    if (isRecording) {
      if (voiceStopFn) voiceStopFn();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setErrorMsg(null);
      const controller = startVoiceRecognition(
        lang,
        (transcript) => {
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          setErrorMsg(err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      setVoiceStopFn(() => controller.stop);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 3) {
      setErrorMsg("Please speak or write at least 3 characters describing the hazard.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Call server API for classification & English translation
      const response = await fetch("/api/classify-hazard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptionRaw: description,
          sector: organization.sector,
          language: lang,
        }),
      });

      const triageData = response.ok
        ? await response.json()
        : {
            category: sectorConfig.hazardCategories[0].id,
            severity: "medium",
            descriptionEn: description,
          };

      // 2. Save hazard report
      const newHazard = reportHazard({
        workerId,
        orgId: organization.id,
        category: triageData.category,
        severity: triageData.severity,
        descriptionRaw: description,
        descriptionEn: triageData.descriptionEn,
        photoUrl: photoPreview || undefined,
      });

      // 3. Audio confirmation
      const voiceConfirm: Record<LanguageCode, string> = {
        en: `Safety hazard report received and routed to supervisor with ${triageData.severity} priority.`,
        hi: `खतरे की रिपोर्ट दर्ज हो गई है और सुपरवाइजर को भेज दी गई है।`,
        te: `భద్రతా సమస్య నమోదైంది. సూపర్‌వైజర్ పరిశీలనకు పంపబడింది.`,
        ta: `பாதுகாப்பு குறைபாடு பதிவு செய்யப்பட்டு மேற்பார்வையாளருக்கு அனுப்பப்பட்டது.`,
      };
      speakText(voiceConfirm[lang], lang);

      setIsSubmitting(false);
      onSuccess(newHazard);
    } catch (err: unknown) {
      console.error("Error submitting hazard:", err);
      // Fallback save directly
      const fallbackHazard = reportHazard({
        workerId,
        orgId: organization.id,
        category: sectorConfig.hazardCategories[0].id,
        severity: "high",
        descriptionRaw: description,
        descriptionEn: description,
        photoUrl: photoPreview || undefined,
      });
      setIsSubmitting(false);
      onSuccess(fallbackHazard);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base">{t("reportHazard")}</h3>
                <AudioSpeakerButton text={t("reportHazard")} lang={lang} size="sm" />
              </div>
              <p className="text-xs text-rose-200">{sectorConfig.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="tap-target w-9 h-9 rounded-full bg-rose-950/60 hover:bg-rose-950 text-rose-200 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Voice Speak Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-950">
                <span>{isRecording ? t("listening") : t("voiceRecord")}</span>
                <AudioSpeakerButton text={t("voiceRecord")} lang={lang} size="sm" />
              </div>
              <p className="text-[11px] text-rose-700">
                Tap the microphone and speak freely in your language.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label={isRecording ? "Stop Listening" : "Start Speaking"}
              className={`tap-target w-12 h-12 rounded-2xl flex items-center justify-center transition shadow ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-white text-rose-700 border border-rose-300 hover:bg-rose-100"
              }`}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>{t("typeHazard")}</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scaffolding clamp loose on 3rd floor west edge..."
              className="w-full text-sm p-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
            />
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">{t("attachPhoto")}</span>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-[11px] text-rose-600 font-semibold"
                >
                  Remove photo
                </button>
              )}
            </div>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-36">
                <img
                  src={photoPreview}
                  alt="Hazard capture"
                  className="w-full h-36 object-cover"
                />
              </div>
            ) : (
              <label className="tap-target w-full border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-3 flex items-center justify-center gap-2 cursor-pointer text-slate-600 text-xs font-medium bg-slate-50">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Upload or Capture Site Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full tap-target bg-rose-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:bg-rose-900 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing & Dispatching Report...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{t("submitReport")}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
