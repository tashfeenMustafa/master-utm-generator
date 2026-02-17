import type {
  UtmLink,
  UtmValue,
  ManageableParameter,
  DataConnection,
  StorageAdapter,
} from "./types";

// ── Namespaced keys ──────────────────────────────────────────────
const KEYS = {
  links: "utm-generator:links",
  values: "utm-generator:values",
  connections: "utm-generator:connections",
} as const;

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
