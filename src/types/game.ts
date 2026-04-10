export type Role = "citizen" | "coordinator" | "official";

export type DisasterType =
  | "earthquake"
  | "flash_flood"
  | "urban_fire"
  | "cyclone"
  | "pandemic"
  | "chemical_spill"
  | "tsunami"
  | "power_grid_failure";

export type ThreatLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Choice {
  id: string;
  label: string;
  subtext: string;
  riskLevel: "low" | "medium" | "high" | "unknown";
}

export interface LogEntry {
  timestamp: string;
  type: "decision" | "consequence" | "event" | "system";
  text: string;
  livesImpact: number;
}

export interface Resources {
  ambulances: { total: number; available: number };
  rescueTeams: { total: number; available: number };
  helicopters: { total: number; available: number };
  budget: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface GameState {
  sessionId: string;
  phase: "idle" | "intro" | "active" | "escalating" | "debrief";
  role: Role | null;
  disaster: DisasterType | null;
  round: number;
  maxRounds: number;
  livesSaved: number;
  livesLost: number;
  xp: number;
  threatLevel: ThreatLevel;
  timeRemaining: number;
  narratorText: string;
  isStreaming: boolean;
  choices: Choice[];
  eventLog: LogEntry[];
  resources: Resources | null;
  debriefReport: string | null;
  conversationHistory: Message[];
}

