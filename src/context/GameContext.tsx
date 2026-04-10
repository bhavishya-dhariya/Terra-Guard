import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Choice, DisasterType, GameState, LogEntry, Message, Role, ThreatLevel } from "../types/game";
import { buildDebriefSystemPrompt, buildSystemPrompt } from "../lib/prompts";
import { completeClaude, stripJsonFences, streamClaude } from "../lib/claudeClient";
import { calculateEndGameBonus, calculateRoundXp, gradeFromSurvivalRate, survivalRate } from "../lib/scoring";
import { getScenario } from "../lib/scenarios";
import { useHindsight } from "../hooks/useHindsight";

type ParsedRound = {
  narration: string;
  livesSaved: number;
  livesLost: number;
  threatDelta: number;
  surpriseEvent: string | null;
  choices: Choice[];
  roundComplete: boolean;
  gameOver: boolean;
};

type GameAction =
  | { type: "RESET" }
  | { type: "CONFIGURE"; role: Role; disaster: DisasterType }
  | { type: "SET_PHASE"; phase: GameState["phase"] }
  | { type: "SET_STREAMING"; isStreaming: boolean }
  | { type: "STREAM_SET_TEXT"; text: string }
  | { type: "STREAM_APPEND"; delta: string }
  | { type: "SET_CHOICES"; choices: Choice[] }
  | { type: "SET_HISTORY"; history: Message[] }
  | { type: "SET_SURPRISE"; surprise: string | null }
  | { type: "SET_INTEL"; intel: string[] }
  | { type: "APPEND_LOG"; entry: LogEntry }
  | {
      type: "APPLY_ROUND";
      parsed: ParsedRound;
      xpDelta: number;
      threatLevel: ThreatLevel;
      round: number;
    }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_DEBRIEF"; report: string }
  | { type: "SET_TIME_REMAINING"; seconds: number }
  | { type: "SET_SESSION"; sessionId: string }
  | { type: "SET_RESOURCES_FOR_ROLE" };

type InternalState = GameState & {
  error: string | null;
  maxThreatReached: ThreatLevel;
  currentSurpriseEvent: string | null;
  commanderIntel: string[];
};

function clampThreat(n: number): ThreatLevel {
  const v = Math.max(1, Math.min(10, Math.round(n)));
  return v as ThreatLevel;
}

function nowIso() {
  return new Date().toISOString();
}

