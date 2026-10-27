import { describe, it, expect } from "vitest";
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

describe("1. Overtime Calculation Engine (Indian Labour Law Standards)", () => {
  it("calculates exact shift duration accounting for breaks", () => {
    // 08:00 to 17:00 (9 hours total) with 60 min break = 8.0 hours
    const start = "2026-10-01T08:00:00Z";
    const end = "2026-10-01T17:00:00Z";
    const hours = calculateShiftDurationHours(start, end, 60);
    expect(hours).toBe(8.0);
  });

  it("identifies overtime when a single shift exceeds 8 hours", () => {
    // 08:00 to 19:30 with 30 min break = 11.0 net hours (8 regular + 3 overtime)
    const result = calculateDailyShiftHours({
      shiftId: "shift-101",
      checkInTime: "2026-10-02T08:00:00Z",
      checkOutTime: "2026-10-02T19:30:00Z",
      breakMinutes: 30,
    });

    expect(result.totalHours).toBe(11.0);
    expect(result.regularHours).toBe(8.0);
    expect(result.overtimeHours).toBe(3.0);
  });

  it("converts hours exceeding 48h/week to overtime even if daily shifts are 8h", () => {
    // 7 consecutive days of 8-hour shifts = 56 total hours
    // First 6 days = 48 regular hours; Day 7 = 8 overtime hours
    const weekShifts = Array.from({ length: 7 }, (_, i) => ({
      shiftId: `shift-day-${i + 1}`,
      checkInTime: `2026-10-0${i + 1}T09:00:00Z`,
      checkOutTime: `2026-10-0${i + 1}T17:00:00Z`,
      breakMinutes: 0,
    }));

    const weekly = calculateWeeklyOvertime(weekShifts);
    expect(weekly.totalHours).toBe(56.0);
    expect(weekly.totalRegularHours).toBe(48.0);
    expect(weekly.totalOvertimeHours).toBe(8.0);
    expect(weekly.overtimeMultiplier).toBe(OVERTIME_MULTIPLIER);
  });
});

describe("2. Statutory Payroll & Wage Traceability", () => {
  it("computes itemized wages with 2x overtime rate and PF/ESI deductions", () => {
    const dailyWage = 800; // Rs. 800/day -> Rs. 100/hr -> OT rate = Rs. 200/hr
    const shifts = [
      // 8 regular hours
      {
        id: "s1",
        checkInTime: "2026-10-01T08:00:00Z",
        checkOutTime: "2026-10-01T16:00:00Z",
      },
      // 10 hours (8 regular + 2 OT)
      {
        id: "s2",
        checkInTime: "2026-10-02T08:00:00Z",
        checkOutTime: "2026-10-02T18:00:00Z",
      },
    ];

    const payslip = generateMonthlyPayslip("worker-1", "org-1", 10, 2026, dailyWage, shifts);

    expect(payslip.hourlyWage).toBe(100);
    expect(payslip.overtimeRate).toBe(200);
    expect(payslip.totalDaysWorked).toBe(2);
    expect(payslip.basePay).toBe(1600); // 2 * 800
    expect(payslip.totalOvertimeHours).toBe(2);
    expect(payslip.overtimePay).toBe(400); // 2 * 200
    expect(payslip.grossPay).toBe(2000); // 1600 + 400

    // Deductions: PF = 12% of base pay (1600 * 0.12 = 192)
    // ESI = 0.75% of gross pay (2000 * 0.0075 = 15)
    expect(payslip.deductions.pf).toBe(192);
    expect(payslip.deductions.esi).toBe(15);
    expect(payslip.netPay).toBe(1793); // 2000 - 192 - 15

    // Traceability test
    expect(payslip.shiftIds).toEqual(["s1", "s2"]);
    expect(payslip.traceableShifts).toHaveLength(2);
    expect(payslip.traceableShifts[1].earnedOvertime).toBe(400);
  });
});

