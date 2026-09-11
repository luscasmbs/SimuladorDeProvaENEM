import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BoardConfig,
  SessionState,
  ThemeMode,
  LayoutMode,
  BoardStatus,
  TimeSlot,
} from './types';
import {
  formatTimeHM,
  formatTimeHMS,
  generateTimeSlots,
  evaluateBoardSlots,
  getTodayDateStr,
  addMinutesToTimeString,
} from './utils/timeUtils';
import { BoardHeader } from './components/BoardHeader';
import { BoardView } from './components/BoardView';
import { ConfigScreen } from './components/ConfigScreen';
import { ControlsMenu } from './components/ControlsMenu';
import { ResumeModal } from './components/ResumeModal';
import { Settings } from 'lucide-react';

const STORAGE_CONFIG_KEY = 'quadro_horarios_config_v1';
const STORAGE_SESSION_KEY = 'quadro_horarios_session_v1';

export default function App() {
  // 1. Initial configuration
  const [config, setConfig] = useState<BoardConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const now = new Date();
    const currentHM = formatTimeHM(now);
    return {
      startTime: currentHM,
      endTime: addMinutesToTimeString(currentHM, 120), // default 2 hours
      intervalMinutes: 10,
      theme: 'institutional-light',
      layoutMode: 'auto',
      baseDateStr: getTodayDateStr(),
    };
  });

  // 2. Session state
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      isActive: false,
      isPaused: false,
      pausedAt: null,
      accumulatedPauseOffsetMs: 0,
      startedAt: null,
    };
  });

  // 3. UI states
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Save config to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Save session to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Clock tick (every 250ms for responsive updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === ' ' && session.isActive) {
        e.preventDefault();
        handleTogglePause();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsControlsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsControlsOpen(false);
        setIsResumeModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session.isActive, session.isPaused]);

  // Generate slots
  const { slots, startDate, endDate } = useMemo(() => {
    return generateTimeSlots(
      config.startTime,
      config.endTime,
      config.intervalMinutes,
      config.baseDateStr,
      session.accumulatedPauseOffsetMs
    );
  }, [
    config.startTime,
    config.endTime,
    config.intervalMinutes,
    config.baseDateStr,
    session.accumulatedPauseOffsetMs,
  ]);

  // Effective time for board evaluation (frozen if paused)
  const effectiveTimeMs = session.isPaused && session.pausedAt ? session.pausedAt : currentTimeMs;

  // Evaluate slots status
  const { visibleSlots, currentSlot, status } = useMemo(() => {
    if (!session.isActive) {
      return {
        visibleSlots: slots,
        currentSlot: null,
        status: 'idle' as BoardStatus,
      };
    }

    return evaluateBoardSlots(
      slots,
      effectiveTimeMs,
      startDate.getTime(),
      endDate.getTime()
    );
  }, [session.isActive, slots, effectiveTimeMs, startDate, endDate]);

  // Handlers
  const handleStartBoard = (newConfig: BoardConfig) => {
    setConfig({
      ...newConfig,
      baseDateStr: getTodayDateStr(),
    });
    setSession({
      isActive: true,
      isPaused: false,
      pausedAt: null,
      accumulatedPauseOffsetMs: 0,
      startedAt: Date.now(),
    });
  };

  const handleTogglePause = () => {
    if (!session.isActive) return;

    if (!session.isPaused) {
      // Pause now
      setSession(prev => ({
        ...prev,
        isPaused: true,
        pausedAt: Date.now(),
      }));
    } else {
      // Resume request -> show decision modal if paused for at least 10 seconds, else resume directly
      const pausedDuration = session.pausedAt ? Date.now() - session.pausedAt : 0;
      if (pausedDuration > 10000) {
        setIsResumeModalOpen(true);
      } else {
        // Quick unpause
        handleResumeRealTime();
      }
    }
  };

  const handleResumeRealTime = () => {
    setSession(prev => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
    }));
    setIsResumeModalOpen(false);
  };

  const handleResumeCompensated = () => {
    if (session.pausedAt) {
      const pausedDuration = Date.now() - session.pausedAt;
      setSession(prev => ({
        ...prev,
        isPaused: false,
        pausedAt: null,
        accumulatedPauseOffsetMs: prev.accumulatedPauseOffsetMs + pausedDuration,
      }));
    } else {
      handleResumeRealTime();
    }
    setIsResumeModalOpen(false);
  };

  const handleRestart = () => {
    setSession({
      isActive: true,
      isPaused: false,
      pausedAt: null,
      accumulatedPauseOffsetMs: 0,
      startedAt: Date.now(),
    });
  };

  const handleEditTimes = () => {
    setSession(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
    }));
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen might be blocked by iframe or browser policy
    }
  };

  const handleToggleTheme = () => {
    setConfig(prev => ({
      ...prev,
      theme: prev.theme === 'institutional-light' ? 'institutional-dark' : 'institutional-light',
    }));
  };

  const handleChangeLayoutMode = (mode: LayoutMode) => {
    setConfig(prev => ({
      ...prev,
      layoutMode: mode,
    }));
  };

  const isDark = config.theme === 'institutional-dark' || config.theme === 'blackboard';
  const currentTimeDisplay = formatTimeHMS(currentTimeMs);

  // If session is NOT active, show Configuration Screen
  if (!session.isActive) {
    return (
      <ConfigScreen
        initialConfig={config}
        onStartBoard={handleStartBoard}
        theme={config.theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Active Board Screen
  return (
    <div
      id="app-root-board"
      className={`min-h-screen w-full flex flex-col transition-colors select-none ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Header without running clock (mirroring ENEM blackboard) */}
      <BoardHeader
        status={status}
        isPaused={session.isPaused}
        theme={config.theme}
        startTimeStr={config.startTime}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenControls={() => setIsControlsOpen(true)}
        onTogglePause={handleTogglePause}
      />

      {/* 2. Main Visual Board */}
      <BoardView
        visibleSlots={visibleSlots}
        status={status}
        theme={config.theme}
        layoutMode={config.layoutMode}
        startTimeStr={config.startTime}
        endTimeStr={config.endTime}
      />

      {/* 3. Discreet Floating Control Trigger (minimalist in bottom right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          id="btn-floating-controls"
          type="button"
          onClick={() => setIsControlsOpen(true)}
          title="Abrir controles (M)"
          className={`p-3 rounded-full border shadow-md transition-all opacity-40 hover:opacity-100 hover:scale-105 cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 4. Controls Drawer Menu */}
      <ControlsMenu
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        status={status}
        isPaused={session.isPaused}
        config={config}
        isFullscreen={isFullscreen}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        onEditTimes={handleEditTimes}
        onToggleFullscreen={toggleFullscreen}
        onToggleTheme={handleToggleTheme}
        onChangeLayoutMode={handleChangeLayoutMode}
      />

      {/* 5. Resume from Pause Confirmation Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        pausedDurationMs={session.pausedAt ? Date.now() - session.pausedAt : 0}
        theme={config.theme}
        onCancel={() => setIsResumeModalOpen(false)}
        onResumeRealTime={handleResumeRealTime}
        onResumeCompensated={handleResumeCompensated}
      />
    </div>
  );
}
