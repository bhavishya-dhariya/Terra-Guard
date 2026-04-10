import type { Message } from "../types/game";

export type ClaudeStreamEvent =
  | { type: "chunk"; textDelta: string }
  | { type: "error"; error: string }
  | { type: "done" };

export async function* streamClaude({
  messages,
  system,
  signal,
}: {
  messages: Message[];
  system: string;
  signal?: AbortSignal;
}): AsyncGenerator<ClaudeStreamEvent> {
  const res = await fetch("/api/claude/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    yield {
      type: "error",
      error: text || `Stream request failed (${res.status})`,
    };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const idx = buffer.indexOf("\n\n");
        if (idx === -1) break;
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const line = raw
          .split("\n")
          .map((l) => l.trimEnd())
          .find((l) => l.startsWith("data:"));
        if (!line) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          yield { type: "done" };
          return;
        }

        // Server may emit {type:"error",...}
        if (data.startsWith("{")) {
          try {
            const evt = JSON.parse(data);
            if (evt?.type === "error") {
              yield { type: "error", error: String(evt.error || "Stream error") };
              continue;
            }

            // Anthropic events: forward text deltas only
            // Typical delta is in content_block_delta.delta.text
            const textDelta =
              evt?.delta?.text ??
              evt?.content_block?.text ??
              evt?.content_block_delta?.delta?.text ??
              evt?.content_block_delta?.text ??
              "";
            if (typeof textDelta === "string" && textDelta.length) {
              yield { type: "chunk", textDelta };
            }
          } catch {
            // ignore JSON parse errors for non-JSON lines
          }
        }
      }
    }
  } catch (e) {
    if ((e instanceof DOMException && e.name === "AbortError") || signal?.aborted) return;
    yield { type: "error", error: "Network stream interrupted" };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

export async function completeClaude({
  messages,
  system,
  signal,
}: {
  messages: Message[];
  system: string;
  signal?: AbortSignal;
}) {
  const res = await fetch("/api/claude/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Complete request failed (${res.status})`);
  }
  const data = (await res.json()) as { text: string };
  return data.text || "";
}

export function stripJsonFences(raw: string) {
  const t = raw.trim();
  if (t.startsWith("```")) {
    const withoutStart = t.replace(/^```(json)?/i, "").trimStart();
    const end = withoutStart.lastIndexOf("```");
    if (end !== -1) return withoutStart.slice(0, end).trim();
  }
  return t;
}

