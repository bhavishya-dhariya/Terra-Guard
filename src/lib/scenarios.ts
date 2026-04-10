import type { DisasterType, Resources } from "../types/game";

export type ScenarioSeed = {
  id: DisasterType;
  name: string;
  emoji: string;
  tagline: string;
  mechanic: string;
  defaultResources: Resources;
  initialContext: string;
  difficulty: 1 | 2 | 3;
};

const baseCoordinatorResources = (overrides?: Partial<Resources>): Resources => ({
  ambulances: { total: 3, available: 3 },
  rescueTeams: { total: 2, available: 2 },
  helicopters: { total: 1, available: 1 },
  budget: 2_000_000,
  ...overrides,
});

export const SCENARIOS: ScenarioSeed[] = [
  {
    id: "earthquake",
    name: "EARTHQUAKE",
    emoji: "🌍",
    tagline: "Aftershock timer. Structural collapse cascade.",
    mechanic:
      "Aftershocks can invalidate safe routes; delayed evacuations can turn survivable zones into mass-casualty traps.",
    defaultResources: baseCoordinatorResources(),
    initialContext:
      "A 6.8 magnitude earthquake struck 12 minutes ago. Aftershocks expected within 30 minutes. Multiple structural collapses reported across Sectors 2, 5, and 8.",
    difficulty: 3,
  },
  {
    id: "flash_flood",
    name: "FLASH FLOOD",
    emoji: "🌊",
    tagline: "Rising water. Roads cut off.",
    mechanic:
      "Water rises unpredictably; road access collapses in minutes, forcing reroutes and high-risk rescues.",
    defaultResources: baseCoordinatorResources({ rescueTeams: { total: 3, available: 3 } }),
    initialContext:
      "Unprecedented rainfall has overwhelmed drainage systems. Water levels rising 30cm per hour. Low-lying Sectors 1, 3, and 9 are already inaccessible by road.",
    difficulty: 2,
  },
  {
    id: "urban_fire",
    name: "URBAN FIRE",
    emoji: "🔥",
    tagline: "Wind shift. Spread modelling.",
    mechanic:
      "Wind shifts can turn containment into catastrophe; prioritize firebreaks and evacuations before corridors collapse.",
    defaultResources: baseCoordinatorResources({ ambulances: { total: 4, available: 4 } }),
    initialContext:
      "A fast-moving urban fire has breached initial containment lines. Wind gusts are expected to shift within the next 10 minutes. Dense housing blocks in Sectors 6 and 7 are at immediate risk.",
    difficulty: 3,
  },
  {
    id: "cyclone",
    name: "CYCLONE",
    emoji: "🌀",
    tagline: "Landfall countdown. Shelter overflow.",
    mechanic:
      "Landfall timing forces irreversible choices; shelters overflow, transport routes close, and late decisions become fatal.",
    defaultResources: baseCoordinatorResources({ helicopters: { total: 2, available: 2 } }),
    initialContext:
      "A severe cyclone is 4 hours from landfall. Coastal Sectors 2, 4, and 5 face storm surge. Shelters are already near capacity and evacuation roads are degrading.",
    difficulty: 3,
  },
  {
    id: "pandemic",
    name: "PANDEMIC",
    emoji: "🦠",
    tagline: "R-value spread. Hospital overflow.",
    mechanic:
      "Small policy changes compound rapidly; hospital overflow triggers secondary death spirals across unrelated emergencies.",
    defaultResources: baseCoordinatorResources({ budget: 2_500_000 }),
    initialContext:
      "A novel respiratory virus is spreading with accelerating R-value. Hospital occupancy is at 88% and rising. Rumors and misinformation are causing panic-driven surges at clinics in Sectors 3 and 8.",
    difficulty: 2,
  },
  {
    id: "chemical_spill",
    name: "CHEMICAL SPILL",
    emoji: "☣",
    tagline: "Plume direction. Evacuation zones.",
    mechanic:
      "Plume direction shifts with wind; wrong evacuation routes push civilians into exposure.",
    defaultResources: baseCoordinatorResources(),
    initialContext:
      "An industrial tanker has ruptured near Sector 5, releasing a toxic chemical. Wind is pushing the plume northeast. Initial reports indicate burns and respiratory distress across a 6-block radius.",
    difficulty: 2,
  },
  {
    id: "tsunami",
    name: "TSUNAMI",
    emoji: "🌊",
    tagline: "Wave ETA. Coastal triage.",
    mechanic:
      "Wave ETA compresses decision windows; early evacuation saves thousands, late orders cause gridlock and drownings.",
    defaultResources: baseCoordinatorResources({ rescueTeams: { total: 3, available: 3 } }),
    initialContext:
      "A major offshore quake has triggered tsunami warnings. First wave ETA is 18 minutes. Coastal Sectors 1 and 2 are evacuating but traffic is already backing up through Sector 3.",
    difficulty: 3,
  },
  {
    id: "power_grid_failure",
    name: "POWER GRID FAILURE",
    emoji: "⚡",
    tagline: "Cascading outages. Hospital backup.",
    mechanic:
      "Outages cascade through dependent systems; hospitals, comms, and water treatment fail in sequence if stabilization is delayed.",
    defaultResources: baseCoordinatorResources({ ambulances: { total: 3, available: 3 } }),
    initialContext:
      "A substation failure has triggered cascading outages across the city. Hospitals report backup power at 40% capacity. Cell towers are degrading and water pumping stations are at risk in Sectors 4 and 9.",
    difficulty: 1,
  },
];

export function getScenario(id: DisasterType) {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}

