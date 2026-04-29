import type {
  UtmLink,
  UtmValue,
  ManageableParameter,
  DataConnection,
  StorageAdapter,
  SourceType,
  UtmMedium,
  UserProfile,
  NamingConventions,
} from "./types";

// ── Namespaced keys ──────────────────────────────────────────────
const KEYS = {
  links: "utm-generator:links",
  values: "utm-generator:values",
  connections: "utm-generator:connections",
  sourceTypes: "utm-generator:source-types",
  mediums: "utm-generator:mediums",
  user: "utm-generator:user",
  conventions: "utm-generator:conventions",
} as const;

// ── Defaults ──────────────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  id: "local-admin",
  email: "",
  name: "Admin",
  plan: "pro",
  isPremium: true,
  joinedAt: new Date().toISOString(),
};

const DEFAULT_CONVENTIONS: NamingConventions = {
  utm_campaign: { parameter: "utm_campaign", rule: "snake_case" },
  utm_term: { parameter: "utm_term", rule: "snake_case" },
  utm_content: { rule: "format-hook", separator: "-" },
};

// ── Helpers ──────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID();
}

function getAdapter(adapter?: StorageAdapter): StorageAdapter {
  return adapter ?? window.localStorage;
}

function readArray<T>(key: string, adapter?: StorageAdapter): T[] {
  try {
    const raw = getAdapter(adapter).getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, data: T[], adapter?: StorageAdapter): void {
  getAdapter(adapter).setItem(key, JSON.stringify(data));
  if (typeof window !== "undefined" && !adapter) {
    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue: JSON.stringify(data) })
    );
  }
}

// ── Links CRUD ───────────────────────────────────────────────────

export interface LinkFilters {
  search?: string;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
}

export function getLinks(
  filters?: LinkFilters,
  adapter?: StorageAdapter
): UtmLink[] {
  let links = readArray<UtmLink>(KEYS.links, adapter);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    links = links.filter(
      (l) =>
        l.generatedUrl.toLowerCase().includes(q) ||
        l.utm_campaign.toLowerCase().includes(q) ||
        l.utm_source.toLowerCase().includes(q)
    );
  }

  const order = filters?.sortOrder ?? "desc";
  links.sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return order === "asc" ? diff : -diff;
  });

  return links;
}

export function addLink(
  data: Omit<UtmLink, "id" | "createdAt">,
  adapter?: StorageAdapter
): UtmLink {
  const links = readArray<UtmLink>(KEYS.links, adapter);
  const link: UtmLink = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  links.push(link);
  writeArray(KEYS.links, links, adapter);
  return link;
}

export function deleteLink(id: string, adapter?: StorageAdapter): void {
  const links = readArray<UtmLink>(KEYS.links, adapter);
  writeArray(
    KEYS.links,
    links.filter((l) => l.id !== id),
    adapter
  );
}

// ── Values CRUD ──────────────────────────────────────────────────

export function getValues(
  parameter?: ManageableParameter,
  adapter?: StorageAdapter
): UtmValue[] {
  const values = readArray<UtmValue>(KEYS.values, adapter);
  if (!parameter) return values;
  return values.filter((v) => v.parameter === parameter);
}

export function addValue(
  data: Omit<UtmValue, "id" | "createdAt">,
  adapter?: StorageAdapter
): UtmValue | null {
  const values = readArray<UtmValue>(KEYS.values, adapter);

  // Dedup: no duplicate value+parameter combos
  const exists = values.some(
    (v) => v.parameter === data.parameter && v.value === data.value
  );
  if (exists) return null;

  const value: UtmValue = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  values.push(value);
  writeArray(KEYS.values, values, adapter);
  return value;
}

export function deleteValue(id: string, adapter?: StorageAdapter): void {
  const values = readArray<UtmValue>(KEYS.values, adapter);
  writeArray(
    KEYS.values,
    values.filter((v) => v.id !== id),
    adapter
  );
}

// ── Connections CRUD ─────────────────────────────────────────────

export function getConnections(adapter?: StorageAdapter): DataConnection[] {
  return readArray<DataConnection>(KEYS.connections, adapter);
}

export function saveConnection(
  data: Omit<DataConnection, "id" | "createdAt">,
  adapter?: StorageAdapter
): DataConnection {
  const connections = readArray<DataConnection>(KEYS.connections, adapter);
  const connection: DataConnection = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  connections.push(connection);
  writeArray(KEYS.connections, connections, adapter);
  return connection;
}

export function deleteConnection(id: string, adapter?: StorageAdapter): void {
  const connections = readArray<DataConnection>(KEYS.connections, adapter);
  writeArray(
    KEYS.connections,
    connections.filter((c) => c.id !== id),
    adapter
  );
}

export function updateConnection(
  id: string,
  data: Partial<Omit<DataConnection, "id" | "createdAt">>,
  adapter?: StorageAdapter
): DataConnection | null {
  const connections = readArray<DataConnection>(KEYS.connections, adapter);
  const index = connections.findIndex((c) => c.id === id);
  if (index === -1) return null;
  connections[index] = { ...connections[index], ...data };
  writeArray(KEYS.connections, connections, adapter);
  return connections[index];
}

