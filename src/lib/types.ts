// UTM parameter names used across the app
export type UtmParameter =
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content";

// A generated UTM link stored in localStorage
export interface UtmLink {
  id: string;
  baseUrl: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  customParams?: Record<string, string>; // Extra params like utm_id
  generatedUrl: string;
  createdAt: string; // ISO 8601
}

// Parameters that support managed dropdown values
export type ManageableParameter = "utm_campaign" | "utm_term" | "utm_content";

// A saved dropdown option value for a specific UTM parameter
export interface UtmValue {
  id: string;
  parameter: ManageableParameter;
  value: string;
  label: string; // original display label before snake_case conversion
  source: "manual" | "google_sheets" | "airtable" | "auto";
  sourceRef: string | null; // sheet/table ID reference
  createdAt: string; // ISO 8601
}

// External data source connection config (e.g. Google Sheets)
export interface DataConnection {
  id: string;
  name: string;
  type: 'google_sheets' | 'airtable';
  config: Record<string, string>;
  lastSynced: string | null;       // ISO 8601
  status: 'active' | 'error' | 'disconnected';
  createdAt: string; // ISO 8601
}

// Ad platform types
export type AdPlatform = 'meta' | 'google' | 'linkedin';
export type AdCampaignStatus = 'active' | 'paused' | 'completed';

// A campaign imported from an ad platform (Phase 2: live API data)
export interface AdCampaign {
  id: string;
  platform: AdPlatform;
  campaignName: string;
  status: AdCampaignStatus;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  utmTemplate: string; // full URL template with placeholders like {{campaign.name}}
  lastUpdated: string; // ISO 8601
}

// ── Phase 2: Customizable Sources & Mediums ──────────────────────

export interface UtmMedium {
  id: string;
  value: string; // snake_case
  label: string; // display name
  createdAt: string;
}

export interface SourceType {
  id: string;
  name: string;
  utm_source: string;
  utm_medium: string;
  platforms: string[]; // referenced by value from PlatformConfig
  isDefault?: boolean; // System-provided defaults
  createdAt: string;
}

// ── Phase 2: Premium & Account ──────────────────────────────────

export type UserPlan = "free" | "pro" | "team";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  isPremium: boolean;
  joinedAt: string;
}

// ── Phase 2: Naming Conventions ────────────────────────────────

export type NamingRule = "snake_case" | "lowercase" | "none";

export interface ParameterConvention {
  parameter: ManageableParameter;
  rule: NamingRule;
  prefix?: string;
  suffix?: string;
}

export interface NamingConventions {
  utm_campaign: ParameterConvention;
  utm_term: ParameterConvention;
  utm_content: {
    rule: "format-hook" | "snake_case";
    separator: string;
  };
}

// Abstracts storage for testability — defaults to window.localStorage
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
