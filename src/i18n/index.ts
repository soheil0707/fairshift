import en from "./en.json";
import hi from "./hi.json";
import te from "./te.json";
import ta from "./ta.json";

export type LanguageCode = "en" | "hi" | "te" | "ta";

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", speechLocale: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", speechLocale: "hi-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", speechLocale: "te-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", speechLocale: "ta-IN" },
];

export const TRANSLATIONS: Record<LanguageCode, typeof en> = {
  en,
  hi,
  te,
  ta,
};

export function getTranslation(lang: LanguageCode, key: keyof typeof en): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}
