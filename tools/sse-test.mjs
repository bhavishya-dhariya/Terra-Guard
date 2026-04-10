const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 20000);

const res = await fetch("http://localhost:3001/api/claude/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content:
          "Return only valid JSON for one round with 4 choices A-D and correct schema.",
      },
    ],
    system: "Return valid JSON only. No markdown.",
  }),
  signal: ctrl.signal,
});

if (!res.ok) {
  console.error("HTTP", res.status, await res.text());
  process.exit(1);
}

const reader = res.body.getReader();
const dec = new TextDecoder();
let buf = "";

try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    if (buf.includes("[DONE]")) break;
  }
} catch (e) {
  console.error("READ_ERR", e?.name || "", e?.message || e);
} finally {
  console.log(buf.slice(0, 2000));
}

