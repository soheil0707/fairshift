import { SectorType } from "@/config/sectors";

export interface Organization {
  id: string;
  name: string;
  sector: SectorType;
  location: string;
  geofenceLat: number;
  geofenceLng: number;
  geofenceRadiusMeters: number;
  qrCodeSecret: string;
}

export interface WorkerProfile {
  id: string;
  orgId: string;
  fullName: string;
  phone: string;
  role: "worker" | "admin" | "supervisor";
  trade: string;
  dailyWage: number;
  preferredLanguage: "en" | "hi" | "te" | "ta";
  avatarUrl?: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  workerId: string;
  orgId: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInMethod: "qr_code" | "geofence" | "manual_admin";
  checkInLat?: number;
  checkInLng?: number;
  regularHours: number;
  overtimeHours: number;
  status: "in_progress" | "completed" | "flagged";
  notes?: string;
}

export interface HazardReport {
  id: string;
  workerId: string;
  orgId: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "acknowledged" | "fixed";
  descriptionRaw: string;
  descriptionEn: string;
  photoUrl?: string;
  reportedAt: string;
  acknowledgedAt?: string;
  fixedAt?: string;
  actionNotes?: string;
}

export interface AnonymousFeedback {
  id: string;
  orgId: string;
  ratingManager: number; // 1-5
  ratingSafety: number; // 1-5
  ratingPay: number; // 1-5
  ratingWorkload: number; // 1-5
  comment?: string;
  submittedAt: string;
}

export interface SkillEntry {
  id: string;
  passportId: string;
  skillName: string;
  sector: SectorType;
  issuingOrgName: string;
  hoursLogged: number;
  certificationName?: string;
  verified: boolean;
  verifiedAt: string;
}

export interface SkillPassport {
  id: string;
  workerId: string;
  passportCode: string;
  totalVerifiedHours: number;
  createdAt: string;
  entries: SkillEntry[];
}
