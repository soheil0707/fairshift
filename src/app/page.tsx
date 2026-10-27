"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  HardHat,
  Stethoscope,
  GraduationCap,
  Factory,
  CheckCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Receipt,
  AlertTriangle,
  MessageSquareHeart,
  Award,
  Flame,
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SECTORS } from "@/config/sectors";
import { DEMO_ORGS } from "@/config/sectors";

export default function HomePage() {
  const [selectedDemoRole, setSelectedDemoRole] = useState<"worker" | "admin">("worker");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Banner: UN SDG 8 Official Decent Work */}
      <div className="bg-gradient-to-r from-rose-900 via-sdg-burgundy to-rose-950 text-white text-xs font-bold py-2 px-4 text-center tracking-wide border-b border-rose-800 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>UN SDG 8 HACKATHON EDITION • Dignity, Fair Pay &amp; Safe Working Environments for Every Worker</span>
      </div>

      {/* Main Navigation */}
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sdg-burgundy flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">FairShift</span>
            <span className="block text-[10px] text-rose-300 font-bold uppercase tracking-wider">
              SDG 8 Decent Work PWA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/worker"
            className="tap-target px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>👷 Worker App</span>
          </Link>
          <Link
            href="/admin"
            className="tap-target px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>📊 Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Mobile-First PWA • Low Literacy Voice Inclusion • 2x Statutory Overtime</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Dignity, Fair Wages &amp; Safety Voice for <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">Frontline Workers</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          FairShift safeguards contract, informal, and facility workers across construction, healthcare, education, and manufacturing with automated 2x overtime pay under Indian labour laws, voice-driven safety reporting, transparent traceable payslips, and portable skill passports.
        </p>

        {/* 1-Click Launch Buttons for Hackathon Judges */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl max-w-xl mx-auto shadow-2xl space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Select Live Hackathon Demo Role
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/worker"
              className="tap-target p-4 rounded-2xl bg-sdg-burgundy hover:bg-rose-900 active:scale-95 transition text-left flex flex-col justify-between shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">👷</span>
                <ArrowRight className="w-4 h-4 text-rose-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <span className="font-extrabold text-sm block">Launch Worker App</span>
                <span className="text-[11px] text-rose-200">
                  Voice TTS/STT, QR Check-in, Clear Payslip
                </span>
              </div>
            </Link>

            <Link
              href="/admin"
              className="tap-target p-4 rounded-2xl bg-indigo-700 hover:bg-indigo-800 active:scale-95 transition text-left flex flex-col justify-between shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📊</span>
                <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="mt-3">
                <span className="font-extrabold text-sm block">Launch Admin Portal</span>
                <span className="text-[11px] text-indigo-200">
                  Attendance, 2h SLA Escalation, Attrition Risk
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>3 Pre-Seeded Orgs</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>25 Indian Workers</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>4 Languages</span>
            </span>
          </div>
        </div>
      </section>

      {/* Cross-Industry Configuration Showcase */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-900 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Multi-Industry Adaptability via Single Typed Config
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Configured in <code className="text-rose-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">src/config/sectors.ts</code> to dynamically tailor hazards, shifts, and vocabulary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sector 1: Construction */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Construction</span>
              <h3 className="font-bold text-sm text-white mt-0.5">Sai Constructions</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Scaffolding safety, excavation cave-ins, electrical lines, rebar bar-bending skills.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Guntur, Andhra Pradesh</div>
          </div>

          {/* Sector 2: Hospital */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Healthcare</span>
              <h3 className="font-bold text-sm text-white mt-0.5">City Care Hospital</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Needle-stick hazards, biohazard spills, patient transfer ergonomics, CSSD sterilization.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Hyderabad, Telangana</div>
          </div>

          {/* Sector 3: College */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Higher Education</span>
              <h3 className="font-bold text-sm text-white mt-0.5">SRM Campus Facilities</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Science lab chemical fumes, high-voltage panels, hostel gas leaks, RO plant operations.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Chengalpattu, Tamil Nadu</div>
          </div>

          {/* Sector 4: Factory */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Industrial Plant</span>
              <h3 className="font-bold text-sm text-white mt-0.5">Manufacturing &amp; CNC</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Machine guarding pinch points, boiler steam leaks, forklift traffic, chemical drums.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Ready for Rollout</div>
          </div>
        </div>
      </section>

      {/* 7 Core Pillar Features */}
      <section className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-900 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white">Full Feature Implementation Matrix</h2>
          <p className="text-xs text-slate-400">All 7 pillars running end-to-end with zero mock gaps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>1. 2x Statutory Overtime</span>
            </div>
            <p className="text-xs text-slate-300">
              Auto-computes double hourly wage above 8h/day or 48h/week under Indian Factories Act Section 59.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Receipt className="w-4 h-4" />
              <span>2. Traceable Clear Payslip</span>
            </div>
            <p className="text-xs text-slate-300">
              Itemized base days, overtime pay, PF (12%) &amp; ESI (0.75%) deductions with full voice read-aloud.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Safety Voice &amp; 2h SLA Escalation</span>
            </div>
            <p className="text-xs text-slate-300">
              Worker speaks or types hazard; server triages severity; critical hazards escalate if unacknowledged &gt; 2h.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
              <MessageSquareHeart className="w-4 h-4" />
              <span>4. k-Anonymity Feedback (k ≥ 5)</span>
            </div>
            <p className="text-xs text-slate-300">
              Zero user identifiers stored; only aggregates revealed to supervisors once at least 5 submissions exist.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>5. Algorithmic Fatigue Alert</span>
            </div>
            <p className="text-xs text-slate-300">
              Flags workers exceeding &gt;10h/day, &gt;60h/week, &lt;8h rest gap, or 6+ consecutive working days.
            </p>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>6. Portable Skill Passport</span>
            </div>
            <p className="text-xs text-slate-300">
              Shareable public URL <code className="text-indigo-300">/passport/[id]</code> with verifiable QR code follows the worker to new employers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-400">FairShift • Progressive Web App for UN SDG 8 Decent Work</p>
        <p className="text-[11px] text-slate-600">Built with Next.js 14 (App Router) + TypeScript Strict + Tailwind CSS + Web Speech API + Supabase</p>
      </footer>
    </div>
  );
}
