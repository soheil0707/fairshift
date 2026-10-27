export type SectorType = "construction" | "hospital" | "college" | "factory";

export interface HazardCategoryConfig {
  id: string;
  label: string;
  description: string;
  suggestedSeverity: "low" | "medium" | "high" | "critical";
  iconName: string;
}

export interface ShiftTemplateConfig {
  id: string;
  name: string;
  startTime: string;
  durationHours: number;
  breakMinutes: number;
}

export interface SkillTypeConfig {
  id: string;
  name: string;
  description: string;
}

export interface SectorConfig {
  id: SectorType;
  title: string;
  tagline: string;
  themeColor: string;
  badgeBg: string;
  labels: {
    workerRole: string;
    siteLabel: string;
    managerTitle: string;
    checkInPrompt: string;
    hazardPrompt: string;
    attendanceUnit: string;
  };
  hazardCategories: HazardCategoryConfig[];
  shiftTemplates: ShiftTemplateConfig[];
  skillTypes: SkillTypeConfig[];
}

export const SECTORS: Record<SectorType, SectorConfig> = {
  construction: {
    id: "construction",
    title: "Construction & Infrastructure",
    tagline: "Scaffolding, excavation, civil construction, heavy equipment safety",
    themeColor: "amber-600",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    labels: {
      workerRole: "Site Worker / Craftsman",
      siteLabel: "Construction Site & Plot",
      managerTitle: "Site Supervisor / Contractor",
      checkInPrompt: "Scan site QR code or confirm GPS at construction gate",
      hazardPrompt: "Report scaffolding gaps, electrical hazards, falling objects, or missing PPE",
      attendanceUnit: "Day Muster",
    },
    hazardCategories: [
      {
        id: "scaffolding_fall",
        label: "Scaffolding / Heights / Fall Risk",
        description: "Unsecured staging, missing guardrails, unstable ladders",
        suggestedSeverity: "critical",
        iconName: "ShieldAlert",
      },
      {
        id: "electrical_wire",
        label: "Live Electrical & Exposed Cables",
        description: "Open breaker panels, frayed wiring near water, ungrounded generators",
        suggestedSeverity: "high",
        iconName: "Zap",
      },
      {
        id: "falling_objects",
        label: "Falling Debris / Missing Hardhat Zone",
        description: "Overhead crane operations without netting, dropped tools",
        suggestedSeverity: "high",
        iconName: "AlertTriangle",
      },
      {
        id: "excavation_trench",
        label: "Trench / Excavation Cave-in",
        description: "Unsupported mud banks, water accumulation in foundation pits",
        suggestedSeverity: "critical",
        iconName: "Layers",
      },
      {
        id: "ppe_deficiency",
        label: "Missing Personal Protective Equipment (PPE)",
        description: "Damaged boots, missing safety harnesses, no goggles during cutting",
        suggestedSeverity: "medium",
        iconName: "HardHat",
      },
      {
        id: "heat_exhaustion",
        label: "Extreme Heat / No Drinking Water",
        description: "Dehydration risk, lack of shade break area on roof slab",
        suggestedSeverity: "medium",
        iconName: "Sun",
      },
    ],
    shiftTemplates: [
      { id: "c_morning", name: "Morning Concrete & Formwork Shift", startTime: "07:00", durationHours: 8, breakMinutes: 45 },
      { id: "c_general", name: "Standard Civil Shift", startTime: "08:30", durationHours: 8, breakMinutes: 60 },
      { id: "c_overtime", name: "Evening Slab Curing & Pouring OT", startTime: "17:30", durationHours: 4, breakMinutes: 15 },
    ],
    skillTypes: [
      { id: "bar_bending", name: "Steel Rebar & Bar Bending", description: "BBS reading, cutting, tying rebar cages for columns and footings" },
      { id: "masonry", name: "Brickwork & AAC Block Masonry", description: "Line, plumb, mortar mixing and high-finish plastering" },
      { id: "scaffold_erection", name: "Certified Scaffolder (Level 1)", description: "Cuplock erection, base jack leveling, safety harness tie-off" },
      { id: "concreting", name: "Batching Plant & Concrete Pouring", description: "Slump test, vibrator handling, cold-joint prevention" },
      { id: "heavy_equipment", name: "JCB / Excavator Operator", description: "Site leveling, earthmoving, trenching within boundary pegs" },
    ],
  },
  hospital: {
    id: "hospital",
    title: "Healthcare & Hospital Support",
    tagline: "Ward sanitation, sterile supply, patient transport, sharps safety",
    themeColor: "emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    labels: {
      workerRole: "Support Staff / Ward Attendant",
      siteLabel: "Hospital Wing / Ward Block",
      managerTitle: "Nursing Supervisor / Facility In-Charge",
      checkInPrompt: "Scan nursing station QR or confirm ward GPS",
      hazardPrompt: "Report needle sticks, biohazard spills, broken stretchers, or PPE shortage",
      attendanceUnit: "Shift Roster",
    },
    hazardCategories: [
      {
        id: "needle_stick",
        label: "Needle Stick / Sharps Exposure",
        description: "Improperly discarded syringe or scalpel in general bin",
        suggestedSeverity: "critical",
        iconName: "Syringe",
      },
      {
        id: "biohazard_spill",
        label: "Biohazard & Blood Spill",
        description: "Unsanitized bodily fluid spill in corridors or ICU floor",
        suggestedSeverity: "high",
        iconName: "Biohazard",
      },
      {
        id: "chemical_sanitizer",
        label: "Disinfectant / Autoclave Chemical Vapour",
        description: "Strong glutaraldehyde fumes, unventilated sterilizing room",
        suggestedSeverity: "medium",
        iconName: "FlaskConical",
      },
      {
        id: "patient_transport",
        label: "Faulty Stretcher / Wheelchair Lock",
        description: "Brake failure on transfer trolley risking patient fall",
        suggestedSeverity: "high",
        iconName: "Stethoscope",
      },
      {
        id: "ppe_shortage",
        label: "N95 / Glove Shortage in Isolation Ward",
        description: "Depleted stock of protective gear in infectious ward",
        suggestedSeverity: "high",
        iconName: "Shield",
      },
      {
        id: "slip_fall",
        label: "Wet Floor Without Warning Sign",
        description: "Freshly mopped corridor without caution cones",
        suggestedSeverity: "low",
        iconName: "Footprints",
      },
    ],
    shiftTemplates: [
      { id: "h_morning", name: "General Ward Morning Shift", startTime: "06:30", durationHours: 8, breakMinutes: 30 },
      { id: "h_evening", name: "ICU & Emergency Evening Shift", startTime: "14:30", durationHours: 8, breakMinutes: 30 },
      { id: "h_night", name: "Night Rotational Duty", startTime: "22:00", durationHours: 8, breakMinutes: 30 },
    ],
    skillTypes: [
      { id: "infection_control", name: "Biomedical Waste & Infection Control", description: "Color-coded segregation (Yellow, Red, White, Blue) and autoclave protocols" },
      { id: "patient_handling", name: "Safe Patient Transfer & Ergonomics", description: "Log-roll technique, slide sheets, oxygen cylinder secure handling" },
      { id: "sterile_supply", name: "CSSD Sterile Processing", description: "Packaging surgical trays, ETO sterilizer operation, indicator verification" },
      { id: "isolation_cleaning", name: "Isolation Ward Terminal Cleaning", description: "Hydrogen peroxide vapor and chlorine bleach sanitization" },
    ],
  },
  college: {
    id: "college",
    title: "Higher Education & Campus Facilities",
    tagline: "Academic campus maintenance, lab safety, student hostel facility upkeep",
    themeColor: "indigo-600",
    badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
    labels: {
      workerRole: "Campus Facilities Technician / Attendant",
      siteLabel: "Campus Block / Department Complex",
      managerTitle: "Estate Officer / Facility Manager",
      checkInPrompt: "Scan security gate QR or confirm department GPS",
      hazardPrompt: "Report chemistry lab leaks, electrical overloads, hostel water issues, or roof leaks",
      attendanceUnit: "Duty Log",
    },
    hazardCategories: [
      {
        id: "lab_chemical",
        label: "Science Lab Chemical Fume / Leak",
        description: "Fume hood exhaust malfunction, broken acid storage carboy",
        suggestedSeverity: "critical",
        iconName: "Flame",
      },
      {
        id: "high_voltage_lab",
        label: "Electrical Lab High-Voltage Switchboard",
        description: "Uncapped busbar in electrical engineering lab, overloaded socket",
        suggestedSeverity: "high",
        iconName: "Zap",
      },
      {
        id: "mess_hygiene",
        label: "Hostel Mess Kitchen / LPG Pipeline Hazard",
        description: "Gas smell near industrial burners, water leak in food prep area",
        suggestedSeverity: "critical",
        iconName: "Utensils",
      },
      {
        id: "water_tank",
        label: "Overhead Tank Overflow / Contamination",
        description: "Unsealed tank lid, stagnant water encouraging mosquito breeding",
        suggestedSeverity: "medium",
        iconName: "Droplets",
      },
      {
        id: "broken_furniture",
        label: "Broken Auditorium / Classroom Step",
        description: "Protruding nail or collapsed desk seat creating injury hazard",
        suggestedSeverity: "low",
        iconName: "Wrench",
      },
    ],
    shiftTemplates: [
      { id: "col_day", name: "Campus Operations Day Shift", startTime: "08:00", durationHours: 8, breakMinutes: 60 },
      { id: "col_hostel", name: "Hostel Facilities Maintenance Shift", startTime: "10:00", durationHours: 8, breakMinutes: 60 },
      { id: "col_night_sec", name: "Campus Guard & Night Utility Patrol", startTime: "20:00", durationHours: 8, breakMinutes: 30 },
    ],
    skillTypes: [
      { id: "campus_electrician", name: "Institutional Electrical Wiring & DG Set", description: "3-phase panel repair, diesel generator maintenance, auditorium lighting" },
      { id: "lab_technician_assistant", name: "Lab Chemical Handling & Safety Neutralization", description: "Spill kit deployment, cylinder manifold safety, eye wash station maintenance" },
      { id: "plumbing_drainage", name: "Commercial Campus Plumbing & RO Plant", description: "High-pressure pump operation, sewage treatment plant (STP) basic maintenance" },
      { id: "landscaping_greenery", name: "Campus Arboriculture & Tree Pruning", description: "Safe chainsaw use, high-branch trimming near overhead HT power lines" },
    ],
  },
  factory: {
    id: "factory",
    title: "Industrial Manufacturing & Factory",
    tagline: "Assembly lines, punch presses, chemical storage, boiler operations",
    themeColor: "red-600",
    badgeBg: "bg-red-100 text-red-900 border-red-300",
    labels: {
      workerRole: "Line Operator / Technician",
      siteLabel: "Shop Floor / Production Bay",
      managerTitle: "Plant Supervisor / Production Head",
      checkInPrompt: "Scan factory turnstile QR or punch GPS check-in",
      hazardPrompt: "Report unguarded machinery, steam leaks, blocked fire exits, or chemical drums",
      attendanceUnit: "Factory Muster",
    },
    hazardCategories: [
      {
        id: "machine_guard",
        label: "Missing Machine Safety Guard / Interlock",
        description: "Conveyor pinch point or stamping press light curtain bypassed",
        suggestedSeverity: "critical",
        iconName: "ShieldAlert",
      },
      {
        id: "boiler_steam",
        label: "Boiler / High-Pressure Steam Valve Leak",
        description: "Steam hiss near operator walkway, overdue hydrostatic inspection",
        suggestedSeverity: "critical",
        iconName: "Flame",
      },
      {
        id: "blocked_fire_exit",
        label: "Blocked Emergency Exit / Extinguisher Missing",
        description: "Pallets stacked in front of fire doors, unpressurized CO2 cylinder",
        suggestedSeverity: "high",
        iconName: "DoorClosed",
      },
      {
        id: "forklift_traffic",
        label: "Forklift Pathway / Blind Corner Collision Risk",
        description: "Missing convex mirrors at intersection, no pedestrian barrier",
        suggestedSeverity: "high",
        iconName: "Truck",
      },
      {
        id: "chemical_drum",
        label: "Unlabeled Solvent Drum / Bund Leak",
        description: "Secondary containment cracked, missing GHS chemical labels",
        suggestedSeverity: "medium",
        iconName: "AlertCircle",
      },
    ],
    shiftTemplates: [
      { id: "f_shift1", name: "Shift A (Morning Production)", startTime: "06:00", durationHours: 8, breakMinutes: 45 },
      { id: "f_shift2", name: "Shift B (Evening Assembly)", startTime: "14:00", durationHours: 8, breakMinutes: 45 },
      { id: "f_shift3", name: "Shift C (Night Maintenance)", startTime: "22:00", durationHours: 8, breakMinutes: 45 },
    ],
    skillTypes: [
      { id: "cnc_operator", name: "CNC Milling & Turning", description: "G-code offset setup, tool wear monitoring, micrometer calibration" },
      { id: "industrial_welding", name: "MIG / TIG Industrial Welding", description: "Gas purging, weld seam inspection, pressure vessel safety" },
      { id: "boiler_attendant", name: "Class-II Boiler Attendant", description: "Water level gauge blow-down, safety valve manual test, feedwater analysis" },
      { id: "forklift_license", name: "Licensed Forklift & Reach Truck Operator", description: "3-ton counterbalance driving, pallet racking safety, pre-use inspection" },
    ],
  },
};

