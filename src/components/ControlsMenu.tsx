import React, { useState } from 'react';
import { BoardConfig, ThemeMode, LayoutMode, BoardStatus } from '../types';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Edit3,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Grid,
  Columns,
  Sparkles,
  Settings,
  AlertTriangle,
} from 'lucide-react';

interface ControlsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  status: BoardStatus;
  isPaused: boolean;
  config: BoardConfig;
  isFullscreen: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onEditTimes: () => void;
  onToggleFullscreen: () => void;
  onToggleTheme: () => void;
  onChangeLayoutMode: (mode: LayoutMode) => void;
}

export const ControlsMenu: React.FC<ControlsMenuProps> = ({
  isOpen,
  onClose,
  status,
  isPaused,
  config,
  isFullscreen,
  onTogglePause,
  onRestart,
  onEditTimes,
  onToggleFullscreen,
  onToggleTheme,
  onChangeLayoutMode,
}) => {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const isDark = config.theme === 'institutional-dark' || config.theme === 'blackboard';

  if (!isOpen) return null;

  return (
    <div
      id="controls-menu-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="controls-menu-panel"
        className={`w-full max-w-sm h-full flex flex-col p-6 border-l shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 transition-colors ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h2 className="text-base font-bold tracking-tight uppercase">
              Controles do Quadro
            </h2>
          </div>
          <button
            id="btn-close-controls"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Config Summary */}
        <div className={`p-3.5 rounded-xl border mb-6 text-xs space-y-1 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex justify-between">
            <span>Início programado:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">{config.startTime}</strong>
          </div>
          <div className="flex justify-between">
            <span>Término programado:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">{config.endTime}</strong>
          </div>
          <div className="flex justify-between">
            <span>Intervalo:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">{config.intervalMinutes} min</strong>
          </div>
        </div>

        {/* Actions List */}
        <div className="space-y-3 flex-1">
          {/* Pause / Resume button */}
          {status === 'running' && (
            <button
              id="btn-control-pause"
              type="button"
              onClick={() => {
                onTogglePause();
                onClose();
              }}
              className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isPaused
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Continuar Quadro' : 'Pausar Quadro'}
              </span>
              <span className="text-[11px] opacity-70">
                {isPaused ? 'Congelado' : 'Ativo'}
              </span>
            </button>
          )}

          {/* Edit times button */}
          <button
            id="btn-control-edit"
            type="button"
            onClick={() => {
              onEditTimes();
              onClose();
            }}
            className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Editar Horários e Intervalo
          </button>

          {/* Fullscreen toggle */}
          <button
            id="btn-control-fullscreen"
            type="button"
            onClick={onToggleFullscreen}
            className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
              Tecla F
            </span>
          </button>

          {/* Theme toggle */}
          <button
            id="btn-control-theme"
            type="button"
            onClick={onToggleTheme}
            className={`w-full py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Aparência do Quadro
            </span>
            <span className="text-xs opacity-70">
              {isDark ? 'Escuro' : 'Claro'}
            </span>
          </button>

          {/* Layout Mode selector */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Disposição dos Horários
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayoutMode('auto')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  config.layoutMode === 'auto'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLayoutMode('column')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  config.layoutMode === 'column'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Coluna</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLayoutMode('grid')}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                  config.layoutMode === 'grid'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>
            </div>
          </div>

          {/* Restart Button & Confirmation */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {!showRestartConfirm ? (
              <button
                id="btn-control-restart"
                type="button"
                onClick={() => setShowRestartConfirm(true)}
                className="w-full py-3 px-4 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-sm font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar Quadro
              </button>
            ) : (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Deseja realmente reiniciar?
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  O progresso e os horários apagados serão resetados.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onRestart();
                      setShowRestartConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    Sim, Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRestartConfirm(false)}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">F</kbd> Tela cheia</div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Espaço</kbd> Pausar / Continuar</div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Esc</kbd> Fechar menu</div>
        </div>
      </div>
    </div>
  );
};
