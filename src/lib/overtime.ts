/**
 * FairShift - Overtime Computation Engine
 * Compliant with Indian Labour Law Norms (Factories Act, 1948 - Section 59 & Minimum Wages Act, 1948)
 *
 * Rules:
 * 1. Standard daily working hours threshold: 8.0 hours.
 * 2. Standard weekly working hours threshold: 48.0 hours.
 * 3. Overtime wage rate: 2.0x (double ordinary rate of wages).
 */

export interface ShiftHourRecord {
  shiftId: string;
  checkInTime: string; // ISO date string
  checkOutTime: string; // ISO date string
  breakMinutes?: number;
}

export interface ShiftCalculationResult {
  shiftId: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  dateKey: string; // YYYY-MM-DD
}

export interface WeeklyOvertimeResult {
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  shifts: ShiftCalculationResult[];
  overtimeMultiplier: number; // 2.0
}

export const STANDARD_DAILY_HOURS = 8.0;
export const STANDARD_WEEKLY_HOURS = 48.0;
export const OVERTIME_MULTIPLIER = 2.0;

/**
 * Calculates raw hours between check-in and check-out minus breaks.
 */
export function calculateShiftDurationHours(
  checkInTime: string | Date,
  checkOutTime: string | Date,
  breakMinutes: number = 0
): number {
  const start = new Date(checkInTime).getTime();
  const end = new Date(checkOutTime).getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return 0;
  }

  const rawHours = (end - start) / (1000 * 60 * 60);
  const netHours = rawHours - (breakMinutes > 0 ? breakMinutes / 60 : 0);
  return Math.max(0, Math.round(netHours * 100) / 100);
}

/**
 * Computes daily regular vs overtime hours for a single shift.
 * Any shift beyond 8.0 hours qualifies for daily overtime.
 */
export function calculateDailyShiftHours(
  shift: ShiftHourRecord
): ShiftCalculationResult {
  const totalHours = calculateShiftDurationHours(
    shift.checkInTime,
    shift.checkOutTime,
    shift.breakMinutes ?? 0
  );

  const regularHours = Math.min(totalHours, STANDARD_DAILY_HOURS);
  const overtimeHours = Math.max(0, totalHours - STANDARD_DAILY_HOURS);
  const dateKey = new Date(shift.checkInTime).toISOString().split("T")[0];

  return {
    shiftId: shift.shiftId,
    totalHours: Math.round(totalHours * 100) / 100,
    regularHours: Math.round(regularHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    dateKey,
  };
}

/**
 * Computes weekly cumulative overtime across an array of shifts.
 * In addition to daily overtime (>8h), any cumulative regular hours
 * exceeding 48h in a calendar week are converted to overtime.
 */
export function calculateWeeklyOvertime(
  shifts: ShiftHourRecord[]
): WeeklyOvertimeResult {
  // Sort shifts chronologically
  const sorted = [...shifts].sort(
    (a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
  );

  let cumulativeRegular = 0;
  let totalOvertime = 0;
  let grandTotalHours = 0;

  const processedShifts: ShiftCalculationResult[] = [];

  for (const shift of sorted) {
    const daily = calculateDailyShiftHours(shift);
    let shiftRegular = daily.regularHours;
    let shiftOvertime = daily.overtimeHours;

    // Check weekly 48-hour regular ceiling
    if (cumulativeRegular + shiftRegular > STANDARD_WEEKLY_HOURS) {
      const remainingRegularCapacity = Math.max(0, STANDARD_WEEKLY_HOURS - cumulativeRegular);
      const convertedToOt = shiftRegular - remainingRegularCapacity;
      shiftRegular = remainingRegularCapacity;
      shiftOvertime += convertedToOt;
    }

    cumulativeRegular += shiftRegular;
    totalOvertime += shiftOvertime;
    grandTotalHours += daily.totalHours;

    processedShifts.push({
      ...daily,
      regularHours: Math.round(shiftRegular * 100) / 100,
      overtimeHours: Math.round(shiftOvertime * 100) / 100,
    });
  }

  return {
    totalHours: Math.round(grandTotalHours * 100) / 100,
    totalRegularHours: Math.round(cumulativeRegular * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertime * 100) / 100,
    shifts: processedShifts,
    overtimeMultiplier: OVERTIME_MULTIPLIER,
  };
}
