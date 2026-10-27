"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Eye,
  Building,
  QrCode,
  Flame,
  Award,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Shield,
  Zap,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteQrModal } from "@/components/SiteQrModal";
import {
  initializeStore,
  getOrganizations,
  getOrganizationById,
  getAdminMetrics,
  getHazards,
  updateHazardStatus,
  isHazardEscalated,
  resetDemoData,
  AdminMetrics,
} from "@/lib/data/store";
import { SECTORS } from "@/config/sectors";
import { Organization, HazardReport } from "@/lib/data/types";
import { LanguageCode } from "@/i18n";

// Lazy-load Recharts component to keep JS bundle lean
const AdminOvertimeChart = dynamic(
  () => import("@/components/AdminOvertimeChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        Loading Overtime Chart...
      </div>
    ),
  }
);

export default function AdminDashboardPage() {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("org-sai-constructions");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const orgs = getOrganizations();
  const currentOrg = getOrganizationById(selectedOrgId) || orgs[0];
  const sectorConfig = SECTORS[currentOrg.sector] || SECTORS.construction;

  const refreshData = () => {
    initializeStore();
    const data = getAdminMetrics(selectedOrgId);
    setMetrics(data);
  };

  useEffect(() => {
    refreshData();
  }, [selectedOrgId]);

  const handleAcknowledge = (hazardId: string) => {
    updateHazardStatus(hazardId, "acknowledged", "Supervisor inspected site and alerted engineering.");
    setActionSuccessMsg("Hazard acknowledged. Safety SLA stopped.");
    refreshData();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleFix = (hazardId: string) => {
    updateHazardStatus(hazardId, "fixed", "Corrective repair completed and verified by site safety in-charge.");
    setActionSuccessMsg("Hazard marked Fixed & Resolved.");
    refreshData();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleResetData = () => {
    if (confirm("Reset all shifts, hazards, and feedback back to initial seed state?")) {
      resetDemoData();
      refreshData();
    }
  };

  if (!metrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-semibold text-sm">Loading FairShift Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentLang={lang}
        onSelectLanguage={setLang}
        sector={currentOrg.sector}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Top Control Bar: Multi-Industry Org Selector & QR Code Generator */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${sectorConfig.badgeBg}`}>
                Sector: {sectorConfig.title}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentOrg.location}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {currentOrg.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Org Switcher */}
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              aria-label="Select Organization"
              className="tap-target px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none hover:border-slate-400"
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.sector})
                </option>
              ))}
            </select>

            {/* Print Site QR Code Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="tap-target px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <QrCode className="w-4 h-4 text-rose-400" />
              <span>Generate Site QR</span>
            </button>

            {/* Reset Seed Data */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset to fresh demo seed"
              className="tap-target p-2 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action success toast */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* 2-Hour SLA Auto-Escalation Alert Banner (If Any Critical Hazard Unacknowledged > 2h) */}
        {metrics.escalatedHazardsCount > 0 && (
          <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-3xl shadow-sm text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-sm text-rose-950">
                  Critical SLA Escalation: {metrics.escalatedHazardsCount} Open Hazard(s) Exceeded 2-Hour Limit
                </h2>
                <p className="text-xs text-rose-800">
                  Under UN SDG 8 safety standards, critical site risks unaddressed past 2 hours trigger automatic management notification.
                </p>
              </div>
            </div>
            <a
              href="#hazards-section"
              className="tap-target px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shrink-0"
            >
              Review Escalations
            </a>
          </div>
        )}

        {/* Key Metrics Cards */}
        <section aria-labelledby="metrics-title" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attendance Today */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Today&apos;s Attendance</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {metrics.todayActiveCheckIns + metrics.todayCompletedShifts} / {metrics.totalWorkers}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{metrics.todayActiveCheckIns} currently active on site</span>
            </div>
          </div>

          {/* Card 2: Overtime Hours Logged */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Overtime Hours (2x Pay)</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {metrics.totalMonthOvertimeHours} hrs
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              Of {metrics.totalMonthHours} total hours logged (Indian Law Norms)
            </div>
          </div>

          {/* Card 3: Open Hazards by Severity */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Open Safety Hazards</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {metrics.openHazardsCount} active
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <span className="text-rose-600 font-bold">{metrics.hazardsBySeverity.critical} crit</span> •
              <span className="text-amber-600 font-bold">{metrics.hazardsBySeverity.high} high</span> •
              <span>{metrics.hazardsBySeverity.medium + metrics.hazardsBySeverity.low} med/low</span>
            </div>
          </div>

          {/* Card 4: Team Feedback (k-Anonymity Gate) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Anonymous Morale</span>
              <MessageSquare className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {metrics.feedbackSummary.kAnonymityMet
                ? `${metrics.feedbackSummary.overallScore} / 5.0`
                : "Protected"}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {metrics.feedbackSummary.kAnonymityMet
                ? `Based on ${metrics.feedbackSummary.totalResponses} submissions (k ≥ 5 met)`
                : `k-Anonymity gate active (${metrics.feedbackSummary.totalResponses} / 5 responses)`}
            </div>
          </div>
        </section>

        {/* Overtime Trend Chart Section */}
        <section aria-labelledby="ot-trend-title" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <div>
              <h2 id="ot-trend-title" className="font-extrabold text-base text-slate-900">
                Overtime vs Regular Hours Trend (Indian Labour Law 2x Rate)
              </h2>
              <p className="text-xs text-slate-500">
                10-day audit of regular 8-hour shifts vs overtime hours qualifying for statutory double wage.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
              Factories Act & Minimum Wages
            </span>
          </div>

          <div className="pt-2">
            <AdminOvertimeChart data={metrics.overtimeTrend} />
          </div>
        </section>

        {/* Two-Column Section: Open Safety Hazards Triage & Fatigue Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="hazards-section">
          {/* Hazards Triage */}
          <section aria-labelledby="hazards-heading" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="hazards-heading" className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Safety Hazard Reports & SLA Triage</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Multilingual worker reports auto-classified and translated.
                </p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                {metrics.openHazardsCount} Open
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {metrics.hazardsBySeverity.critical + metrics.hazardsBySeverity.high + metrics.hazardsBySeverity.medium + metrics.hazardsBySeverity.low === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All reported hazards have been resolved!
                </div>
              ) : (
                getAdminHazards(selectedOrgId).map((hazard) => {
                  const escalated = isHazardEscalated(hazard);
                  const severityBadge = {
                    critical: "bg-rose-100 text-rose-900 border-rose-300 font-black",
                    high: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
                    medium: "bg-blue-100 text-blue-900 border-blue-300",
                    low: "bg-slate-100 text-slate-700 border-slate-300",
                  }[hazard.severity];

                  return (
                    <div
                      key={hazard.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 transition ${
                        escalated
                          ? "bg-rose-50/70 border-rose-400 shadow-sm"
                          : hazard.status === "fixed"
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${severityBadge}`}>
                            {hazard.severity}
                          </span>
                          {escalated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                              Escalated (&gt;2h SLA)
                            </span>
                          )}
                          <span className="text-slate-400 text-[10px]">
                            {new Date(hazard.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          #{hazard.id}
                        </span>
                      </div>

                      {/* English translated title */}
                      <p className="font-bold text-slate-900 text-xs">
                        {hazard.descriptionEn || hazard.descriptionRaw}
                      </p>

                      {/* Raw Indic transcription */}
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                        &quot;{hazard.descriptionRaw}&quot;
                      </p>

                      {/* Photo Thumbnail if attached */}
                      {hazard.photoUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-28">
                          <img
                            src={hazard.photoUrl}
                            alt="Hazard Evidence"
                            className="w-full h-28 object-cover"
                          />
                        </div>
                      )}

                      {/* Action buttons */}
                      {hazard.status !== "fixed" && (
                        <div className="flex items-center gap-2 pt-1">
                          {hazard.status === "reported" && (
                            <button
                              type="button"
                              onClick={() => handleAcknowledge(hazard.id)}
                              className="tap-target px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFix(hazard.id)}
                            className="tap-target px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                          >
                            Mark Fixed & Verified
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Fatigue Alerts Roster */}
          <section aria-labelledby="fatigue-heading" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="fatigue-heading" className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  <span>Fatigue & Rest Gap Watchlist</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Flags workers exceeding &gt;10h/day, &gt;60h/week, &lt;8h rest, or 6+ consecutive days.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl">
                {metrics.fatiguedWorkers.length} Flagged
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {metrics.fatiguedWorkers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All workers are operating within statutory rest limits.
                </div>
              ) : (
                metrics.fatiguedWorkers.map(({ worker, fatigue }) => (
                  <div
                    key={worker.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">
                          {worker.fullName}
                        </span>
                        <span className="text-slate-500 text-[11px] block">
                          {worker.trade}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          fatigue.riskLevel === "critical"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {fatigue.riskLevel} Fatigue
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      {fatigue.alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{alert.message}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-amber-900 font-medium">
                      <strong>Mandated Rest Action:</strong> Minimum 24-hour rest recovery before next roster allocation.
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Explainable Attrition Risk per Worker */}
        <section aria-labelledby="attrition-heading" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <div>
              <h2 id="attrition-heading" className="font-extrabold text-base text-slate-900">
                Explainable Attrition & Retention Risk Scores (0–100)
              </h2>
              <p className="text-xs text-slate-500">
                Transparent rule-based scoring derived from attendance drop, overtime load, fatigue triggers, team morale, and safety complaints.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Auditable &amp; Explainable (No Black-Box ML)
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {metrics.attritionRisks.map((risk) => {
              const riskBadge = {
                severe: "bg-rose-100 text-rose-900 border-rose-300 font-black",
                high: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
                moderate: "bg-blue-100 text-blue-900 border-blue-300",
                low: "bg-emerald-100 text-emerald-900 border-emerald-300",
              }[risk.riskLevel];

              return (
                <div
                  key={risk.workerId}
                  className="py-4 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-2xl transition"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {risk.workerName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${riskBadge}`}>
                        {risk.riskLevel} ({risk.score}/100)
                      </span>
                    </div>

                    {/* Explanatory Reasons List */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {risk.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-medium"
                        >
                          {r}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-indigo-900 font-medium">
                      <strong>Recommendation:</strong> {risk.recommendedAction}
                    </p>
                  </div>

                  <Link
                    href={`/passport/${risk.workerId}`}
                    className="tap-target px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>View Passport</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Anonymous Feedback Summary (Strict k-Anonymity Gate) */}
        <section aria-labelledby="feedback-summary-title" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="feedback-summary-title" className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <span>Anonymous Worker Feedback &amp; k-Anonymity Gate</span>
              </h2>
              <p className="text-xs text-slate-500">
                Data is mathematically aggregated. Individual responses can only be viewed when at least 5 submissions exist.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                metrics.feedbackSummary.kAnonymityMet
                  ? "bg-teal-100 text-teal-900 border-teal-300"
                  : "bg-slate-100 text-slate-600 border-slate-300"
              }`}
            >
              {metrics.feedbackSummary.kAnonymityMet ? "k-Anonymity Verified (k ≥ 5)" : "Threshold Pending"}
            </span>
          </div>

          {metrics.feedbackSummary.kAnonymityMet ? (
            <div className="space-y-4">
              {/* Score Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block">Supervisor Support</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {metrics.feedbackSummary.averageManager} / 5.0
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block">Site Safety &amp; PPE</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {metrics.feedbackSummary.averageSafety} / 5.0
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block">Pay Punctuality</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {metrics.feedbackSummary.averagePay} / 5.0
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-500 font-semibold block">Workload Balance</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {metrics.feedbackSummary.averageWorkload} / 5.0
                  </span>
                </div>
              </div>

              {/* Verified Anonymous Voice Comments */}
              {metrics.feedbackSummary.recentComments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-800">
                    Aggregated Anonymous Worker Comments ({metrics.feedbackSummary.recentComments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {metrics.feedbackSummary.recentComments.map((comment, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic"
                      >
                        &quot;{comment}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                k-Anonymity Protection Active
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Only {metrics.feedbackSummary.totalResponses} worker responses received so far. A minimum of 5 responses is strictly required before aggregated scores can be revealed to protect individual worker confidentiality.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* QR MODAL */}
      {isQrModalOpen && (
        <SiteQrModal
          organization={currentOrg}
          onClose={() => setIsQrModalOpen(false)}
        />
      )}
    </div>
  );
}

// Helper to get hazards for selected org
function getAdminHazards(orgId: string): HazardReport[] {
  const all = getHazards(orgId);
  return all;
}
