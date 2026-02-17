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

// Abstracts storage for testability — defaults to window.localStorage
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
