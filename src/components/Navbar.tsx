"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, HardHat, Building2, Stethoscope, GraduationCap, Factory } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { LanguageCode } from "@/i18n";
import { SectorType, SECTORS } from "@/config/sectors";

interface NavbarProps {
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  sector?: SectorType;
  workerName?: string;
}

export function Navbar({
  currentLang,
  onSelectLanguage,
  sector = "construction",
  workerName,
}: NavbarProps) {
  const pathname = usePathname();
  const isWorker = pathname.startsWith("/worker");
  const isAdmin = pathname.startsWith("/admin");

  const sectorIcons = {
    construction: <HardHat className="w-4 h-4 text-amber-600" />,
    hospital: <Stethoscope className="w-4 h-4 text-emerald-600" />,
    college: <GraduationCap className="w-4 h-4 text-indigo-600" />,
    factory: <Factory className="w-4 h-4 text-rose-600" />,
  };

  const sectorConfig = SECTORS[sector] || SECTORS.construction;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & SDG 8 Tag */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-sdg-burgundy flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">
                FairShift
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">
                UN SDG 8
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>{sectorIcons[sector]}</span>
              <span className="truncate max-w-[150px] sm:max-w-none">{sectorConfig.title}</span>
            </div>
          </div>
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Interface Switcher Pill */}
          <nav aria-label="Portal Navigation" className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <Link
              href="/worker"
              className={`tap-target px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isWorker
                  ? "bg-sdg-burgundy text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>👷</span>
              <span className="hidden sm:inline">Worker</span>
            </Link>
            <Link
              href="/admin"
              className={`tap-target px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>📊</span>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </nav>

          {/* Language Switcher */}
          <LanguageSelector
            currentLang={currentLang}
            onSelectLanguage={onSelectLanguage}
          />
        </div>
      </div>
    </header>
  );
}
