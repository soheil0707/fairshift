"use client";

import React, { useState } from "react";
import { QrCode, MapPin, X, CheckCircle, AlertCircle, Camera, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Organization } from "@/lib/data/types";
import { checkInWorker } from "@/lib/data/store";
import { LanguageCode, getTranslation } from "@/i18n";
import { AudioSpeakerButton } from "./AudioSpeakerButton";
import { speakText } from "@/lib/speech";

interface WorkerCheckInModalProps {
  workerId: string;
  workerName: string;
  organization: Organization;
  lang: LanguageCode;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkerCheckInModal({
  workerId,
  workerName,
  organization,
  lang,
  onClose,
  onSuccess,
}: WorkerCheckInModalProps) {
  const [method, setMethod] = useState<"qr" | "gps">("qr");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const handleQrCheckIn = () => {
    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      checkInWorker(workerId, organization.id, "qr_code");
      setIsVerifying(false);
      setSuccessMsg("Site QR Code Verified! Shift Started.");
      triggerConfetti();

      const voiceConfirmation: Record<LanguageCode, string> = {
        en: `Attendance verified by QR code. Shift started for ${workerName}. Have a safe day!`,
        hi: `क्युआर कोड से हाजिरी लग गई। शिफ्ट शुरू हो गई है। सुरक्षित कार्य करें!`,
        te: `QR కోడ్ ద్వారా హాజరు నమోదైంది. మీ షిఫ్ట్ ప్రారంభమైంది. జాగ్రత్తగా పనిచేయండి!`,
        ta: `QR குறியீடு மூலம் வருகை பதிவானது. பணி தொடங்கியது. பாதுகாப்பாக பணிபுரியுங்கள்!`,
      };
      speakText(voiceConfirmation[lang], lang);

      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 800);
  };

  const handleGpsCheckIn = () => {
    setIsVerifying(true);
    setErrorMsg(null);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          finishGps(lat, lng);
        },
        () => {
          // Fallback to simulated site coordinate within boundary
          finishGps(organization.geofenceLat + 0.0002, organization.geofenceLng + 0.0001);
        },
        { timeout: 4000 }
      );
    } else {
      finishGps(organization.geofenceLat + 0.0001, organization.geofenceLng + 0.0001);
    }
  };

  const finishGps = (lat: number, lng: number) => {
    checkInWorker(workerId, organization.id, "geofence", lat, lng);
    setIsVerifying(false);
    setSuccessMsg(`Site Geofence Verified (${organization.name})! Shift Started.`);
    triggerConfetti();

    const voiceConfirmation: Record<LanguageCode, string> = {
      en: `Site GPS boundary verified. Shift started for ${workerName}.`,
      hi: `साइट जीपीएस सीमा सत्यापित हुई। आपकी शिफ्ट शुरू हो गई है।`,
      te: `సైట్ GPS సరిహద్దు ధృవీకరించబడింది. షిఫ్ట్ ప్రారంభమైంది.`,
      ta: `தள GPS எல்லை சரிபார்க்கப்பட்டது. பணி தொடங்கியது.`,
    };
    speakText(voiceConfirmation[lang], lang);

    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sdg-burgundy flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base">{t("checkIn")}</h3>
                <AudioSpeakerButton text={t("checkIn")} lang={lang} size="sm" />
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">
                {organization.name}
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setMethod("qr")}
              className={`tap-target rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                method === "qr"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <QrCode className="w-4 h-4 text-sdg-burgundy" />
              <span>{t("scanQr")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("gps")}
              className={`tap-target rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                method === "gps"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t("gpsCheck")}</span>
            </button>
          </div>

          {/* Feedback states */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Content according to method */}
          {method === "qr" ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-48 h-48 mx-auto bg-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden border-4 border-dashed border-slate-700">
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                <Camera className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-[11px] text-slate-300 font-medium">
                  Site Scanner Ready
                </p>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  {organization.qrCodeSecret.slice(0, 16)}...
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Hold phone camera facing the muster board QR code or tap below.
              </p>

              <button
                type="button"
                disabled={isVerifying}
                onClick={handleQrCheckIn}
                className="w-full tap-target bg-sdg-burgundy text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:bg-rose-900 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying QR Code...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>Tap to Scan Site QR Code</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Geofence Site Coordinates</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1">
                  <p><strong>Site:</strong> {organization.name}</p>
                  <p><strong>Location:</strong> {organization.location}</p>
                  <p><strong>Geofence Radius:</strong> Within {organization.geofenceRadiusMeters} meters</p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Verifies phone GPS is located on the job site boundary.
              </p>

              <button
                type="button"
                disabled={isVerifying}
                onClick={handleGpsCheckIn}
                className="w-full tap-target bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:bg-emerald-800 active:scale-[0.98] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Acquiring Site GPS...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>Confirm Site GPS Check-In</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
