"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  QrCode,
  MapPin,
  AlertTriangle,
  Receipt,
  MessageSquareHeart,
  Award,
  ChevronRight,
  UserCheck,
  Zap,
  TrendingUp,
  Shield,
  Volume2,
  Calendar,
  AlertCircle,
  Play,
  Square,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AudioSpeakerButton } from "@/components/AudioSpeakerButton";
import { WorkerCheckInModal } from "@/components/WorkerCheckInModal";
import { WorkerHazardModal } from "@/components/WorkerHazardModal";
import { WorkerPayslipModal } from "@/components/WorkerPayslipModal";
import { WorkerFeedbackModal } from "@/components/WorkerFeedbackModal";
import { LanguageCode, getTranslation } from "@/i18n";
import {
  initializeStore,
  getWorkers,
  getWorkerById,
  getOrganizationById,
  getActiveShift,
  checkOutWorker,
  getMonthlyPayslip,
  getHazards,
} from "@/lib/data/store";
import { assessWorkerFatigue } from "@/lib/fatigue";
import { WorkerProfile, Organization, Shift, HazardReport } from "@/lib/data/types";
import { speakText } from "@/lib/speech";

export default function WorkerAppPage() {
  const [lang, setLang] = useState<LanguageCode>("te"); // Default to Telugu as seeded in Guntur site
  const [activeWorkerId, setActiveWorkerId] = useState<string>("w-ramesh");
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Modals
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Recent hazards reported by this worker
  const [myHazards, setMyHazards] = useState<HazardReport[]>([]);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Initialize store and initial worker profile
  useEffect(() => {
    initializeStore();
    const w = getWorkerById(activeWorkerId);
    if (w) {
      setWorker(w);
      setLang(w.preferredLanguage);
      const org = getOrganizationById(w.orgId);
      if (org) setOrganization(org);

      const shift = getActiveShift(w.id);
      setActiveShift(shift || null);
    }
  }, [activeWorkerId]);

  // Sync hazards
  useEffect(() => {
    if (worker) {
      const hazards = getHazards().filter((h) => h.workerId === worker.id);
      setMyHazards(hazards);
    }
  }, [worker]);

  // Live elapsed shift timer
  useEffect(() => {
    if (!activeShift) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const startMs = new Date(activeShift.checkInTime).getTime();
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeShift]);

  const refreshState = () => {
    if (!worker) return;
    const shift = getActiveShift(worker.id);
    setActiveShift(shift || null);
    const hazards = getHazards().filter((h) => h.workerId === worker.id);
    setMyHazards(hazards);
  };

  const handleCheckOut = () => {
    if (!activeShift) return;
    const completed = checkOutWorker(activeShift.id);
    if (completed) {
      setActiveShift(null);
      const voiceMsg: Record<LanguageCode, string> = {
        en: `Shift completed. ${completed.regularHours} regular hours and ${completed.overtimeHours} overtime hours logged.`,
        hi: `शिफ्ट पूरी हुई। ${completed.regularHours} सामान्य घंटे और ${completed.overtimeHours} ओवरटाइम घंटे दर्ज किए गए।`,
        te: `పని ముగిసింది. ${completed.regularHours} సాధారణ గంటలు మరియు ${completed.overtimeHours} ఓవర్‌టైమ్ గంటలు నమోదయ్యాయి.`,
        ta: `பணி நிறைவுற்றது. ${completed.regularHours} மணி நேர வழக்கமான பணி மற்றும் ${completed.overtimeHours} மணி நேர கூடுதல் பணி பதிவானது.`,
      };
      speakText(voiceMsg[lang], lang);
    }
  };

  const allWorkers = getWorkers();
  const currentPayslip = worker ? getMonthlyPayslip(worker.id, 10, 2026) : null;

  // Fatigue assessment for this worker
  const fatigueStatus = assessWorkerFatigue(
    currentPayslip
      ? currentPayslip.traceableShifts.map((s) => ({
          id: s.shiftId,
          checkInTime: `${s.date}T08:00:00Z`,
          checkOutTime: `${s.date}T${8 + s.regularHours + s.overtimeHours}:00:00Z`,
        }))
      : []
  );

  const formatElapsedTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!worker || !organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-semibold text-sm">Loading FairShift Worker App...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentLang={lang}
        onSelectLanguage={setLang}
        sector={organization.sector}
        workerName={worker.fullName}
      />

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Worker Switcher Banner (For judges & testers to easily demo 25 workers across 3 orgs) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {worker.fullName.charAt(0)}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm truncate">{worker.fullName}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                  ₹{worker.dailyWage}/day
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{worker.trade}</p>
            </div>
          </div>

          {/* Quick Worker Selector Dropdown */}
          <select
            value={activeWorkerId}
            onChange={(e) => setActiveWorkerId(e.target.value)}
            aria-label="Switch Demo Worker"
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-700 outline-none max-w-[130px] shrink-0"
          >
            {allWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.trade.slice(0, 14)})
              </option>
            ))}
          </select>
        </div>

        {/* Fatigue Alert Warning Box (If Active) */}
        {fatigueStatus.isFatigued && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl shadow-sm text-amber-950 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>{t("fatigueWarningTitle")}</span>
              </div>
              <AudioSpeakerButton
                text={`${t("fatigueWarningTitle")}. ${fatigueStatus.alerts[0]?.message}`}
                lang={lang}
                variant="secondary"
                size="sm"
              />
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {fatigueStatus.alerts[0]?.message || t("fatigueWarningDesc")}
            </p>
          </div>
        )}

        {/* Active Shift Card / Check-In Hero */}
        <section aria-labelledby="shift-hero-title" className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {activeShift ? t("shiftActive") : t("checkIn")}
              </span>
              <AudioSpeakerButton
                text={activeShift ? t("shiftActive") : t("checkIn")}
                lang={lang}
                size="sm"
              />
            </div>
            {activeShift && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-950/80 border border-rose-800 px-2.5 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Live Recording
              </span>
            )}
          </div>

          {activeShift ? (
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-mono font-black tracking-tight text-white">
                  {formatElapsedTime(elapsedSeconds)}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t("checkedInAt")}: {new Date(activeShift.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 capitalize">{activeShift.checkInMethod.replace("_", " ")}</span>
                </div>
              </div>

              {/* Overtime Info Badge */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-300">Overtime after 8h = 2.0x Double Rate</span>
                </div>
                <AudioSpeakerButton text={t("overtimeNotice")} lang={lang} size="sm" />
              </div>

              {/* Big Check Out Button */}
              <button
                type="button"
                onClick={handleCheckOut}
                className="w-full tap-target bg-rose-700 hover:bg-rose-800 active:scale-[0.98] text-white font-extrabold text-base py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>{t("checkOut")}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-1">
              <p className="text-sm text-slate-300">
                Tap below to scan the site muster board QR code or confirm with GPS.
              </p>

              {/* Big Check In Action Button */}
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(true)}
                className="w-full tap-target bg-sdg-burgundy hover:bg-rose-900 active:scale-[0.98] text-white font-extrabold text-base py-4 rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t("checkIn")}</span>
              </button>
            </div>
          )}
        </section>

        {/* 4 Large Action Cards (Mobile-first ergonomics, min 48px tap targets, high contrast) */}
        <section aria-label="Worker Services" className="grid grid-cols-2 gap-3">
          {/* Card 1: Payslip Breakdown */}
          <button
            type="button"
            onClick={() => setIsPayslipModalOpen(true)}
            className="tap-target min-h-[110px] p-4 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between transition group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <AudioSpeakerButton text={t("payslipTitle")} lang={lang} size="sm" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                {t("payslipTitle")}
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                ₹{currentPayslip ? currentPayslip.netPay.toLocaleString("en-IN") : "0"} In-hand
              </span>
            </div>
          </button>

          {/* Card 2: Report Hazard */}
          <button
            type="button"
            onClick={() => setIsHazardModalOpen(true)}
            className="tap-target min-h-[110px] p-4 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between transition group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <AudioSpeakerButton text={t("reportHazard")} lang={lang} size="sm" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                {t("reportHazard")}
              </span>
              <span className="text-xs text-rose-700 font-semibold">
                Voice & Photo
              </span>
            </div>
          </button>

          {/* Card 3: Anonymous Feedback */}
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="tap-target min-h-[110px] p-4 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between transition group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <AudioSpeakerButton text={t("anonymousFeedbackTitle")} lang={lang} size="sm" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                {t("anonymousFeedbackTitle")}
              </span>
              <span className="text-xs text-teal-700 font-semibold">
                100% Secret
              </span>
            </div>
          </button>

          {/* Card 4: Skill Passport */}
          <Link
            href={`/passport/${worker.id}`}
            className="tap-target min-h-[110px] p-4 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between transition group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <AudioSpeakerButton text={t("passportTitle")} lang={lang} size="sm" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                {t("passportTitle")}
              </span>
              <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                Verified Experience
              </span>
            </div>
          </Link>
        </section>

        {/* Hazard Reports Status Tracking Section */}
        {myHazards.length > 0 && (
          <section aria-labelledby="hazards-status-title" className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h4 id="hazards-status-title">My Safety Reports Tracking</h4>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {myHazards.length} logged
              </span>
            </div>

            <div className="space-y-2.5">
              {myHazards.slice(0, 3).map((h) => {
                const statusColors = {
                  reported: "bg-amber-100 text-amber-900 border-amber-300",
                  acknowledged: "bg-blue-100 text-blue-900 border-blue-300",
                  fixed: "bg-emerald-100 text-emerald-900 border-emerald-300",
                };

                return (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">
                        {h.descriptionEn || h.descriptionRaw}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusColors[h.status]
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-sans line-clamp-1 italic">
                      &quot;{h.descriptionRaw}&quot;
                    </p>

                    {h.actionNotes && (
                      <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                        <strong>Supervisor Action:</strong> {h.actionNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SDG 8 Decent Work Pledge Footer */}
        <div className="text-center py-4 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            FairShift • UN SDG 8 Decent Work Platform
          </p>
          <p className="text-[11px] text-slate-400">
            Automated 2x Overtime • Voice Inclusion • Zero Wage Discrimination
          </p>
        </div>
      </main>

      {/* MODALS */}
      {isCheckInModalOpen && (
        <WorkerCheckInModal
          workerId={worker.id}
          workerName={worker.fullName}
          organization={organization}
          lang={lang}
          onClose={() => setIsCheckInModalOpen(false)}
          onSuccess={() => {
            setIsCheckInModalOpen(false);
            refreshState();
          }}
        />
      )}

      {isHazardModalOpen && (
        <WorkerHazardModal
          workerId={worker.id}
          workerName={worker.fullName}
          organization={organization}
          lang={lang}
          onClose={() => setIsHazardModalOpen(false)}
          onSuccess={() => {
            setIsHazardModalOpen(false);
            refreshState();
          }}
        />
      )}

      {isPayslipModalOpen && currentPayslip && (
        <WorkerPayslipModal
          payslip={currentPayslip}
          worker={worker}
          organization={organization}
          lang={lang}
          onClose={() => setIsPayslipModalOpen(false)}
        />
      )}

      {isFeedbackModalOpen && (
        <WorkerFeedbackModal
          orgId={organization.id}
          lang={lang}
          onClose={() => setIsFeedbackModalOpen(false)}
          onSuccess={() => {
            setIsFeedbackModalOpen(false);
            refreshState();
          }}
        />
      )}
    </div>
  );
}
