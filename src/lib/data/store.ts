"use client";

import {
  Organization,
  WorkerProfile,
  Shift,
  HazardReport,
  AnonymousFeedback,
  SkillPassport,
} from "./types";
import {
  SEED_ORGANIZATIONS,
  SEED_WORKERS,
  SEED_SHIFTS,
  SEED_HAZARDS,
  SEED_ANONYMOUS_FEEDBACK,
  SEED_SKILL_PASSPORTS,
} from "./seedData";
import { generateMonthlyPayslip, PayslipBreakdown } from "../payroll";
import { assessWorkerFatigue, FatigueAssessmentResult } from "../fatigue";
import { calculateAttritionRisk, AttritionRiskResult } from "../attrition";
import { calculateDailyShiftHours } from "../overtime";

const STORAGE_KEYS = {
  SHIFTS: "fairshift_shifts_v1",
  HAZARDS: "fairshift_hazards_v1",
  FEEDBACK: "fairshift_feedback_v1",
  CURRENT_WORKER: "fairshift_active_worker_id",
  CURRENT_ORG: "fairshift_active_org_id",
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to storage:`, err);
  }
}

// In-memory runtime store with localStorage backup
let runtimeShifts: Shift[] = SEED_SHIFTS;
let runtimeHazards: HazardReport[] = SEED_HAZARDS;
let runtimeFeedback: AnonymousFeedback[] = SEED_ANONYMOUS_FEEDBACK;

export function initializeStore(): void {
  if (typeof window === "undefined") return;
  runtimeShifts = getStorageItem<Shift[]>(STORAGE_KEYS.SHIFTS, SEED_SHIFTS);
  runtimeHazards = getStorageItem<HazardReport[]>(STORAGE_KEYS.HAZARDS, SEED_HAZARDS);
  runtimeFeedback = getStorageItem<AnonymousFeedback[]>(STORAGE_KEYS.FEEDBACK, SEED_ANONYMOUS_FEEDBACK);
}

export function resetDemoData(): void {
  runtimeShifts = [...SEED_SHIFTS];
  runtimeHazards = [...SEED_HAZARDS];
  runtimeFeedback = [...SEED_ANONYMOUS_FEEDBACK];
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.HAZARDS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
  }
}

/* ============================================================================
 * ORGANIZATIONS & WORKERS
 * ============================================================================ */
export function getOrganizations(): Organization[] {
  return SEED_ORGANIZATIONS;
}

export function getOrganizationById(orgId: string): Organization | undefined {
  return SEED_ORGANIZATIONS.find((o) => o.id === orgId) || SEED_ORGANIZATIONS[0];
}

export function getWorkers(orgId?: string): WorkerProfile[] {
  if (!orgId) return SEED_WORKERS;
  return SEED_WORKERS.filter((w) => w.orgId === orgId);
}

export function getWorkerById(workerId: string): WorkerProfile | undefined {
  return SEED_WORKERS.find((w) => w.id === workerId) || SEED_WORKERS[0];
}

/* ============================================================================
 * SHIFTS & ATTENDANCE
 * ============================================================================ */
export function getActiveShift(workerId: string): Shift | undefined {
  return runtimeShifts.find(
    (s) => s.workerId === workerId && s.status === "in_progress"
  );
}

export function getShiftsForWorker(workerId: string): Shift[] {
  return runtimeShifts
    .filter((s) => s.workerId === workerId)
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
}

export function checkInWorker(
  workerId: string,
  orgId: string,
  method: "qr_code" | "geofence" | "manual_admin",
  lat?: number,
  lng?: number
): Shift {
  // Check if already in progress
  const existing = getActiveShift(workerId);
  if (existing) return existing;

  const newShift: Shift = {
    id: `shift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    workerId,
    orgId,
    checkInTime: new Date().toISOString(),
    checkInMethod: method,
    checkInLat: lat,
    checkInLng: lng,
    regularHours: 0,
    overtimeHours: 0,
    status: "in_progress",
  };

  runtimeShifts = [newShift, ...runtimeShifts];
  setStorageItem(STORAGE_KEYS.SHIFTS, runtimeShifts);
  return newShift;
}

export function checkOutWorker(shiftId: string): Shift | undefined {
  const index = runtimeShifts.findIndex((s) => s.id === shiftId);
  if (index === -1) return undefined;

  const shift = runtimeShifts[index];
  const checkOutTime = new Date().toISOString();

  const dailyCalc = calculateDailyShiftHours({
    shiftId: shift.id,
    checkInTime: shift.checkInTime,
    checkOutTime,
    breakMinutes: 0,
  });

  const updated: Shift = {
    ...shift,
    checkOutTime,
    regularHours: dailyCalc.regularHours,
    overtimeHours: dailyCalc.overtimeHours,
    status: "completed",
  };

  runtimeShifts[index] = updated;
  setStorageItem(STORAGE_KEYS.SHIFTS, runtimeShifts);
  return updated;
}

