"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Award,
  ShieldCheck,
  Clock,
  Building,
  CheckCircle2,
  Copy,
  Share2,
  ArrowLeft,
  Calendar,
  Check,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AudioSpeakerButton } from "@/components/AudioSpeakerButton";
import { getSkillPassport, getWorkerById, getOrganizationById } from "@/lib/data/store";
import { SkillPassport, WorkerProfile, Organization } from "@/lib/data/types";
import { LanguageCode, getTranslation } from "@/i18n";
import { SECTORS } from "@/config/sectors";

interface PassportPageProps {
  params: {
    id: string;
  };
}

export default function SkillPassportPublicPage({ params }: PassportPageProps) {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  useEffect(() => {
    const p = getSkillPassport(params.id);
    if (p) {
      setPassport(p);
      const w = getWorkerById(p.workerId);
      if (w) {
        setWorker(w);
        const org = getOrganizationById(w.orgId);
        if (org) setOrganization(org);
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const publicUrl = window.location.href;
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating passport QR:", err));
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!passport || !worker) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">Loading Skill Passport...</p>
          <Link href="/worker" className="text-xs text-rose-600 underline">
            Return to Worker App
          </Link>
        </div>
      </div>
    );
  }

  const voiceSummary = `${passport.passportCode}. Verified Skill Passport for ${worker.fullName}. Total verified working hours: ${passport.totalVerifiedHours} hours across ${passport.entries.length} competencies.`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      <Navbar currentLang={lang} onSelectLanguage={setLang} />

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/worker"
            className="tap-target px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Worker Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <AudioSpeakerButton text={voiceSummary} lang={lang} size="sm" />
            <button
              type="button"
              onClick={handleCopyLink}
              className="tap-target px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t("linkCopied") : t("copyLink")}</span>
            </button>
          </div>
        </div>

        {/* Passport Certificate Card */}
        <article aria-labelledby="passport-card-title" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Badge */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-sdg-burgundy flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 id="passport-card-title" className="font-extrabold text-base tracking-tight">
                    {t("passportTitle")}
                  </h1>
                  <span className="text-xs text-rose-300 font-mono">
                    {passport.passportCode}
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            {/* Worker Details in Certificate */}
            <div className="mt-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white/20">
                {worker.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{worker.fullName}</h2>
                <p className="text-xs text-slate-300">{worker.trade}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Issuer: {organization?.name || "FairShift Network"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar: Verified Hours & Experience */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 p-4 text-center">
            <div>
              <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">
                {t("verifiedHours")}
              </span>
              <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                {passport.totalVerifiedHours.toLocaleString("en-IN")} hrs
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">
                Certifications
              </span>
              <span className="text-2xl font-black text-indigo-700 mt-0.5 block">
                {passport.entries.length} Verified
              </span>
            </div>
          </div>

          {/* Verified Skills & Certifications List */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t("certifications")}</span>
            </h3>

            <div className="space-y-3">
              {passport.entries.map((entry) => {
                const sectorConfig = SECTORS[entry.sector] || SECTORS.construction;
                return (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {entry.skillName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sectorConfig.badgeBg}`}>
                        {sectorConfig.title.split("&")[0].trim()}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs font-medium">
                      {entry.certificationName || "Site Work Competency Verified"}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>Issuing Org: {entry.issuingOrgName}</span>
                      <span className="font-bold text-slate-800">{entry.hoursLogged} hours logged</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Public Verification QR Code */}
            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
              <div className="inline-block p-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Public Passport QR"
                    className="w-36 h-36 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                    Loading QR...
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto">
                Scan with any smartphone camera to verify this worker&apos;s authentic experience record.
              </p>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
