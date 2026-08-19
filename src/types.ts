export type ActiveView = 
  | 'student_entry'
  | 'game1_mcq'
  | 'game2_truefalse'
  | 'game3_dragdrop'
  | 'game4_speed'
  | 'results_evaluation'
  | 'my_ranking'
  | 'class_leaderboard'
  | 'admin_panel'
  | 'handbook';

export interface StudentInfo {
  fullName: string;
  schoolOrOrg: string;
  studentId: string;
  avatar: string;
  startedAt: string;
}

export interface ScoreState {
  game1: {
    score: number; // Max 25
    answeredCount: number;
    answers: Record<string, string>; // qId -> selectedOption
    isCompleted: boolean;
  };
  game2: {
    score: number; // Max 25
    answeredCount: number;
    answers: Record<string, boolean>; // qId -> true/false
    isCompleted: boolean;
  };
  game3: {
    score: number; // Max 25
    matches: Record<string, string>; // itemId -> targetZoneId
    isCompleted: boolean;
  };
  game4: {
    score: number; // Max 25
    answeredCount: number;
    correctCount: number;
    answers: Record<string, string>;
    isCompleted: boolean;
  };
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  fullName: string;
  schoolOrOrg: string;
  avatar: string;
  scores: {
    game1: number;
    game2: number;
    game3: number;
    game4: number;
    totalScore: number;
  };
  completionStatus: {
    game1Completed: boolean;
    game2Completed: boolean;
    game3Completed: boolean;
    game4Completed: boolean;
    completedGamesCount: number;
    percentage: number;
  };
  tier: 'Đạt' | 'Chưa đạt' | 'Đang thực hiện';
  startedAt: string;
  updatedAt: string;
}

export interface LeaderboardStats {
  totalStudents: number;
  completedStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  averageTotalScore: number;
  averageGame1: number;
  averageGame2: number;
  averageGame3: number;
  averageGame4: number;
}

export interface MCQQuestion {
  id: string;
  title: string;
  scenario: string;
  bloomLevel: string;
  points: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  pedagogicalInsight: string;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  context: string;
  isTrue: boolean;
  points: number;
  explanation: string;
  keyRule: string;
}

export interface DragDropItem {
  id: string;
  label: string;
  description: string;
  correctZoneId: string;
}

export interface DragDropZone {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

export interface SpeedQuestion {
  id: string;
  prompt: string;
  scenarioTag: string;
  points: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  quickExplanation: string;
}

export interface EvaluationResult {
  totalScore: number;
  percentage: number;
  tier: 'Đạt' | 'Chưa đạt';
  title: string;
  color: string;
  strengths: string[];
  growthAreas: string[];
  recommendation: string;
}

// Legacy types support
export type GameMode = 'campaign' | 'hallucination_hunter' | 'prompt_battle' | 'rubric_matcher' | 'speed_sorter' | 'gemini_live' | 'handbook' | 'analytics';

export interface UserStats {
  exp: number;
  level: number;
  rankTitle: string;
  streak: number;
  highestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  badges: string[];
  stageProgress: Record<string, boolean>;
  competencyScores: {
    assessmentTheory: number;
    ethicsAndIntegrity: number;
    promptCrafting: number;
    rubricDesign: number;
    practicalAIIntegration: number;
  };
}

export interface QuestionItem {
  id: string;
  stage?: number;
  level?: number | string;
  stageName?: string;
  topic?: string;
  type?: string;
  difficulty?: string;
  visualType?: any;
  visualData?: any;
  title: string;
  scenario: string;
  question: string;
  bloomLevel: string;
  diagramType?: 'bloom' | 'hallucination_meter' | 'socrate_loop' | 'rubric_grid' | 'samr_ladder';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    rationale: string;
  }[];
  pedagogicalInsight: string;
  proTip?: string;
}

export interface HallucinationChallenge {
  id: string;
  title: string;
  subject?: string;
  context: string;
  aiOutputSnippet?: string[];
  flawedIndex?: number;
  flawType?: string;
  explanation?: string;
  correctAlternative?: string;
  aiOutput?: string;
  hallucinatedSegments?: {
    segmentId: string;
    text: string;
    errorType: 'factual_error' | 'math_error' | 'pedagogical_bias' | 'fabricated_citation';
    explanation: string;
  }[];
  expertCorrection?: string;
}

export interface RubricMatchItem {
  id: string;
  aiUseLevel: string;
  criterionTitle: string;
  descriptor: string;
  pointsRange?: string;
  points?: number;
}

export interface SpeedSortCard {
  id: string;
  text: string;
  correctCategory: string;
  explanation: string;
}

export interface PromptChallenge {
  id: string;
  title?: string;
  taskTitle?: string;
  objective?: string;
  scenarioGoal?: string;
  badPromptExample?: string;
  customAllowed?: boolean;
  presetOptions?: {
    id: string;
    label?: string;
    promptText: string;
    score?: number;
    rating?: number;
    feedback?: string;
    analysis?: string;
  }[];
  samplePrompts?: {
    id: string;
    name: string;
    promptText: string;
    pedagogicalScore: number;
    pros: string;
    cons: string;
  }[];
}