/* ============================================================================
 * PAYSLIP GENERATION
 * ============================================================================ */
export function getMonthlyPayslip(
  workerId: string,
  month: number = 10,
  year: number = 2026
): PayslipBreakdown {
  const worker = getWorkerById(workerId) || SEED_WORKERS[0];
  const workerShifts = getShiftsForWorker(workerId).filter((s) => {
    if (s.status !== "completed" || !s.checkOutTime) return false;
    const d = new Date(s.checkInTime);
    return d.getUTCMonth() + 1 === month && d.getUTCFullYear() === year;
  });

  return generateMonthlyPayslip(
    worker.id,
    worker.orgId,
    month,
    year,
    worker.dailyWage,
    workerShifts.map((s) => ({
      id: s.id,
      checkInTime: s.checkInTime,
      checkOutTime: s.checkOutTime!,
    }))
  );
}

/* ============================================================================
 * SAFETY HAZARDS & 2-HOUR SLA ESCALATION
 * ============================================================================ */
export function getHazards(orgId?: string): HazardReport[] {
  let list = orgId ? runtimeHazards.filter((h) => h.orgId === orgId) : runtimeHazards;
  return [...list].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );
}

export function reportHazard(input: {
  workerId: string;
  orgId: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  descriptionRaw: string;
  descriptionEn: string;
  photoUrl?: string;
}): HazardReport {
  const newHazard: HazardReport = {
    id: `haz-${Date.now()}`,
    workerId: input.workerId,
    orgId: input.orgId,
    category: input.category,
    severity: input.severity,
    status: "reported",
    descriptionRaw: input.descriptionRaw,
    descriptionEn: input.descriptionEn,
    photoUrl: input.photoUrl,
    reportedAt: new Date().toISOString(),
  };

  runtimeHazards = [newHazard, ...runtimeHazards];
  setStorageItem(STORAGE_KEYS.HAZARDS, runtimeHazards);
  return newHazard;
}

export function updateHazardStatus(
  hazardId: string,
  status: "acknowledged" | "fixed",
  actionNotes?: string
): HazardReport | undefined {
  const index = runtimeHazards.findIndex((h) => h.id === hazardId);
  if (index === -1) return undefined;

  const current = runtimeHazards[index];
  const now = new Date().toISOString();

  const updated: HazardReport = {
    ...current,
    status,
    acknowledgedAt: status === "acknowledged" ? now : current.acknowledgedAt || now,
    fixedAt: status === "fixed" ? now : current.fixedAt,
    actionNotes: actionNotes || current.actionNotes,
  };

  runtimeHazards[index] = updated;
  setStorageItem(STORAGE_KEYS.HAZARDS, runtimeHazards);
  return updated;
}

/**
 * Flags critical hazards that are still in 'reported' status after 2 hours.
 */
export function isHazardEscalated(hazard: HazardReport): boolean {
  if (hazard.severity !== "critical" || hazard.status !== "reported") {
    return false;
  }
  const ageMs = Date.now() - new Date(hazard.reportedAt).getTime();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  return ageMs >= twoHoursMs;
}

/* ============================================================================
 * ANONYMOUS FEEDBACK & K-ANONYMITY (k >= 5)
 * ============================================================================ */
export function submitAnonymousFeedback(input: {
  orgId: string;
  ratingManager: number;
  ratingSafety: number;
  ratingPay: number;
  ratingWorkload: number;
  comment?: string;
}): AnonymousFeedback {
  // STRICT SECURITY & PRIVACY GUARANTEE: NO WORKER ID OR USER ID STORED
  const feedback: AnonymousFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    orgId: input.orgId,
    ratingManager: input.ratingManager,
    ratingSafety: input.ratingSafety,
    ratingPay: input.ratingPay,
    ratingWorkload: input.ratingWorkload,
    comment: input.comment?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };

  runtimeFeedback = [feedback, ...runtimeFeedback];
  setStorageItem(STORAGE_KEYS.FEEDBACK, runtimeFeedback);
  return feedback;
}

export interface FeedbackAggregation {
  orgId: string;
  totalResponses: number;
  kAnonymityMet: boolean; // True ONLY if >= 5 responses!
  minResponsesRequired: number; // 5
  averageManager: number;
  averageSafety: number;
  averagePay: number;
  averageWorkload: number;
  overallScore: number;
  recentComments: string[];
}

