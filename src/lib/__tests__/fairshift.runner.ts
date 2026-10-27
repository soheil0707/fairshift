/**
 * FairShift - Pure Test Suite
 * Tests all core algorithms: Overtime, Payroll, Fatigue, Attrition Risk
 */

import assert from "node:assert";
import {
  calculateShiftDurationHours,
  calculateDailyShiftHours,
  calculateWeeklyOvertime,
  STANDARD_DAILY_HOURS,
  OVERTIME_MULTIPLIER,
} from "../overtime";
import { generateMonthlyPayslip, PF_RATE, ESI_RATE } from "../payroll";
import { assessWorkerFatigue, FATIGUE_THRESHOLDS } from "../fatigue";
import { calculateAttritionRisk } from "../attrition";

console.log("\n========================================================");
console.log("   FAIRSHIFT CORE ENGINE: AUTOMATED UNIT TEST SUITE    ");
console.log("========================================================\n");

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error("   ", err);
    failed++;
  }
}

// ----------------------------------------------------------------------------
// 1. OVERTIME CALCULATION ENGINE
// ----------------------------------------------------------------------------
console.log("\n[TEST GROUP 1: Indian Labour Law Overtime Engine]");

runTest("Calculates exact shift duration minus break intervals", () => {
  const duration = calculateShiftDurationHours("2026-10-01T08:00:00Z", "2026-10-01T17:00:00Z", 60);
  assert.strictEqual(duration, 8.0, "9h shift minus 60m break must equal 8.0h");
});

runTest("Allocates daily hours exceeding 8h to 2.0x overtime", () => {
  const result = calculateDailyShiftHours({
    shiftId: "shift-ot-1",
    checkInTime: "2026-10-02T08:00:00Z",
    checkOutTime: "2026-10-02T19:30:00Z",
    breakMinutes: 30, // 11 net hours
  });
  assert.strictEqual(result.totalHours, 11.0);
  assert.strictEqual(result.regularHours, 8.0);
  assert.strictEqual(result.overtimeHours, 3.0);
});

runTest("Converts cumulative weekly hours > 48h to overtime", () => {
  const weekShifts = Array.from({ length: 7 }, (_, i) => ({
    shiftId: `s-${i + 1}`,
    checkInTime: `2026-10-0${i + 1}T08:00:00Z`,
    checkOutTime: `2026-10-0${i + 1}T16:00:00Z`,
    breakMinutes: 0,
  }));
  const weekly = calculateWeeklyOvertime(weekShifts);
  assert.strictEqual(weekly.totalHours, 56.0);
  assert.strictEqual(weekly.totalRegularHours, 48.0);
  assert.strictEqual(weekly.totalOvertimeHours, 8.0);
  assert.strictEqual(weekly.overtimeMultiplier, 2.0);
});

// ----------------------------------------------------------------------------
// 2. STATUTORY PAYROLL & SHIFT TRACEABILITY
// ----------------------------------------------------------------------------
console.log("\n[TEST GROUP 2: Statutory Payroll & Wage Traceability]");

runTest("Computes base, 2x OT, PF, ESI, net pay with shift traceability", () => {
  const dailyWage = 800; // Hourly rate: Rs. 100/h; Overtime rate: Rs. 200/h
  const shifts = [
    { id: "s1", checkInTime: "2026-10-01T08:00:00Z", checkOutTime: "2026-10-01T16:00:00Z" }, // 8h
    { id: "s2", checkInTime: "2026-10-02T08:00:00Z", checkOutTime: "2026-10-02T18:00:00Z" }, // 10h (8 reg + 2 OT)
  ];

  const slip = generateMonthlyPayslip("w-test", "org-1", 10, 2026, dailyWage, shifts);

  assert.strictEqual(slip.hourlyWage, 100);
  assert.strictEqual(slip.overtimeRate, 200);
  assert.strictEqual(slip.totalDaysWorked, 2);
  assert.strictEqual(slip.basePay, 1600); // 2 * 800
  assert.strictEqual(slip.totalOvertimeHours, 2);
  assert.strictEqual(slip.overtimePay, 400); // 2h * 200
  assert.strictEqual(slip.grossPay, 2000); // 1600 + 400

  // Deductions: PF = 12% of 1600 = 192; ESI = 0.75% of 2000 = 15
  assert.strictEqual(slip.deductions.pf, 192);
  assert.strictEqual(slip.deductions.esi, 15);
  assert.strictEqual(slip.netPay, 1793); // 2000 - 192 - 15

  // Traceability: ensures each shift contributes to audit record
  assert.deepStrictEqual(slip.shiftIds, ["s1", "s2"]);
  assert.strictEqual(slip.traceableShifts.length, 2);
  assert.strictEqual(slip.traceableShifts[1].earnedOvertime, 400);
});

