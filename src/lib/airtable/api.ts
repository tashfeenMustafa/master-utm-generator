const AIRTABLE_API = "https://api.airtable.com/v0";
const AIRTABLE_META = "https://api.airtable.com/v0/meta";

export interface AirtableBase {
  id: string;
  name: string;
}

export interface AirtableField {
  name: string;
  type: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  fields: AirtableField[];
}

async function airtableGet(token: string, url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable API error (${res.status}): ${err}`);
  }
  return res;
}

export async function listBases(token: string): Promise<AirtableBase[]> {
  const res = await airtableGet(token, `${AIRTABLE_META}/bases`);
  const data = await res.json();
  return (data.bases ?? []).map((b: { id: string; name: string }) => ({
    id: b.id,
    name: b.name,
  }));
}

export async function listTables(
  token: string,
  baseId: string
): Promise<AirtableTable[]> {
  const res = await airtableGet(
    token,
    `${AIRTABLE_META}/bases/${baseId}/tables`
  );
  const data = await res.json();
  return (data.tables ?? []).map(
    (t: { id: string; name: string; fields: AirtableField[] }) => ({
      id: t.id,
      name: t.name,
      fields: (t.fields ?? []).map((f: AirtableField) => ({
        name: f.name,
        type: f.type,
      })),
    })
  );
}

export async function getRecords(
  token: string,
  baseId: string,
  tableId: string,
  fieldNames: string[]
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  for (const name of fieldNames) {
    result[name] = [];
  }

  const seen: Record<string, Set<string>> = {};
  for (const name of fieldNames) {
    seen[name] = new Set();
  }

  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    for (const name of fieldNames) {
      params.append("fields[]", name);
    }
    if (offset) {
      params.set("offset", offset);
    }

    const res = await airtableGet(
      token,
      `${AIRTABLE_API}/${baseId}/${tableId}?${params.toString()}`
    );
    const data = await res.json();

    for (const record of data.records ?? []) {
      const fields = record.fields ?? {};
      for (const name of fieldNames) {
        const val =
          typeof fields[name] === "string" ? fields[name].trim() : "";
        if (val && !seen[name].has(val)) {
          seen[name].add(val);
          result[name].push(val);
        }
      }
    }

    offset = data.offset;
  } while (offset);

  return result;
}