describe("3. Fatigue & Worker Well-Being Matrix", () => {
  it("flags daily shift exceeding 10 hours", () => {
    const shifts = [
      {
        id: "s-long",
        checkInTime: "2026-10-05T07:00:00Z",
        checkOutTime: "2026-10-05T18:30:00Z", // 11.5 hours
      },
    ];

    const result = assessWorkerFatigue(shifts);
    expect(result.isFatigued).toBe(true);
    expect(result.alerts.some((a) => a.type === "EXCESSIVE_DAILY_HOURS")).toBe(true);
  });

  it("flags insufficient rest gap (< 8 hours) between shifts", () => {
    const shifts = [
      {
        id: "s-night",
        checkInTime: "2026-10-05T14:00:00Z",
        checkOutTime: "2026-10-05T23:00:00Z", // Ends at 23:00
      },
      {
        id: "s-early",
        checkInTime: "2026-10-06T05:00:00Z", // Starts at 05:00 (only 6 hours rest!)
        checkOutTime: "2026-10-06T13:00:00Z",
      },
    ];

    const result = assessWorkerFatigue(shifts);
    expect(result.isFatigued).toBe(true);
    const restAlert = result.alerts.find((a) => a.type === "INSUFFICIENT_REST_GAP");
    expect(restAlert).toBeDefined();
    expect(restAlert?.metricValue).toBe(6);
  });

  it("flags 6+ consecutive working days without rest", () => {
    const consecutiveShifts = Array.from({ length: 6 }, (_, i) => ({
      id: `s-consec-${i + 1}`,
      checkInTime: `2026-10-0${i + 1}T08:00:00Z`,
      checkOutTime: `2026-10-0${i + 1}T16:00:00Z`,
    }));

    const result = assessWorkerFatigue(consecutiveShifts);
    expect(result.isFatigued).toBe(true);
    expect(result.alerts.some((a) => a.type === "CONSECUTIVE_DAYS_WORKED")).toBe(true);
  });

  it("returns normal when working within legal limits", () => {
    const healthyShifts = [
      {
        id: "h1",
        checkInTime: "2026-10-01T08:00:00Z",
        checkOutTime: "2026-10-01T16:00:00Z",
      },
      {
        id: "h2",
        checkInTime: "2026-10-02T08:00:00Z",
        checkOutTime: "2026-10-02T16:00:00Z",
      },
    ];

    const result = assessWorkerFatigue(healthyShifts);
    expect(result.isFatigued).toBe(false);
    expect(result.riskLevel).toBe("normal");
    expect(result.alerts).toHaveLength(0);
  });
});

describe("4. Explainable Attrition & Retention Risk Engine", () => {
  it("calculates high attrition risk when attendance drops and overtime is heavy", () => {
    const risk = calculateAttritionRisk({
      workerId: "w-1",
      workerName: "Ramesh Kumar",
      recentAttendanceDays: 7, // Dropped from 12 (approx 42% drop)
      priorAttendanceDays: 12,
      monthlyOvertimeHours: 28, // Extreme OT
      fatigueAlertsCount: 2,
      hasCriticalFatigue: true,
      orgAverageFeedbackRating: 2.2, // Low site morale
      unresolvedHazardsCount: 2,
    });

    expect(risk.score).toBeGreaterThanOrEqual(70);
    expect(risk.riskLevel).toBe("severe");
    expect(risk.reasons.length).toBeGreaterThanOrEqual(4);
    expect(risk.recommendedAction).toContain("Immediate Intervention");
  });

  it("returns low risk for consistent worker with healthy cadence", () => {
    const risk = calculateAttritionRisk({
      workerId: "w-2",
      workerName: "Lakshmi Narayana",
      recentAttendanceDays: 12,
      priorAttendanceDays: 12,
      monthlyOvertimeHours: 4,
      fatigueAlertsCount: 0,
      hasCriticalFatigue: false,
      orgAverageFeedbackRating: 4.2,
      unresolvedHazardsCount: 0,
    });

    expect(risk.score).toBe(0);
    expect(risk.riskLevel).toBe("low");
    expect(risk.reasons).toContain("Consistent attendance and healthy work cadence.");
  });
});