// ----------------------------------------------------------------------------
// 3. FATIGUE DETECTION MATRIX
// ----------------------------------------------------------------------------
console.log("\n[TEST GROUP 3: Fatigue & Worker Well-Being Matrix]");

runTest("Flags single shift exceeding 10 hours", () => {
  const shifts = [{ id: "s-long", checkInTime: "2026-10-05T07:00:00Z", checkOutTime: "2026-10-05T18:00:00Z" }];
  const assessment = assessWorkerFatigue(shifts);
  assert.strictEqual(assessment.isFatigued, true);
  assert.ok(assessment.alerts.some((a) => a.type === "EXCESSIVE_DAILY_HOURS"));
});

runTest("Flags insufficient rest gap (< 8 hours) between shifts", () => {
  const shifts = [
    { id: "s-late", checkInTime: "2026-10-05T14:00:00Z", checkOutTime: "2026-10-05T23:00:00Z" },
    { id: "s-early", checkInTime: "2026-10-06T05:00:00Z", checkOutTime: "2026-10-06T13:00:00Z" }, // 6h rest
  ];
  const assessment = assessWorkerFatigue(shifts);
  assert.strictEqual(assessment.isFatigued, true);
  const restAlert = assessment.alerts.find((a) => a.type === "INSUFFICIENT_REST_GAP");
  assert.ok(restAlert);
  assert.strictEqual(restAlert?.metricValue, 6.0);
});

runTest("Flags 6+ consecutive working days without rest window", () => {
  const shifts = Array.from({ length: 6 }, (_, i) => ({
    id: `c-${i + 1}`,
    checkInTime: `2026-10-0${i + 1}T08:00:00Z`,
    checkOutTime: `2026-10-0${i + 1}T16:00:00Z`,
  }));
  const assessment = assessWorkerFatigue(shifts);
  assert.strictEqual(assessment.isFatigued, true);
  assert.ok(assessment.alerts.some((a) => a.type === "CONSECUTIVE_DAYS_WORKED"));
});

runTest("Validates normal status when shifts comply with labour limits", () => {
  const shifts = [
    { id: "h1", checkInTime: "2026-10-01T08:00:00Z", checkOutTime: "2026-10-01T16:00:00Z" },
    { id: "h2", checkInTime: "2026-10-02T08:00:00Z", checkOutTime: "2026-10-02T16:00:00Z" },
  ];
  const assessment = assessWorkerFatigue(shifts);
  assert.strictEqual(assessment.isFatigued, false);
  assert.strictEqual(assessment.riskLevel, "normal");
});

// ----------------------------------------------------------------------------
// 4. EXPLAINABLE ATTRITION RISK ENGINE
// ----------------------------------------------------------------------------
console.log("\n[TEST GROUP 4: Explainable Attrition & Retention Engine]");

runTest("Calculates severe attrition risk when attendance drops and overtime is heavy", () => {
  const risk = calculateAttritionRisk({
    workerId: "w-ramesh",
    workerName: "Ramesh Kumar",
    recentAttendanceDays: 7, // 42% drop
    priorAttendanceDays: 12,
    monthlyOvertimeHours: 28,
    fatigueAlertsCount: 2,
    hasCriticalFatigue: true,
    orgAverageFeedbackRating: 2.2,
    unresolvedHazardsCount: 2,
  });

  assert.ok(risk.score >= 70, `Score should be >= 70, received ${risk.score}`);
  assert.strictEqual(risk.riskLevel, "severe");
  assert.ok(risk.reasons.length >= 4, "Must list all explainable factors");
  assert.ok(risk.recommendedAction.includes("Immediate Intervention"));
});

runTest("Returns zero score and low risk for steady worker", () => {
  const risk = calculateAttritionRisk({
    workerId: "w-lakshmi",
    workerName: "Lakshmi Narayana",
    recentAttendanceDays: 12,
    priorAttendanceDays: 12,
    monthlyOvertimeHours: 2,
    fatigueAlertsCount: 0,
    hasCriticalFatigue: false,
    orgAverageFeedbackRating: 4.2,
    unresolvedHazardsCount: 0,
  });

  assert.strictEqual(risk.score, 0);
  assert.strictEqual(risk.riskLevel, "low");
  assert.ok(risk.reasons.includes("Consistent attendance and healthy work cadence."));
});

console.log("\n--------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
