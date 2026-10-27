/**
 * FairShift - Payroll & Wage Transparency Engine
 *
 * Implements transparent, traceable statutory wage calculation:
 * - Base pay = Worked Days * Daily Wage
 * - Overtime pay = Overtime Hours * (Daily Wage / 8.0 * 2.0)
 * - Statutory PF = 12% on basic wage
 * - Statutory ESI = 0.75% on gross wages (standard employee share in India)
 * - Net Pay = Gross Earnings - Statutory Deductions
 * - Every payslip item is traceable back to the individual shift UUIDs.
 */

import { calculateDailyShiftHours, STANDARD_DAILY_HOURS, OVERTIME_MULTIPLIER } from "./overtime";

export interface ShiftForPayroll {
  id: string;
  checkInTime: string;
  checkOutTime: string;
  breakMinutes?: number;
}

export interface PayslipBreakdown {
  month: number; // 1-12
  year: number;
  workerId: string;
  orgId: string;
  dailyWage: number;
  hourlyWage: number;
  overtimeRate: number; // 2x hourly wage
  totalDaysWorked: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  basePay: number;
  overtimePay: number;
  grossPay: number;
  deductions: {
    pf: number; // 12%
    esi: number; // 0.75%
    other: number;
    totalDeductions: number;
  };
  netPay: number;
  shiftIds: string[];
  traceableShifts: Array<{
    shiftId: string;
    date: string;
    regularHours: number;
    overtimeHours: number;
    earnedBase: number;
    earnedOvertime: number;
  }>;
}

export const PF_RATE = 0.12; // 12% EPF
export const ESI_RATE = 0.0075; // 0.75% ESI employee share

/**
 * Computes a transparent, itemized monthly payslip with shift-level audit trail.
 */
export function generateMonthlyPayslip(
  workerId: string,
  orgId: string,
  month: number,
  year: number,
  dailyWage: number,
  shifts: ShiftForPayroll[]
): PayslipBreakdown {
  const hourlyWage = Math.round((dailyWage / STANDARD_DAILY_HOURS) * 100) / 100;
  const overtimeRate = Math.round(hourlyWage * OVERTIME_MULTIPLIER * 100) / 100;

  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  const uniqueDays = new Set<string>();
  const shiftIds: string[] = [];

  const traceableShifts = shifts.map((shift) => {
    shiftIds.push(shift.id);
    const calculated = calculateDailyShiftHours({
      shiftId: shift.id,
      checkInTime: shift.checkInTime,
      checkOutTime: shift.checkOutTime,
      breakMinutes: shift.breakMinutes ?? 0,
    });

    uniqueDays.add(calculated.dateKey);
    totalRegularHours += calculated.regularHours;
    totalOvertimeHours += calculated.overtimeHours;

    const shiftBasePortion = Math.min(1.0, calculated.regularHours / STANDARD_DAILY_HOURS);
    const earnedBase = Math.round(shiftBasePortion * dailyWage * 100) / 100;
    const earnedOvertime = Math.round(calculated.overtimeHours * overtimeRate * 100) / 100;

    return {
      shiftId: shift.id,
      date: calculated.dateKey,
      regularHours: calculated.regularHours,
      overtimeHours: calculated.overtimeHours,
      earnedBase,
      earnedOvertime,
    };
  });

  const totalDaysWorked = uniqueDays.size;
  const basePay = Math.round(totalDaysWorked * dailyWage * 100) / 100;
  const overtimePay = Math.round(totalOvertimeHours * overtimeRate * 100) / 100;
  const grossPay = Math.round((basePay + overtimePay) * 100) / 100;

  // Deductions
  const pf = Math.round(basePay * PF_RATE * 100) / 100;
  const esi = Math.round(grossPay * ESI_RATE * 100) / 100;
  const other = 0;
  const totalDeductions = Math.round((pf + esi + other) * 100) / 100;

  const netPay = Math.max(0, Math.round((grossPay - totalDeductions) * 100) / 100);

  return {
    month,
    year,
    workerId,
    orgId,
    dailyWage,
    hourlyWage,
    overtimeRate,
    totalDaysWorked,
    totalRegularHours: Math.round(totalRegularHours * 100) / 100,
    totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
    basePay,
    overtimePay,
    grossPay,
    deductions: {
      pf,
      esi,
      other,
      totalDeductions,
    },
    netPay,
    shiftIds,
    traceableShifts,
  };
}
