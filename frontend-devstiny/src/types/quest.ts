export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type QuestTier = 1 | 2 | 3;
export type QuestCharacter = "ferrus" | "lyra" | "somers";

export interface TestCase {
  description: string;
  args: unknown[];
  expected: unknown;
}

export interface Quest {
  id: string;
  slug: string;
  title: string;
  tier: QuestTier;
  character: QuestCharacter;
  loreHook: string;
  starterCode: string;
  functionName: string;
  concepts: string[];
  testCases: TestCase[];
  rewards: {
    xp: number;
    gold: number;
    badge: string;
    item?: string;
  };
}

export interface TestResult {
  description: string;
  passed: boolean;
  result: unknown;
  expected: unknown;
  error: string | null;
}
