export type ThemeMode = 'institutional-light' | 'institutional-dark' | 'blackboard';

export type LayoutMode = 'auto' | 'column' | 'grid';

export interface BoardConfig {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  intervalMinutes: number;
  theme: ThemeMode;
  layoutMode: LayoutMode;
  baseDateStr: string; // "YYYY-MM-DD"
}

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  pausedAt: number | null; // epoch ms when paused
  accumulatedPauseOffsetMs: number; // offset added when compensating pause
  startedAt: number | null;
}

export interface TimeSlot {
  id: string;
  timeStr: string;
  timestamp: number; // target epoch ms for this slot
  isCurrent: boolean;
  isPassed: boolean;
  isUpcoming: boolean;
}

export type BoardStatus = 'idle' | 'waiting' | 'running' | 'finished';
