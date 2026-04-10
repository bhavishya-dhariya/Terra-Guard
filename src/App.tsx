import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoleSelectPage from "./pages/RoleSelectPage";
import GamePage from "./pages/GamePage";
import DebriefPage from "./pages/DebriefPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { GameProvider } from "./context/GameContext";
import { useEffect, useState } from "react";

function RouteFade({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [stage, setStage] = useState<"in" | "out">("in");

  useEffect(() => {
    setStage("out");
    const t = window.setTimeout(() => setStage("in"), 40);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className={stage === "in" ? "page-in" : "page-out"}>{children}</div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <RouteFade>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<RoleSelectPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/debrief" element={<DebriefPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteFade>
    </GameProvider>
  );
}

