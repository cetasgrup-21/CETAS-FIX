import { Metadata } from "next";
import { TournamentHubView } from "@/components/tournament-hub/tournament-hub-view";

export const metadata: Metadata = {
  title: "Tournament Hub Live | CETAS Next-Gen",
  description:
    "Centralized Electronic Tournament & Award System (CETAS) Next-Gen Live Hub: Leaderboard Realtime, 3D Podium, Stage Tracker, & Radar Analisis Juri.",
};

export default function TournamentHubPage() {
  return <TournamentHubView />;
}
