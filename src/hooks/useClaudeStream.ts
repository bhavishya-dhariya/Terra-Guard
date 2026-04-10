import { useCallback, useMemo, useRef, useState } from "react";
import type { Message } from "../types/game";
import { streamClaude } from "../lib/claudeClient";

export function useClaudeStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(
    async ({ messages, system }: { messages: Message[]; system: string }) => {
      stop();
      setIsStreaming(true);
      setText("");
      setError(null);

      const ac = new AbortController();
      abortRef.current = ac;

      for await (const evt of streamClaude({ messages, system, signal: ac.signal })) {
        if (evt.type === "chunk") setText((t) => t + evt.textDelta);
        if (evt.type === "error") {
          setError(evt.error);
          break;
        }
        if (evt.type === "done") break;
      }

      setIsStreaming(false);
      abortRef.current = null;
    },
    [stop]
  );

  return useMemo(
    () => ({
      isStreaming,
      text,
      error,
      start,
      stop,
    }),
    [isStreaming, text, error, start, stop]
  );
}

