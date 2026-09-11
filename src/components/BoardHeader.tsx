import React from 'react';
import { BoardStatus, ThemeMode } from '../types';
import { Maximize2, Minimize2, Menu, Pause, Play } from 'lucide-react';

interface BoardHeaderProps {
  status: BoardStatus;
  isPaused: boolean;
  theme: ThemeMode;
  startTimeStr: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenControls: () => void;
  onTogglePause: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  status,
  isPaused,
  theme,
  startTimeStr,
  isFullscreen,
  onToggleFullscreen,
  onOpenControls,
  onTogglePause,
}) => {
  const isDark = theme === 'institutional-dark' || theme === 'blackboard';

  return (
    <header
      id="board-header"
      className={`w-full px-6 py-4 flex items-center justify-between transition-colors border-b select-none ${
        isDark
          ? 'bg-slate-950/80 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      {/* Left side: Discreet title & status */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wider uppercase opacity-50">
            Quadro de Horários
          </span>
          {status === 'waiting' && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Aguardando início às {startTimeStr}
            </span>
          )}
          {status === 'running' && !isPaused && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Em andamento
            </span>
          )}
          {isPaused && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Pausado
            </span>
          )}
          {status === 'finished' && (
            <span className="text-xs font-medium text-slate-500">
              Encerrado
            </span>
          )}
        </div>
      </div>

      {/* Center intentionally empty: No running clock, mirroring authentic ENEM exam board */}

      {/* Right side: Quick discreet actions */}
      <div className="flex items-center gap-2">
        {status === 'running' && (
          <button
            id="btn-header-pause-toggle"
            type="button"
            onClick={onTogglePause}
            title={isPaused ? 'Continuar quadro' : 'Pausar quadro'}
            className={`p-2 rounded-lg transition-colors border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
              isPaused
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                : isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Continuar</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pausar</span>
              </>
            )}
          </button>
        )}

        <button
          id="btn-header-fullscreen"
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          id="btn-header-menu"
          type="button"
          onClick={onOpenControls}
          title="Abrir controles do quadro"
          className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Controles</span>
        </button>
      </div>
    </header>
  );
};
