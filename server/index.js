import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHindsightService } from "./hindsightService.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

const port = Number(process.env.PORT || 3001);
const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!geminiKey) {
  // Keep server running for local dev; endpoints will return 500 with clear message.
  console.warn("Missing GEMINI_API_KEY in environment.");
}

const genAI = new GoogleGenerativeAI(geminiKey || "missing");
const hindsight = createHindsightService(process.env);

function safeErrorMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Error";
  try {
    return JSON.stringify(err);
  } catch {
    return "Error";
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

async function groqComplete({ messages, system, max_tokens = 1500 }) {
  if (!groqKey) throw new Error("Missing GROQ_API_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens,
      stream: false,
    }),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(text || `Groq error (${res.status})`);
  }
  const json = JSON.parse(text);
  return String(json?.choices?.[0]?.message?.content || "");
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content ?? "") }],
  }));
}

app.post("/api/claude/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  // Ensure headers are sent immediately (so clients don't hang waiting for first chunk)
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  res.write(":\n\n");

  const { messages, system } = req.body || {};
  if (!geminiKey) {
    res.write(`data: ${JSON.stringify({ type: "error", error: "Server missing GEMINI_API_KEY" })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }
  if (!Array.isArray(messages) || typeof system !== "string") {
    res.status(400);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: "Invalid body. Expected { messages: Message[], system: string }",
      })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  let closed = false;
  req.on("close", () => {
    closed = true;
  });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: { role: "system", parts: [{ text: system }] },
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    });

    const result = await model.generateContentStream({
      contents: toGeminiContents(messages),
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
    });

    const iter = result.stream[Symbol.asyncIterator]();
    const first = await Promise.race([
      iter.next(),
      new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 6000)),
    ]);

    if (first && first.timeout) {
      // Fallback: if streaming takes too long to produce first bytes, use non-streaming generation.
      const out = await model.generateContent({
        contents: toGeminiContents(messages),
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      });
      const text = out.response.text() || "";
      res.write(`data: ${JSON.stringify({ delta: { text } })}\n\n`);
    } else {
      const firstChunk = first;
      if (firstChunk && firstChunk.value && !firstChunk.done) {
        const t = firstChunk.value.text();
        if (t) res.write(`data: ${JSON.stringify({ delta: { text: t } })}\n\n`);
      }

      while (true) {
        if (closed) break;
        const next = await iter.next();
        if (next.done) break;
        const text = next.value.text();
        if (!text) continue;
        res.write(`data: ${JSON.stringify({ delta: { text } })}\n\n`);
      }
    }
  } catch (err) {
    const message = safeErrorMessage(err);
    const quotaLike = /quota|resource_exhausted|429|rate/i.test(message);
    if (!closed && quotaLike && groqKey) {
      try {
        const text = await groqComplete({ messages, system, max_tokens: 1500 });
        res.write(`data: ${JSON.stringify({ delta: { text } })}\n\n`);
      } catch (e2) {
        res.write(`data: ${JSON.stringify({ type: "error", error: safeErrorMessage(e2) })}\n\n`);
      }
    } else if (!closed) {
      res.write(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`);
    }
  } finally {
    if (!closed) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

app.post("/api/claude/complete", async (req, res) => {
  const { messages, system } = req.body || {};
  if (!geminiKey) {
    return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
  }
  if (!Array.isArray(messages) || typeof system !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid body. Expected { messages: Message[], system: string }" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: { role: "system", parts: [{ text: system }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });
    const out = await model.generateContent({
      contents: toGeminiContents(messages),
      generationConfig: { responseMimeType: "application/json", temperature: 0.5 },
    });
    const text = out.response.text() || "";
    return res.json({ text, raw: null });
  } catch (err) {
    const message = safeErrorMessage(err);
    const quotaLike = /quota|resource_exhausted|429|rate/i.test(message);
    if (quotaLike && groqKey) {
      try {
        const text = await groqComplete({ messages, system, max_tokens: 2000 });
        return res.json({ text, raw: null });
      } catch (e2) {
        return res.status(500).json({ error: safeErrorMessage(e2) });
      }
    }
    return res.status(500).json({ error: message });
  }
});

// Hindsight memory proxy routes (graceful degradation)
app.post("/api/memory/init", async (_req, res) => {
  try {
    const out = await hindsight.ensureBank();
    return res.json({ ok: true, bankId: hindsight.bankId, out });
  } catch (err) {
    return res.status(200).json({ ok: false, error: safeErrorMessage(err) });
  }
});

app.post("/api/memory/retain", async (req, res) => {
  const { content, type } = req.body || {};
  try {
    await hindsight.ensureBank();
    const out = await hindsight.retain(String(content || ""), String(type || "experience_fact"));
    return res.json({ ok: true, out });
  } catch (err) {
    return res.status(200).json({ ok: false, error: safeErrorMessage(err) });
  }
});

app.post("/api/memory/recall", async (req, res) => {
  const { query } = req.body || {};
  try {
    await hindsight.ensureBank();
    const out = await hindsight.recall(String(query || ""));
    return res.json({ ok: true, out });
  } catch (err) {
    return res.status(200).json({ ok: false, error: safeErrorMessage(err) });
  }
});

app.post("/api/memory/reflect", async (req, res) => {
  const { query } = req.body || {};
  try {
    await hindsight.ensureBank();
    const out = await hindsight.reflect(String(query || ""));
    return res.json({ ok: true, out });
  } catch (err) {
    return res.status(200).json({ ok: false, error: safeErrorMessage(err) });
  }
});

app.listen(port, () => {
  console.log(`Crisis Command server listening on http://localhost:${port}`);
});

