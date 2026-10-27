/**
 * FairShift - Explainable Attrition & Retention Risk Engine
 *
 * Computes an explainable 0–100 risk score per worker using deterministic rules:
 * 1. Falling attendance (drop in recent 14-day attendance vs prior 14-day baseline)
 * 2. High overtime (>15h-20h OT indicates burnout risk)
 * 3. Chronic fatigue triggers (active fatigue alerts)
 * 4. Low team sentiment / satisfaction (org aggregate feedback below 3.0)
 * 5. Unresolved safety complaints logged by the worker
 */

export interface WorkerAttritionInput {
  workerId: string;
  workerName: string;
  recentAttendanceDays: number; // Last 14 days
  priorAttendanceDays: number; // Previous 14-day baseline
  monthlyOvertimeHours: number;
  fatigueAlertsCount: number;
  hasCriticalFatigue: boolean;
  orgAverageFeedbackRating: number; // 1.0 to 5.0
  unresolvedHazardsCount: number;
}

export interface RiskFactorItem {
  factor: string;
  pointsAdded: number;
  explanation: string;
}

export interface AttritionRiskResult {
  workerId: string;
  workerName: string;
  score: number; // 0 - 100
  riskLevel: "low" | "moderate" | "high" | "severe";
  factors: RiskFactorItem[];
  reasons: string[];
  recommendedAction: string;
}

export function calculateAttritionRisk(
  input: WorkerAttritionInput
): AttritionRiskResult {
  const factors: RiskFactorItem[] = [];

  // 1. Attendance Drop Analysis
  if (input.priorAttendanceDays > 0) {
    const attendanceChangeRatio =
      (input.priorAttendanceDays - input.recentAttendanceDays) /
      input.priorAttendanceDays;

    if (attendanceChangeRatio >= 0.35) {
      factors.push({
        factor: "Severe Attendance Drop",
        pointsAdded: 30,
        explanation: `Attendance declined by ${Math.round(attendanceChangeRatio * 100)}% over the last fortnight (${input.recentAttendanceDays} days vs baseline ${input.priorAttendanceDays} days).`,
      });
    } else if (attendanceChangeRatio >= 0.20) {
      factors.push({
        factor: "Noticeable Attendance Decline",
        pointsAdded: 18,
        explanation: `Attendance dipped by ${Math.round(attendanceChangeRatio * 100)}% over the last 14 days.`,
      });
    }
  }

  // 2. High Overtime / Burnout
  if (input.monthlyOvertimeHours >= 25) {
    factors.push({
      factor: "Extreme Overtime Load",
      pointsAdded: 25,
      explanation: `Logged ${input.monthlyOvertimeHours.toFixed(1)}h overtime this month, increasing exhaustion and quit propensity.`,
    });
  } else if (input.monthlyOvertimeHours >= 15) {
    factors.push({
      factor: "Elevated Overtime Hours",
      pointsAdded: 15,
      explanation: `Accumulated ${input.monthlyOvertimeHours.toFixed(1)}h overtime, approaching burnout threshold.`,
    });
  }

  // 3. Chronic Fatigue Alerts
  if (input.hasCriticalFatigue) {
    factors.push({
      factor: "Critical Fatigue Flag",
      pointsAdded: 25,
      explanation: "Active critical fatigue alert flagged (<5h rest interval or >12h shift).",
    });
  } else if (input.fatigueAlertsCount > 0) {
    factors.push({
      factor: "Repeated Fatigue Warnings",
      pointsAdded: Math.min(20, input.fatigueAlertsCount * 10),
      explanation: `${input.fatigueAlertsCount} fatigue warning(s) logged on attendance records.`,
    });
  }

  // 4. Low Team Feedback / Discontent in Org
  if (input.orgAverageFeedbackRating < 2.5) {
    factors.push({
      factor: "Poor Workplace Satisfaction",
      pointsAdded: 15,
      explanation: `Site feedback rating is critically low at ${input.orgAverageFeedbackRating.toFixed(1)} / 5.0, signaling widespread worker dissatisfaction.`,
    });
  } else if (input.orgAverageFeedbackRating < 3.2) {
    factors.push({
      factor: "Sub-par Team Sentiment",
      pointsAdded: 8,
      explanation: `Site feedback is lukewarm (${input.orgAverageFeedbackRating.toFixed(1)} / 5.0).`,
    });
  }

  // 5. Unresolved Safety Concerns
  if (input.unresolvedHazardsCount >= 2) {
    factors.push({
      factor: "Multiple Unresolved Hazards",
      pointsAdded: 18,
      explanation: `${input.unresolvedHazardsCount} reported safety hazards remain unresolved, degrading trust in management.`,
    });
  } else if (input.unresolvedHazardsCount === 1) {
    factors.push({
      factor: "Open Safety Complaint",
      pointsAdded: 10,
      explanation: "Worker has an unacknowledged/unresolved safety report pending supervisor review.",
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.pointsAdded, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  let riskLevel: "low" | "moderate" | "high" | "severe" = "low";
  let recommendedAction = "Normal retention status. Continue standard shift supervision.";

  if (score >= 70) {
    riskLevel = "severe";
    recommendedAction =
      "Immediate Intervention Required: Schedule a supportive 1-on-1 check-in, resolve pending safety items, and mandate a 48-hour rest recovery.";
  } else if (score >= 45) {
    riskLevel = "high";
    recommendedAction =
      "High Priority: Monitor workload, limit consecutive overtime allocations, and verify supervisor responsiveness.";
  } else if (score >= 25) {
    riskLevel = "moderate";
    recommendedAction =
      "Watchlist: Review attendance patterns and verify PPE & rest break compliance.";
  }

  const reasons = factors.map((f) => f.explanation);

  return {
    workerId: input.workerId,
    workerName: input.workerName,
    score,
    riskLevel,
    factors,
    reasons: reasons.length > 0 ? reasons : ["Consistent attendance and healthy work cadence."],
    recommendedAction,
  };
}