export function getAnonymousFeedbackSummary(orgId: string): FeedbackAggregation {
  const orgFeedback = runtimeFeedback.filter((f) => f.orgId === orgId);
  const total = orgFeedback.length;
  const K_ANONYMITY_THRESHOLD = 5;

  if (total < K_ANONYMITY_THRESHOLD) {
    return {
      orgId,
      totalResponses: total,
      kAnonymityMet: false,
      minResponsesRequired: K_ANONYMITY_THRESHOLD,
      averageManager: 0,
      averageSafety: 0,
      averagePay: 0,
      averageWorkload: 0,
      overallScore: 0,
      recentComments: [],
    };
  }

  const avgManager = orgFeedback.reduce((sum, f) => sum + f.ratingManager, 0) / total;
  const avgSafety = orgFeedback.reduce((sum, f) => sum + f.ratingSafety, 0) / total;
  const avgPay = orgFeedback.reduce((sum, f) => sum + f.ratingPay, 0) / total;
  const avgWorkload = orgFeedback.reduce((sum, f) => sum + f.ratingWorkload, 0) / total;
  const overall = (avgManager + avgSafety + avgPay + avgWorkload) / 4;

  const comments = orgFeedback
    .map((f) => f.comment)
    .filter((c): c is string => Boolean(c && c.length > 0))
    .slice(0, 10);

  return {
    orgId,
    totalResponses: total,
    kAnonymityMet: true,
    minResponsesRequired: K_ANONYMITY_THRESHOLD,
    averageManager: Math.round(avgManager * 10) / 10,
    averageSafety: Math.round(avgSafety * 10) / 10,
    averagePay: Math.round(avgPay * 10) / 10,
    averageWorkload: Math.round(avgWorkload * 10) / 10,
    overallScore: Math.round(overall * 10) / 10,
    recentComments: comments,
  };
}

/* ============================================================================
 * SKILL PASSPORTS
 * ============================================================================ */
export function getSkillPassport(workerIdOrCode: string): SkillPassport | undefined {
  // Check by workerId
  if (SEED_SKILL_PASSPORTS[workerIdOrCode]) {
    return SEED_SKILL_PASSPORTS[workerIdOrCode];
  }
  // Check by passportCode
  const passport = Object.values(SEED_SKILL_PASSPORTS).find(
    (p) => p.passportCode.toLowerCase() === workerIdOrCode.toLowerCase()
  );
  if (passport) return passport;

  // Synthesize dynamic passport for other workers
  const worker = getWorkerById(workerIdOrCode);
  if (worker) {
    const org = getOrganizationById(worker.orgId);
    return {
      id: `pass-${worker.id}`,
      workerId: worker.id,
      passportCode: `FS-PASS-${worker.fullName.toUpperCase().replace(/\s+/g, "")}-${worker.id.slice(-4)}`,
      totalVerifiedHours: 640,
      createdAt: worker.createdAt,
      entries: [
        {
          id: `se-${worker.id}-1`,
          passportId: `pass-${worker.id}`,
          skillName: worker.trade,
          sector: org?.sector || "construction",
          issuingOrgName: org?.name || "FairShift Partner",
          hoursLogged: 640,
          certificationName: "Standard Competency & Site Safety Verified",
          verified: true,
          verifiedAt: "2026-09-01T10:00:00Z",
        },
      ],
    };
  }

  return SEED_SKILL_PASSPORTS["w-ramesh"];
}

/* ============================================================================
 * ADMIN METRICS & ANALYTICS
 * ============================================================================ */
export interface AdminMetrics {
  org: Organization;
  totalWorkers: number;
  todayActiveCheckIns: number;
  todayCompletedShifts: number;
  totalMonthHours: number;
  totalMonthOvertimeHours: number;
  openHazardsCount: number;
  escalatedHazardsCount: number;
  hazardsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  feedbackSummary: FeedbackAggregation;
  fatiguedWorkers: Array<{
    worker: WorkerProfile;
    fatigue: FatigueAssessmentResult;
  }>;
  attritionRisks: AttritionRiskResult[];
  overtimeTrend: Array<{
    date: string;
    regularHours: number;
    overtimeHours: number;
  }>;
}