function newSessionId() {
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `CC-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

const initialState: InternalState = {
  sessionId: newSessionId(),
  phase: "idle",
  role: null,
  disaster: null,
  round: 0,
  maxRounds: 10,
  livesSaved: 0,
  livesLost: 0,
  xp: 0,
  threatLevel: 1,
  maxThreatReached: 1,
  timeRemaining: 30,
  narratorText: "",
  isStreaming: false,
  choices: [],
  eventLog: [],
  resources: null,
  debriefReport: null,
  conversationHistory: [],
  error: null,
  currentSurpriseEvent: null,
  commanderIntel: [],
};

function reducer(state: InternalState, action: GameAction): InternalState {
  switch (action.type) {
    case "RESET":
      return { ...initialState, sessionId: newSessionId() };
    case "SET_SESSION":
      return { ...state, sessionId: action.sessionId };
    case "CONFIGURE":
      return {
        ...state,
        role: action.role,
        disaster: action.disaster,
        phase: "idle",
        round: 0,
        livesSaved: 0,
        livesLost: 0,
        xp: 0,
        threatLevel: 1,
        maxThreatReached: 1,
        narratorText: "",
        isStreaming: false,
        choices: [],
        eventLog: [],
        debriefReport: null,
        conversationHistory: [],
        error: null,
      };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.isStreaming };
    case "STREAM_SET_TEXT":
      return { ...state, narratorText: action.text };
    case "STREAM_APPEND":
      return { ...state, narratorText: state.narratorText + action.delta };
    case "SET_CHOICES":
      return { ...state, choices: action.choices };
    case "SET_HISTORY":
      return { ...state, conversationHistory: action.history };
    case "SET_SURPRISE":
      return { ...state, currentSurpriseEvent: action.surprise };
    case "SET_INTEL":
      return { ...state, commanderIntel: action.intel };
    case "APPEND_LOG":
      return { ...state, eventLog: [action.entry, ...state.eventLog].slice(0, 200) };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_DEBRIEF":
      return { ...state, debriefReport: action.report };
    case "SET_TIME_REMAINING":
      return { ...state, timeRemaining: action.seconds };
    case "SET_RESOURCES_FOR_ROLE": {
      if (!state.role || !state.disaster) return state;
      if (state.role !== "coordinator" && state.role !== "official") {
        return { ...state, resources: null };
      }
      const seed = getScenario(state.disaster);
      return { ...state, resources: seed.defaultResources };
    }
    case "APPLY_ROUND": {
      const livesSaved = state.livesSaved + Math.max(0, action.parsed.livesSaved);
      const livesLost = state.livesLost + Math.max(0, action.parsed.livesLost);
      const maxThreatReached = clampThreat(Math.max(state.maxThreatReached, action.threatLevel));
      return {
        ...state,
        round: action.round,
        livesSaved,
        livesLost,
        xp: state.xp + action.xpDelta,
        threatLevel: action.threatLevel,
        maxThreatReached,
        choices: action.parsed.choices || [],
      };
    }
    default:
      return state;
  }
}

function parseRoundJson(rawText: string): ParsedRound {
  const cleaned = stripJsonFences(rawText);
  const parsed = JSON.parse(cleaned) as ParsedRound;
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON from model");
  if (!Array.isArray(parsed.choices) || parsed.choices.length !== 4) {
    throw new Error("Model must return exactly 4 choices");
  }
  return parsed;
}

type GameActions = {
  reset(): void;
  configure(role: Role, disaster: DisasterType): void;
  initGame(): Promise<void>;
  submitChoice(choiceId: string, opts?: { timeout?: boolean }): Promise<void>;
  tick(seconds: number): void;
  generateDebrief(): Promise<void>;
};

export const GameContext = createContext<{
  state: InternalState;
  dispatch: React.Dispatch<GameAction>;
  actions: GameActions;
}>({
  state: initialState,
  dispatch: () => undefined,
  actions: {
    reset: () => undefined,
    configure: () => undefined,
    initGame: async () => undefined,
    submitChoice: async () => undefined,
    tick: () => undefined,
    generateDebrief: async () => undefined,
  },
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const roundStartMsRef = useRef<number | null>(null);
  const hindsight = useHindsight();

  useEffect(() => {
    if (state.role && state.disaster) return;
    try {
      const raw = localStorage.getItem("crisiscommand_last_config");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { role?: Role; disaster?: DisasterType };
      if (parsed?.role && parsed?.disaster) {
        dispatch({ type: "CONFIGURE", role: parsed.role, disaster: parsed.disaster });
        dispatch({ type: "SET_RESOURCES_FOR_ROLE" });
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const configure = useCallback((role: Role, disaster: DisasterType) => {
    dispatch({ type: "CONFIGURE", role, disaster });
    dispatch({ type: "SET_RESOURCES_FOR_ROLE" });
  }, []);

  const tick = useCallback((seconds: number) => {
    dispatch({ type: "SET_TIME_REMAINING", seconds });
  }, []);

  const initGame = useCallback(async () => {
    if (!state.role || !state.disaster) {
      dispatch({ type: "SET_ERROR", error: "Missing role/disaster selection." });
      return;
    }

    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_PHASE", phase: "intro" });
    dispatch({ type: "SET_CHOICES", choices: [] });
    dispatch({ type: "STREAM_SET_TEXT", text: "" });
    dispatch({ type: "SET_SURPRISE", surprise: null });
    dispatch({ type: "SET_STREAMING", isStreaming: true });

    const baseSystem = buildSystemPrompt({
      role: state.role,
      disaster: state.disaster,
      resources: state.resources,
    });

    const recalls = hindsight.isReady
      ? await Promise.all([
          hindsight.recall("player decision patterns and past mistakes in disaster scenarios"),
          hindsight.recall(`previous ${state.disaster} scenario performance`),
        ])
      : [[], []];

    const flattened = recalls.flat().filter(Boolean);
    const intelLines = flattened.slice(0, 3).map((x) => (x.length > 84 ? x.slice(0, 84) + "…" : x));
    dispatch({ type: "SET_INTEL", intel: intelLines });

    const historyBlock =
      flattened.length > 0
        ? `\n\nPLAYER HISTORY (from memory bank):\n${flattened
            .slice(0, 6)
            .map((l) => `- ${l}`)
            .join("\n")}\nUse this to personalize the scenario difficulty and narration.\nIf the player has failed evacuation decisions before, reference it.\nIf this is their first session, treat them as a newcomer.\n`
        : `\n\nPLAYER HISTORY (from memory bank):\nFirst session or memory bank offline.\n`;

    const system = baseSystem + historyBlock;

    const firstUser: Message = {
      role: "user",
      content: `Begin the ${state.disaster} scenario. I am playing as ${state.role}. Set the scene and give me my first decision.`,
    };

    const history: Message[] = [firstUser];
    dispatch({
      type: "APPEND_LOG",
      entry: { timestamp: nowIso(), type: "system", text: "SECURE LINK ESTABLISHED", livesImpact: 0 },
    });

    let full = "";
    for await (const evt of streamClaude({ messages: history, system })) {
      if (evt.type === "chunk") {
        full += evt.textDelta;
        dispatch({ type: "STREAM_APPEND", delta: evt.textDelta });
      }
      if (evt.type === "error") {
        dispatch({ type: "SET_ERROR", error: evt.error });
        break;
      }
      if (evt.type === "done") break;
    }

    dispatch({ type: "SET_STREAMING", isStreaming: false });

    try {
      const parsed = parseRoundJson(full);
      dispatch({
        type: "SET_HISTORY",
        history: [
          ...history,
          { role: "assistant", content: full },
        ],
      });
      dispatch({ type: "STREAM_SET_TEXT", text: parsed.narration });
      dispatch({ type: "SET_SURPRISE", surprise: parsed.surpriseEvent ?? null });
      const nextThreat = clampThreat(state.threatLevel + (parsed.threatDelta ?? 0));
      const xpDelta = calculateRoundXp({
        livesSavedDelta: parsed.livesSaved ?? 0,
        livesLostDelta: parsed.livesLost ?? 0,
        decisionTimeSeconds: 30,
        timeout: false,
        perfectRound: (parsed.livesLost ?? 0) === 0,
      });
      dispatch({
        type: "APPLY_ROUND",
        parsed,
        xpDelta,
        threatLevel: nextThreat,
        round: 1,
      });
      dispatch({
        type: "APPEND_LOG",
        entry: { timestamp: nowIso(), type: "event", text: parsed.narration, livesImpact: 0 },
      });
      if (parsed.surpriseEvent) {
        dispatch({
          type: "APPEND_LOG",
          entry: { timestamp: nowIso(), type: "event", text: `SURPRISE: ${parsed.surpriseEvent}`, livesImpact: 0 },
        });
      }

      roundStartMsRef.current = performance.now();
      dispatch({ type: "SET_PHASE", phase: "active" });
      dispatch({ type: "SET_TIME_REMAINING", seconds: 30 });

      hindsight.retain({
        type: "experience_fact",
        content: `Round 1: Player started ${state.disaster} as ${state.role}. Result: ${parsed.livesSaved} saved, ${parsed.livesLost} lost. Threat level: ${nextThreat}. Time taken: 0s.`,
      });
      if (parsed.surpriseEvent) {
        hindsight.retain({
          type: "world_fact",
          content: `Surprise event in round 1: "${parsed.surpriseEvent}"`,
        });
      }
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: e instanceof Error ? e.message : "Failed to parse model JSON." });
    }
  }, [state.role, state.disaster, state.resources, state.threatLevel, hindsight]);

  const submitChoice = useCallback(
    async (choiceId: string, opts?: { timeout?: boolean }) => {
      if (!state.role || !state.disaster) return;
      if (state.isStreaming) return;
      if (state.round <= 0) return;

      const timeout = Boolean(opts?.timeout);
      const choice = state.choices.find((c) => c.id === choiceId) ?? state.choices[3];
      if (!choice) return;

      const elapsedSec =
        roundStartMsRef.current == null ? 30 : Math.max(0, (performance.now() - roundStartMsRef.current) / 1000);

      dispatch({
        type: "APPEND_LOG",
        entry: {
          timestamp: nowIso(),
          type: "decision",
          text: timeout ? `TIMEOUT → AUTO-SELECT: ${choice.id} — ${choice.label}` : `CHOICE ${choice.id}: ${choice.label}`,
          livesImpact: 0,
        },
      });
      dispatch({ type: "SET_CHOICES", choices: [] });
      dispatch({ type: "STREAM_SET_TEXT", text: "" });
      dispatch({ type: "SET_SURPRISE", surprise: null });
      dispatch({ type: "SET_STREAMING", isStreaming: true });
      dispatch({ type: "SET_ERROR", error: null });

      const system = buildSystemPrompt({
        role: state.role,
        disaster: state.disaster,
        resources: state.resources,
      });

      const history: Message[] = [
        ...state.conversationHistory,
        { role: "user", content: `The player chose: ${choice.label}. Continue the simulation.` },
      ];

      let full = "";
      for await (const evt of streamClaude({ messages: history, system })) {
        if (evt.type === "chunk") {
          full += evt.textDelta;
          dispatch({ type: "STREAM_APPEND", delta: evt.textDelta });
        }
        if (evt.type === "error") {
          dispatch({ type: "SET_ERROR", error: evt.error });
          break;
        }
        if (evt.type === "done") break;
      }

      dispatch({ type: "SET_STREAMING", isStreaming: false });

      try {
        const parsed = parseRoundJson(full);
        dispatch({
          type: "SET_HISTORY",
          history: [
            ...history,
            { role: "assistant", content: full },
          ],
        });
        dispatch({ type: "STREAM_SET_TEXT", text: parsed.narration });
        dispatch({ type: "SET_SURPRISE", surprise: parsed.surpriseEvent ?? null });
        const nextThreat = clampThreat(state.threatLevel + (parsed.threatDelta ?? 0));
        const xpDelta =
          calculateRoundXp({
            livesSavedDelta: parsed.livesSaved ?? 0,
            livesLostDelta: parsed.livesLost ?? 0,
            decisionTimeSeconds: elapsedSec,
            timeout,
            perfectRound: (parsed.livesLost ?? 0) === 0,
          });

        const nextRound = Math.min(state.maxRounds, state.round + 1);
        dispatch({
          type: "APPLY_ROUND",
          parsed,
          xpDelta,
          threatLevel: nextThreat,
          round: nextRound,
        });
        dispatch({
          type: "APPEND_LOG",
          entry: { timestamp: nowIso(), type: "consequence", text: parsed.narration, livesImpact: parsed.livesSaved - parsed.livesLost },
        });
        if (parsed.surpriseEvent) {
          dispatch({
            type: "APPEND_LOG",
            entry: { timestamp: nowIso(), type: "event", text: `SURPRISE: ${parsed.surpriseEvent}`, livesImpact: 0 },
          });
        }

        roundStartMsRef.current = performance.now();
        dispatch({ type: "SET_TIME_REMAINING", seconds: 30 });

        if (nextRound >= state.maxRounds || parsed.gameOver) {
          dispatch({ type: "SET_PHASE", phase: "debrief" });
        } else {
          dispatch({ type: "SET_PHASE", phase: nextThreat >= 8 ? "escalating" : "active" });
        }

        const decisionTime = Math.round(elapsedSec);
        hindsight.retain({
          type: "experience_fact",
          content: `Round ${nextRound}: Player chose "${choice.label}" in ${state.disaster} as ${state.role}. Result: ${parsed.livesSaved} saved, ${parsed.livesLost} lost. Threat level: ${nextThreat}. Time taken: ${decisionTime}s.`,
        });
        if (parsed.surpriseEvent) {
          hindsight.retain({
            type: "world_fact",
            content: `Surprise event in round ${nextRound}: "${parsed.surpriseEvent}"`,
          });
        }
      } catch (e) {
        dispatch({ type: "SET_ERROR", error: e instanceof Error ? e.message : "Failed to parse model JSON." });
      }
    },
    [
      state.role,
      state.disaster,
      state.isStreaming,
      state.round,
      state.choices,
      state.conversationHistory,
      state.resources,
      state.threatLevel,
      state.maxRounds,
      hindsight,
    ]
  );

  const generateDebrief = useCallback(async () => {
    if (!state.role || !state.disaster) return;
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_STREAMING", isStreaming: true });

    const rate = survivalRate(state.livesSaved, state.livesLost);
    const grade = gradeFromSurvivalRate(rate);
    const bonus = calculateEndGameBonus({ maxThreatReached: state.maxThreatReached });

    const system = buildDebriefSystemPrompt({
      sessionId: state.sessionId,
      role: state.role,
      disaster: state.disaster,
      date: new Date().toISOString().slice(0, 10),
    });

    const messages: Message[] = [
      ...state.conversationHistory,
      {
        role: "user",
        content: `Generate the after-action report now. Survival rate: ${(rate * 100).toFixed(1)}%. Grade: ${grade}. XP: ${state.xp + bonus}. Threat reached: ${state.maxThreatReached}/10.`,
      },
    ];

    try {
      const report = await completeClaude({ messages, system });

      hindsight.retain({
        type: "experience_fact",
        content: `Completed ${state.disaster} as ${state.role}. Final: ${state.livesSaved} saved, ${state.livesLost} lost. Grade: ${grade}. XP: ${state.xp + bonus}. Survival rate: ${(rate * 100).toFixed(1)}%. Peak threat: ${state.maxThreatReached}/10.`,
      });

      const reflection = hindsight.isReady
        ? await hindsight.reflect(
            "What patterns define this player's decision-making style? " +
              "What recurring mistakes have they made across sessions? " +
              "What specific improvement should they focus on next?"
          )
        : null;

      const appended = reflection
        ? `${report}\n\n━━ COMMANDER PROFILE (HINDSIGHT MEMORY) ━━\n${reflection}\n\nGenerated from your cross-session history`
        : report;

      dispatch({ type: "SET_DEBRIEF", report: appended });
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: e instanceof Error ? e.message : "Debrief failed." });
    } finally {
      dispatch({ type: "SET_STREAMING", isStreaming: false });
    }
  }, [state.role, state.disaster, state.sessionId, state.conversationHistory, state.livesSaved, state.livesLost, state.xp, state.maxThreatReached, hindsight]);

  const actions: GameActions = useMemo(
    () => ({ reset, configure, initGame, submitChoice, tick, generateDebrief }),
    [reset, configure, initGame, submitChoice, tick, generateDebrief]
  );

  const value = useMemo(() => ({ state, dispatch, actions }), [state, actions]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

