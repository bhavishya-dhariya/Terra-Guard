const DEFAULT_BANK_ID = "crisis-command-player";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function urlJoin(base, path) {
  return `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

export function createHindsightService(env) {
  const apiUrl = env.HINDSIGHT_API_URL;
  const bankId = env.HINDSIGHT_BANK_ID || DEFAULT_BANK_ID;

  async function request(path, body) {
    if (!apiUrl) throw new Error("Missing HINDSIGHT_API_URL");
    const res = await fetch(urlJoin(apiUrl, path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const text = await res.text().catch(() => "");
    const json = safeJsonParse(text);
    if (!res.ok) {
      const msg = (json && (json.error || json.message)) || text || `Hindsight error (${res.status})`;
      throw new Error(msg);
    }
    return json ?? { raw: text };
  }

  async function ensureBank() {
    const mission =
      "I am the Crisis Command disaster training system. I track player decision patterns, learning curves, and recurring mistakes across disaster scenarios. I prioritize identifying behavioral tendencies that cost lives — hesitation, poor triage, delayed evacuation.";
    const directives = [
      "Always reference specific past scenarios when patterns are detected",
      "Never fabricate session data — only report what was actually retained",
      "Flag if a player is repeating the same mistake across 2+ sessions",
    ];
    const disposition = { skepticism: 2, empathy: 4, precision: 5 };

    try {
      return await request("/api/banks", {
        id: bankId,
        mission,
        directives,
        disposition,
      });
    } catch (e) {
      // If bank already exists, server may return conflict; treat as OK.
      const msg = e instanceof Error ? e.message : String(e);
      if (/exist|already|conflict|409/i.test(msg)) return { ok: true, id: bankId };
      throw e;
    }
  }

  async function retain(content, type = "experience_fact") {
    return await request("/api/memory/retain", { bankId, type, content });
  }

  async function recall(query) {
    return await request("/api/memory/recall", { bankId, query, topK: 5 });
  }

  async function reflect(query) {
    return await request("/api/memory/reflect", { bankId, query });
  }

  return { bankId, ensureBank, retain, recall, reflect };
}