export function getAdminMetrics(orgId: string): AdminMetrics {
  const org = getOrganizationById(orgId) || SEED_ORGANIZATIONS[0];
  const workers = getWorkers(org.id);
  const orgShifts = runtimeShifts.filter((s) => s.orgId === org.id);
  const orgHazards = runtimeHazards.filter((h) => h.orgId === org.id);
  const feedbackSummary = getAnonymousFeedbackSummary(org.id);

  // Today's attendance
  const todayKey = new Date().toISOString().split("T")[0];
  const todayShifts = orgShifts.filter((s) => s.checkInTime.startsWith(todayKey));
  const activeCheckIns = orgShifts.filter((s) => s.status === "in_progress").length;
  const completedShifts = todayShifts.filter((s) => s.status === "completed").length;

  // Monthly hours
  let totalHours = 0;
  let totalOvertimeHours = 0;
  orgShifts.forEach((s) => {
    totalHours += (s.regularHours || 0) + (s.overtimeHours || 0);
    totalOvertimeHours += s.overtimeHours || 0;
  });

  // Open Hazards & Escalations
  const openHazards = orgHazards.filter((h) => h.status !== "fixed");
  const escalatedHazards = orgHazards.filter(isHazardEscalated);

  const hazardsBySeverity = {
    critical: openHazards.filter((h) => h.severity === "critical").length,
    high: openHazards.filter((h) => h.severity === "high").length,
    medium: openHazards.filter((h) => h.severity === "medium").length,
    low: openHazards.filter((h) => h.severity === "low").length,
  };

  // Fatigued Workers
  const fatiguedWorkers: Array<{
    worker: WorkerProfile;
    fatigue: FatigueAssessmentResult;
  }> = [];

  // Attrition Risks
  const attritionRisks: AttritionRiskResult[] = [];

  workers.forEach((worker) => {
    const workerShifts = orgShifts.filter((s) => s.workerId === worker.id);
    const fatigue = assessWorkerFatigue(
      workerShifts.map((s) => ({
        id: s.id,
        checkInTime: s.checkInTime,
        checkOutTime: s.checkOutTime || new Date().toISOString(),
      }))
    );

    if (fatigue.isFatigued) {
      fatiguedWorkers.push({ worker, fatigue });
    }

    // Recent 14 vs prior 14 days
    const recent = workerShifts.filter((s) => {
      const d = new Date(s.checkInTime).getUTCDate();
      return d >= 13 && d <= 26;
    }).length;

    const prior = workerShifts.filter((s) => {
      const d = new Date(s.checkInTime).getUTCDate();
      return d >= 1 && d <= 12;
    }).length;

    let workerMonthOt = 0;
    workerShifts.forEach((s) => {
      workerMonthOt += s.overtimeHours || 0;
    });

    const unresolvedHazards = orgHazards.filter(
      (h) => h.workerId === worker.id && h.status !== "fixed"
    ).length;

    const risk = calculateAttritionRisk({
      workerId: worker.id,
      workerName: worker.fullName,
      recentAttendanceDays: recent,
      priorAttendanceDays: Math.max(1, prior),
      monthlyOvertimeHours: workerMonthOt,
      fatigueAlertsCount: fatigue.alerts.length,
      hasCriticalFatigue: fatigue.riskLevel === "critical",
      orgAverageFeedbackRating: feedbackSummary.kAnonymityMet ? feedbackSummary.overallScore : 3.8,
      unresolvedHazardsCount: unresolvedHazards,
    });

    attritionRisks.push(risk);
  });

  // Sort attrition risks descending
  attritionRisks.sort((a, b) => b.score - a.score);

  // Overtime trend (last 10 days of October)
  const trendMap = new Map<string, { regular: number; overtime: number }>();
  for (let day = 17; day <= 26; day++) {
    const dayStr = `Oct ${day}`;
    trendMap.set(dayStr, { regular: 0, overtime: 0 });
  }

  orgShifts.forEach((s) => {
    const d = new Date(s.checkInTime);
    const day = d.getUTCDate();
    if (day >= 17 && day <= 26) {
      const dayStr = `Oct ${day}`;
      const entry = trendMap.get(dayStr) || { regular: 0, overtime: 0 };
      entry.regular += s.regularHours || 0;
      entry.overtime += s.overtimeHours || 0;
      trendMap.set(dayStr, entry);
    }
  });

  const overtimeTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
    date,
    regularHours: Math.round(val.regular),
    overtimeHours: Math.round(val.overtime),
  }));

  return {
    org,
    totalWorkers: workers.length,
    todayActiveCheckIns: activeCheckIns,
    todayCompletedShifts: completedShifts,
    totalMonthHours: Math.round(totalHours),
    totalMonthOvertimeHours: Math.round(totalOvertimeHours),
    openHazardsCount: openHazards.length,
    escalatedHazardsCount: escalatedHazards.length,
    hazardsBySeverity,
    feedbackSummary,
    fatiguedWorkers,
    attritionRisks,
    overtimeTrend,
  };
}
