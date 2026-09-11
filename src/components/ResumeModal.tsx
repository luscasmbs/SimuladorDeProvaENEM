import React from 'react';
import { ThemeMode } from '../types';
import { Play, Clock, FastForward, X } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  pausedDurationMs: number;
  theme: ThemeMode;
  onCancel: () => void;
  onResumeRealTime: () => void;
  onResumeCompensated: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  pausedDurationMs,
  theme,
  onCancel,
  onResumeRealTime,
  onResumeCompensated,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'institutional-dark' || theme === 'blackboard';
  const pausedMinutes = Math.max(1, Math.round(pausedDurationMs / (60 * 1000)));

  return (
    <div
      id="modal-resume-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="modal-resume-content"
        className={`w-full max-w-md rounded-2xl p-6 sm:p-7 border shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <h2 className="text-lg font-bold">Retomar Quadro</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          O quadro esteve pausado por aproximadamente{' '}
          <strong className="text-slate-800 dark:text-slate-200">
            {pausedMinutes} minuto{pausedMinutes !== 1 ? 's' : ''}
          </strong>
          . Como você deseja proceder ao continuar?
        </p>

        <div className="space-y-3 mb-6">
          {/* Option 1: Real Clock */}
          <button
            id="btn-resume-real-time"
            type="button"
            onClick={onResumeRealTime}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
              isDark
                ? 'bg-slate-950 border-slate-800 hover:border-blue-500/60 hover:bg-slate-950/80'
                : 'bg-slate-50 border-slate-200 hover:border-blue-500/60 hover:bg-slate-100/80'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Continuar pelo Relógio Real
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sincroniza instantaneamente com a hora atual. Os horários que passaram durante a pausa serão apagados.
              </p>
            </div>
          </button>

          {/* Option 2: Add paused time */}
          <button
            id="btn-resume-compensated"
            type="button"
            onClick={onResumeCompensated}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
              isDark
                ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-950/80'
                : 'bg-slate-50 border-slate-200 hover:border-emerald-500/60 hover:bg-slate-100/80'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors mt-0.5">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Compensar Tempo Pausado (+{pausedMinutes} min)
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Adiciona o tempo de pausa ao cronograma, prorrogando o horário de término e os horários restantes.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Manter Pausado
          </button>
        </div>
      </div>
    </div>
  );
};
