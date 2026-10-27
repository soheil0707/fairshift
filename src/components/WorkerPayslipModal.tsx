"use client";

import React, { useState } from "react";
import {
  FileText,
  X,
  Volume2,
  Calendar,
  Clock,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Receipt,
  IndianRupee,
} from "lucide-react";
import { PayslipBreakdown } from "@/lib/payroll";
import { WorkerProfile, Organization } from "@/lib/data/types";
import { LanguageCode, getTranslation } from "@/i18n";
import { speakText, stopSpeech } from "@/lib/speech";
import { AudioSpeakerButton } from "./AudioSpeakerButton";

interface WorkerPayslipModalProps {
  payslip: PayslipBreakdown;
  worker: WorkerProfile;
  organization: Organization;
  lang: LanguageCode;
  onClose: () => void;
}

export function WorkerPayslipModal({
  payslip,
  worker,
  organization,
  lang,
  onClose,
}: WorkerPayslipModalProps) {
  const [showShiftTrace, setShowShiftTrace] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Full Voice Readout of Payslip in the worker's selected language
  const handleReadFullSlip = () => {
    if (isSpeakingFull) {
      stopSpeech();
      setIsSpeakingFull(false);
      return;
    }

    setIsSpeakingFull(true);
    const speechLines: Record<LanguageCode, string> = {
      en: `Payslip for ${worker.fullName} at ${organization.name}. Total days worked: ${payslip.totalDaysWorked}. Base pay: ${payslip.basePay} rupees. Overtime hours: ${payslip.totalOvertimeHours} hours, paid at double rate for ${payslip.overtimePay} rupees. Total gross earnings: ${payslip.grossPay} rupees. Provident fund deduction: ${payslip.deductions.pf} rupees. Medical insurance deduction: ${payslip.deductions.esi} rupees. Your net take-home pay is: ${payslip.netPay} rupees.`,
      hi: `${worker.fullName} की पे-स्लिप। कुल काम के दिन: ${payslip.totalDaysWorked}। मूल वेतन: ${payslip.basePay} रुपये। ओवरटाइम: ${payslip.totalOvertimeHours} घंटे, दोगुने दर पर ${payslip.overtimePay} रुपये। पीएफ कटौती: ${payslip.deductions.pf} रुपये। ईएसआई कटौती: ${payslip.deductions.esi} रुपये। कुल इन-हैंड वेतन: ${payslip.netPay} रुपये।`,
      te: `${worker.fullName} గారి పే-స్లిప్ వివరాలు. మొత్తం పనిచేసిన రోజులు: ${payslip.totalDaysWorked}. మూల వేతనం: ${payslip.basePay} రూపాయలు. ఓవర్‌టైమ్: ${payslip.totalOvertimeHours} గంటలు, రెట్టింపు రేటుతో ${payslip.overtimePay} రూపాయలు. పీఎఫ్ తగ్గింపు: ${payslip.deductions.pf} రూపాయలు. ఈఎస్ఐ తగ్గింపు: ${payslip.deductions.esi} రూపాయలు. మీ చేతికి వచ్చే నికర వేతనం: ${payslip.netPay} రూపాయలు.`,
      ta: `${worker.fullName} அவர்களின் ஊதியச் சீட்டு. வேலை செய்த நாட்கள்: ${payslip.totalDaysWorked}. அடிப்படை ஊதியம்: ${payslip.basePay} ரூபாய். கூடுதல் பணி: ${payslip.totalOvertimeHours} மணி நேரம், 2 மடங்கு விகிதத்தில் ${payslip.overtimePay} ரூபாய். பி.எஃப் பிடித்தம்: ${payslip.deductions.pf} ரூபாய். இ.எஸ்.ஐ பிடித்தம்: ${payslip.deductions.esi} ரூபாய். கைக்கு கிடைக்கும் நிகர ஊதியம்: ${payslip.netPay} ரூபாய்.`,
    };

    speakText(speechLines[lang], lang, () => {
      setIsSpeakingFull(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sdg-burgundy flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{t("payslipTitle")}</h3>
                <AudioSpeakerButton text={t("payslipTitle")} lang={lang} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                October 2026 • {worker.fullName} ({worker.trade})
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

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Read Aloud Full Action Bar */}
          <button
            type="button"
            onClick={handleReadFullSlip}
            className={`w-full tap-target px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
              isSpeakingFull
                ? "bg-rose-700 text-white animate-pulse"
                : "bg-rose-50 text-sdg-burgundy border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeakingFull ? t("stopReading") : t("readAloud")}</span>
          </button>

          {/* Big Net Pay Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-700 to-teal-800 text-white rounded-3xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-200 font-semibold tracking-wide uppercase">
                  {t("netPay")}
                </span>
                <div className="text-3xl font-extrabold tracking-tight mt-1">
                  ₹{payslip.netPay.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-emerald-200" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-100 flex items-center gap-1.5 border-t border-emerald-600/40 pt-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Direct Bank/Aadhaar Disbursal Verified</span>
            </div>
          </div>

          {/* Detailed Earning Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Base Pay Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold">{t("basePay")}</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                ₹{payslip.basePay.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500">
                {payslip.totalDaysWorked} days × ₹{payslip.dailyWage}
              </div>
            </div>

            {/* Overtime Pay Card (2x) */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-amber-900 text-xs">
                <span className="font-semibold">{t("overtimePay")}</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-amber-900">
                ₹{payslip.overtimePay.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-amber-700">
                {payslip.totalOvertimeHours}h × ₹{payslip.overtimeRate}/h (2x)
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{t("deductions")}</span>
              <span className="text-rose-600">
                -₹{payslip.deductions.totalDeductions.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t("pfDeduction")} (12%)</span>
                <span>₹{payslip.deductions.pf}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("esiDeduction")} (0.75%)</span>
                <span>₹{payslip.deductions.esi}</span>
              </div>
            </div>
          </div>

          {/* Traceable Shifts Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowShiftTrace(!showShiftTrace)}
              className="w-full p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>{t("traceShifts")} ({payslip.traceableShifts.length} Shifts)</span>
              </div>
              {showShiftTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showShiftTrace && (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white p-1">
                {payslip.traceableShifts.map((s, idx) => (
                  <div
                    key={s.shiftId}
                    className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50 rounded-xl"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        Day {idx + 1} ({s.date})
                      </span>
                      <div className="text-[11px] text-slate-500">
                        {s.regularHours}h regular {s.overtimeHours > 0 ? `+ ${s.overtimeHours}h OT (2x)` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">
                        ₹{(s.earnedBase + s.earnedOvertime).toFixed(0)}
                      </span>
                      <div className="text-[10px] text-emerald-600 font-mono">
                        #{s.shiftId.slice(-6)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