export function deleteValuesBySource(
  source: UtmValue["source"],
  sourceRef: string | null,
  adapter?: StorageAdapter
): void {
  const values = readArray<UtmValue>(KEYS.values, adapter);
  writeArray(
  KEYS.values,
  values.filter((v) => !(v.source === source && v.sourceRef === sourceRef)),
  adapter
  );
  }

  // ── Source Types CRUD ──────────────────────────────────────────

  export function getSourceTypes(adapter?: StorageAdapter): SourceType[] {
  return readArray<SourceType>(KEYS.sourceTypes, adapter);
  }

  export function saveSourceType(
  data: Omit<SourceType, "id" | "createdAt">,
  adapter?: StorageAdapter
  ): SourceType {
  const sourceTypes = readArray<SourceType>(KEYS.sourceTypes, adapter);
  const sourceType: SourceType = {
  ...data,
  id: generateId(),
  createdAt: new Date().toISOString(),
  };
  sourceTypes.push(sourceType);
  writeArray(KEYS.sourceTypes, sourceTypes, adapter);
  return sourceType;
  }

  export function deleteSourceType(id: string, adapter?: StorageAdapter): void {
  const sourceTypes = readArray<SourceType>(KEYS.sourceTypes, adapter);
  writeArray(
  KEYS.sourceTypes,
  sourceTypes.filter((s) => s.id !== id),
  adapter
  );
  }

  // ── Mediums CRUD ───────────────────────────────────────────────

  export function getMediums(adapter?: StorageAdapter): UtmMedium[] {
  return readArray<UtmMedium>(KEYS.mediums, adapter);
  }

  export function saveMedium(
  data: Omit<UtmMedium, "id" | "createdAt">,
  adapter?: StorageAdapter
  ): UtmMedium | null {
  const mediums = readArray<UtmMedium>(KEYS.mediums, adapter);

  // Dedup
  if (mediums.some((m) => m.value === data.value)) return null;

  const medium: UtmMedium = {
  ...data,
  id: generateId(),
  createdAt: new Date().toISOString(),
  };
  mediums.push(medium);
  writeArray(KEYS.mediums, mediums, adapter);
  return medium;
  }

  export function deleteMedium(id: string, adapter?: StorageAdapter): void {
  const mediums = readArray<UtmMedium>(KEYS.mediums, adapter);
  writeArray(
    KEYS.mediums,
    mediums.filter((m) => m.id !== id),
    adapter
  );
  }

  // ── Export / Import ─────────────────────────────────────────────

  export function exportValues(adapter?: StorageAdapter): string {
  const values = readArray<UtmValue>(KEYS.values, adapter);
  return JSON.stringify(values, null, 2);
  }

  export function importValues(
  json: string,
  adapter?: StorageAdapter
  ): { imported: number; skipped: number } {
  try {
    const newValues = JSON.parse(json);
    if (!Array.isArray(newValues)) throw new Error("Invalid format");

    const existing = readArray<UtmValue>(KEYS.values, adapter);
    let imported = 0;
    let skipped = 0;

    const merged = [...existing];

    newValues.forEach((v: any) => {
      // Basic validation
      if (!v.parameter || !v.value || !v.label) {
        skipped++;
        return;
      }

      const exists = merged.some(
        (ex) => ex.parameter === v.parameter && ex.value === v.value
      );

      if (!exists) {
        merged.push({
          ...v,
          id: generateId(), // Always generate new IDs to avoid collisions
          createdAt: v.createdAt || new Date().toISOString(),
          source: "manual", // Mark as manual since it's imported
        });
        imported++;
      } else {
        skipped++;
      }
    });

    writeArray(KEYS.values, merged, adapter);
    return { imported, skipped };
    } catch (e) {
    console.error("Import failed:", e);
    throw new Error("Failed to parse UTM values JSON");
    }
    }

    // ── User CRUD ──────────────────────────────────────────────────

    export function getUser(adapter?: StorageAdapter): UserProfile {
    const ad = getAdapter(adapter);
    const raw = ad.getItem(KEYS.user);
    if (!raw) return DEFAULT_USER;
    try {
    return JSON.parse(raw) as UserProfile;
    } catch {
    return DEFAULT_USER;
    }
    }

    export function updateUser(
    data: Partial<UserProfile>,
    adapter?: StorageAdapter
    ): UserProfile {
    const user = getUser(adapter);
    const updated = { ...user, ...data };
    getAdapter(adapter).setItem(KEYS.user, JSON.stringify(updated));

    if (typeof window !== "undefined" && !adapter) {
    window.dispatchEvent(
      new StorageEvent("storage", { key: KEYS.user, newValue: JSON.stringify(updated) })
    );
    }

    return updated;
    }

export function getNamingConventions(adapter?: StorageAdapter): NamingConventions {
  const ad = getAdapter(adapter);
  const raw = ad.getItem(KEYS.conventions);
  if (!raw) return DEFAULT_CONVENTIONS;
  try {
    return JSON.parse(raw) as NamingConventions;
  } catch {
    return DEFAULT_CONVENTIONS;
  }
}

export function updateNamingConventions(
  data: Partial<NamingConventions>,
  adapter?: StorageAdapter
): NamingConventions {
  const current = getNamingConventions(adapter);
  const updated = { ...current, ...data };
  getAdapter(adapter).setItem(KEYS.conventions, JSON.stringify(updated));
  
  if (typeof window !== "undefined" && !adapter) {
    window.dispatchEvent(
      new StorageEvent("storage", { key: KEYS.conventions, newValue: JSON.stringify(updated) })
    );
  }
  
  return updated;
}

