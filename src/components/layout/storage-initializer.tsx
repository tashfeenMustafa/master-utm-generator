"use client";

import { useEffect } from "react";
import { getSourceTypes, saveSourceType, getMediums, saveMedium } from "@/lib/storage";
import { DEFAULT_SOURCE_TYPES, DEFAULT_MEDIUMS } from "@/lib/utm-config";

export function StorageInitializer() {
  useEffect(() => {
    // Seed Mediums
    const existingMediums = getMediums();
    if (existingMediums.length === 0) {
      DEFAULT_MEDIUMS.forEach((m) => {
        saveMedium(m);
      });
    }

    // Seed Source Types
    const existingSourceTypes = getSourceTypes();
    if (existingSourceTypes.length === 0) {
      DEFAULT_SOURCE_TYPES.forEach((s) => {
        saveSourceType(s);
      });
    }
  }, []);

  return null;
}
