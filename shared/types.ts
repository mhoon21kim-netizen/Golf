/**
 * 공통 타입 정의
 * 프론트엔드와 백엔드에서 공유
 */

// 단계 레벨
export enum Level {
  Lv1 = 1,
  Lv2 = 2,
  Lv3 = 3,
}

// 판정 결과
export enum JudgmentResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

// 실패 타입
export enum FailureType {
  NONE = 'NONE',
  GRIP_WEAK = 'GRIP_WEAK',
  ADDRESS_UNSTABLE = 'ADDRESS_UNSTABLE',
  SLICE = 'SLICE',
  RHYTHM_UNSTABLE = 'RHYTHM_UNSTABLE',
  FAT_SHOT = 'FAT_SHOT',
  TOPPING = 'TOPPING',
}

// 판정 요청
export interface JudgmentRequest {
  level: Level;
  videoFile: File | string; // 프론트엔드: File, 백엔드: 경로
  metadata?: {
    clubType?: string;
    shotType?: string;
  };
}

// 판정 응답
export interface JudgmentResponse {
  result: JudgmentResult;
  failureType: FailureType;
  feedback: Feedback;
  metrics: Metrics;
  timestamp: string;
}

// 피드백
export interface Feedback {
  problem: string;
  reason: string;
  todayPractice: string;
}

// 측정 지표
export interface Metrics {
  spineAngleVariance?: number; // Lv1
  clubPath?: number; // Lv2
  weightShift?: number; // Lv3
  [key: string]: number | undefined;
}

// Day Sheet 항목
export interface DaySheetEntry {
  date: string;
  level: Level;
  result: JudgmentResult;
  failureType: FailureType;
  attemptCount: number;
}

// 사용자 진행 상태
export interface UserProgress {
  currentLevel: Level;
  daySheets: DaySheetEntry[];
  totalDays: number;
  consecutiveDays: number;
}

// 단계별 기준
export interface LevelCriteria {
  level: Level;
  passThresholds: {
    spineAngleVariance?: number;
    clubPath?: { min: number; max: number };
    weightShift?: number;
  };
}

