import type { Difficulty } from "@/types/quest";

export type NodeStatus = "available" | "locked" | "completed";

export interface RoadmapNodeData {
  step: number;
  icon: string;
  iconColor: string;
  title: string;
  type: string;
  typeColor: string;
  typeBg: string;
  desc: string;
  skills: string[];
  xp: number;
  duration: string;
  difficulty: Difficulty;
  status: NodeStatus;
  btnClass: string;
}