export const DEMO_ORGS = [
  {
    id: "org-sai-constructions",
    name: "Sai Constructions (Guntur site)",
    sector: "construction" as SectorType,
    location: "Plot 42, Amaravati Ring Road, Guntur, AP",
    geofenceLat: 16.3067,
    geofenceLng: 80.4365,
    geofenceRadiusMeters: 400,
    qrCodeSecret: "FAIRSHIFT_QR_SAI_GUNTUR_SITE_2026",
  },
  {
    id: "org-city-care-hospital",
    name: "City Care Hospital",
    sector: "hospital" as SectorType,
    location: "Banjara Hills Road No. 12, Hyderabad, TS",
    geofenceLat: 17.4156,
    geofenceLng: 78.4357,
    geofenceRadiusMeters: 300,
    qrCodeSecret: "FAIRSHIFT_QR_CITY_CARE_HOSP_HYD_2026",
  },
  {
    id: "org-srm-campus-facilities",
    name: "SRM Campus Facilities",
    sector: "college" as SectorType,
    location: "Kattankulathur Campus, Chengalpattu Dist, TN",
    geofenceLat: 12.8231,
    geofenceLng: 80.0442,
    geofenceRadiusMeters: 500,
    qrCodeSecret: "FAIRSHIFT_QR_SRM_CAMPUS_KTR_2026",
  },
];
