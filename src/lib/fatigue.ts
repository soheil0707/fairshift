/**
 * FairShift - Fatigue & Worker Well-Being Matrix
 * UN SDG Target 8.8 (Safe & Secure Working Environments)
 *
 * Detection Rules:
 * 1. > 10 hours worked in a single day
 * 2. > 60 hours worked in a rolling 7-day week
 * 3. < 8 hours rest interval between the end of one shift and start of the next
 * 4. 6+ consecutive days worked without a 24-hour rest window
 */

import { calculateShiftDurationHours } from "./overtime";

export type FatigueFlagType =
  | "EXCESSIVE_DAILY_HOURS"
  | "EXCESSIVE_WEEKLY_HOURS"
  | "INSUFFICIENT_REST_GAP"
  | "CONSECUTIVE_DAYS_WORKED";

export interface FatigueAlert {
  type: FatigueFlagType;
  severity: "warning" | "critical";
  message: string;
  metricValue: number;
  threshold: number;
  shiftId?: string;
  date: string;
}

export interface FatigueAssessmentResult {
  isFatigued: boolean;
  riskLevel: "normal" | "moderate" | "high" | "critical";
  alerts: FatigueAlert[];
  summary: string;
}

export interface ShiftForFatigue {
  id: string;
  checkInTime: string; // ISO string
  checkOutTime: string; // ISO string
  breakMinutes?: number;
}

export const FATIGUE_THRESHOLDS = {
  MAX_DAILY_HOURS: 10.0,
  MAX_WEEKLY_HOURS: 60.0,
  MIN_REST_HOURS: 8.0,
  MAX_CONSECUTIVE_DAYS: 6,
};

/**
 * Assesses worker fatigue across historical shift records.
 */
export function assessWorkerFatigue(
  shifts: ShiftForFatigue[]
): FatigueAssessmentResult {
  if (!shifts || shifts.length === 0) {
    return {
      isFatigued: false,
      riskLevel: "normal",
      alerts: [],
      summary: "No fatigue indicators detected.",
    };
  }

  // Sort chronological
  const sorted = [...shifts].sort(
    (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  const alerts: FatigueAlert[] = [];
  const dailyHoursMap = new Map<string, number>();

  // 1. Daily Hours & Rest Gap Check
  for (let i = 0; i < sorted.length; i++) {
    const shift = sorted[i];
    const duration = calculateShiftDurationHours(
      shift.checkInTime,
      shift.checkOutTime,
      shift.breakMinutes ?? 0
    );

    const dateKey = new Date(shift.checkInTime).toISOString().split("T")[0];
    const existing = dailyHoursMap.get(dateKey) || 0;
    const totalDayHours = existing + duration;
    dailyHoursMap.set(dateKey, totalDayHours);

    // Check Daily Limit (> 10h)
    if (totalDayHours > FATIGUE_THRESHOLDS.MAX_DAILY_HOURS) {
      alerts.push({
        type: "EXCESSIVE_DAILY_HOURS",
        severity: totalDayHours >= 12.0 ? "critical" : "warning",
        message: `Worked ${totalDayHours.toFixed(1)}h on ${dateKey} (limit is ${FATIGUE_THRESHOLDS.MAX_DAILY_HOURS}h).`,
        metricValue: totalDayHours,
        threshold: FATIGUE_THRESHOLDS.MAX_DAILY_HOURS,
        shiftId: shift.id,
        date: dateKey,
      });
    }

    // Check Rest Gap between shifts (< 8h)
    if (i < sorted.length - 1) {
      const nextShift = sorted[i + 1];
      const shiftEnd = new Date(shift.checkOutTime).getTime();
      const nextStart = new Date(nextShift.checkInTime).getTime();

      if (nextStart > shiftEnd) {
        const restGapHours = (nextStart - shiftEnd) / (1000 * 60 * 60);
        if (restGapHours < FATIGUE_THRESHOLDS.MIN_REST_HOURS) {
          alerts.push({
            type: "INSUFFICIENT_REST_GAP",
            severity: restGapHours < 5.0 ? "critical" : "warning",
            message: `Only ${restGapHours.toFixed(1)}h rest between shifts on ${dateKey} (minimum required is ${FATIGUE_THRESHOLDS.MIN_REST_HOURS}h).`,
            metricValue: Math.round(restGapHours * 10) / 10,
            threshold: FATIGUE_THRESHOLDS.MIN_REST_HOURS,
            shiftId: nextShift.id,
            date: dateKey,
          });
        }
      }
    }
  }

  // 2. Rolling 7-day Weekly Hours Check (> 60h)
  const uniqueDates = Array.from(dailyHoursMap.keys()).sort();
  for (let i = 0; i < uniqueDates.length; i++) {
    const windowStart = new Date(uniqueDates[i]);
    const windowEnd = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    let rollingHours = 0;
    for (const [dateStr, hours] of dailyHoursMap.entries()) {
      const d = new Date(dateStr);
      if (d >= windowStart && d < windowEnd) {
        rollingHours += hours;
      }
    }

    if (rollingHours > FATIGUE_THRESHOLDS.MAX_WEEKLY_HOURS) {
      alerts.push({
        type: "EXCESSIVE_WEEKLY_HOURS",
        severity: rollingHours >= 70.0 ? "critical" : "warning",
        message: `Logged ${rollingHours.toFixed(1)}h in a 7-day span from ${uniqueDates[i]} (limit is ${FATIGUE_THRESHOLDS.MAX_WEEKLY_HOURS}h).`,
        metricValue: Math.round(rollingHours * 10) / 10,
        threshold: FATIGUE_THRESHOLDS.MAX_WEEKLY_HOURS,
        date: uniqueDates[i],
      });
      break; // Record first detected weekly violation window
    }
  }

  // 3. Consecutive Days Worked (6+ days)
  let consecutiveCount = 0;
  let lastDate: Date | null = null;

  for (const dateStr of uniqueDates) {
    const curDate = new Date(dateStr);
    if (!lastDate) {
      consecutiveCount = 1;
    } else {
      const diffDays = Math.round(
        (curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
    }

    lastDate = curDate;

    if (consecutiveCount >= FATIGUE_THRESHOLDS.MAX_CONSECUTIVE_DAYS) {
      alerts.push({
        type: "CONSECUTIVE_DAYS_WORKED",
        severity: consecutiveCount >= 8 ? "critical" : "warning",
        message: `Worked ${consecutiveCount} consecutive days without a mandatory 24-hour weekly rest day.`,
        metricValue: consecutiveCount,
        threshold: FATIGUE_THRESHOLDS.MAX_CONSECUTIVE_DAYS,
        date: dateStr,
      });
      break;
    }
  }

  // Determine overall risk level
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  let riskLevel: "normal" | "moderate" | "high" | "critical" = "normal";

  if (criticalCount >= 2 || alerts.length >= 4) {
    riskLevel = "critical";
  } else if (criticalCount === 1 || alerts.length >= 2) {
    riskLevel = "high";
  } else if (alerts.length === 1) {
    riskLevel = "moderate";
  }

  return {
    isFatigued: alerts.length > 0,
    riskLevel,
    alerts,
    summary:
      alerts.length > 0
        ? `${alerts.length} fatigue risk trigger(s) detected. Highest priority: ${alerts[0].message}`
        : "Healthy work hours and rest intervals maintained.",
  };
}
