import React, { useState, useEffect } from 'react';
import { BoardConfig, ThemeMode } from '../types';
import {
  formatTimeHM,
  timeStrToMinutes,
  addMinutesToTimeString,
} from '../utils/timeUtils';
import { Clock, Play, AlertCircle, Sparkles, Moon, Sun } from 'lucide-react';

interface ConfigScreenProps {
  initialConfig: BoardConfig;
  onStartBoard: (config: BoardConfig) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({
  initialConfig,
  onStartBoard,
  theme,
  onToggleTheme,
}) => {
  const [deviceTimeStr, setDeviceTimeStr] = useState<string>(formatTimeHM(new Date()));
  const [startTime, setStartTime] = useState<string>(initialConfig.startTime);
  const [endTime, setEndTime] = useState<string>(initialConfig.endTime);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(initialConfig.intervalMinutes);
  const [customInterval, setCustomInterval] = useState<string>(
    [5, 10, 15, 20, 30].includes(initialConfig.intervalMinutes) ? '' : String(initialConfig.intervalMinutes)
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const isDark = theme === 'institutional-dark' || theme === 'blackboard';

  // Update current device time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDeviceTimeStr(formatTimeHM(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if chosen startTime has already passed today
  useEffect(() => {
    const currentMins = timeStrToMinutes(deviceTimeStr);
    const startMins = timeStrToMinutes(startTime);

    if (startMins < currentMins) {
      setWarningMessage(
        `O horário de início configurado (${startTime}) já passou em relação ao relógio atual (${deviceTimeStr}). Os horários anteriores iniciarão apagados, a menos que você ajuste para começar agora.`
      );
    } else {
      setWarningMessage(null);
    }
  }, [startTime, deviceTimeStr]);

  const handleSetCurrentAsStart = () => {
    const now = new Date();
    const currentHM = formatTimeHM(now);
    setStartTime(currentHM);
    // Keep standard 2 hours or same duration if endTime was already set
    const startMins = timeStrToMinutes(startTime);
    const endMins = timeStrToMinutes(endTime);
    let diffMins = endMins - startMins;
    if (diffMins <= 0) diffMins = 120; // default 2 hours
    setEndTime(addMinutesToTimeString(currentHM, diffMins));
  };

  const handleApplyPreset = (durationMinutes: number) => {
    const now = new Date();
    const currentHM = formatTimeHM(now);
    setStartTime(currentHM);
    setEndTime(addMinutesToTimeString(currentHM, durationMinutes));
  };

  const handleIntervalSelect = (mins: number) => {
    setIntervalMinutes(mins);
    setCustomInterval('');
  };

  const handleCustomIntervalChange = (val: string) => {
    setCustomInterval(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      setIntervalMinutes(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: BoardConfig = {
      ...initialConfig,
      startTime,
      endTime,
      intervalMinutes: Math.max(1, intervalMinutes),
      theme,
    };

    onStartBoard(config);
  };

  return (
    <div
      id="config-screen"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top bar with theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
        <button
          id="btn-toggle-theme"
          type="button"
          onClick={onToggleTheme}
          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
          }`}
          title="Alternar tema"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {isDark ? 'Tema Claro' : 'Tema Escuro'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-xl">
        {/* Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 bg-slate-200/60 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
            Acompanhamento de Horário
          </div>
          <h1
            id="config-title"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
          >
            Quadro de Horários
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quadro visual institucional com apagamento progressivo baseado no relógio real.
          </p>
        </div>

        {/* Configuration Card Form */}
        <form
          onSubmit={handleSubmit}
          className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-2xl'
              : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          {/* Section: Start & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="input-start-time"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Horário de Início
                </label>
                <button
                  type="button"
                  onClick={handleSetCurrentAsStart}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Começar agora
                </button>
              </div>
              <input
                id="input-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border text-lg font-mono font-bold text-center outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-600 text-slate-900'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="input-end-time"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Horário de Término
                </label>
                {timeStrToMinutes(endTime) <= timeStrToMinutes(startTime) && (
                  <span className="text-[11px] text-amber-500 font-medium">
                    (Dia seguinte)
                  </span>
                )}
              </div>
              <input
                id="input-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl border text-lg font-mono font-bold text-center outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-600 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Durações Rápidas (A partir de agora)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(60)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                1 Hora
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(120)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                2 Horas
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(300)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ENEM 2º Dia (5h00)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(330)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ENEM 1º Dia (5h30)
              </button>
            </div>
          </div>

          {/* Section: Interval Selection */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
              Intervalo entre os horários
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[5, 10, 15, 30].map((mins) => {
                const isSelected = intervalMinutes === mins && !customInterval;
                return (
                  <button
                    key={mins}
                    id={`btn-interval-${mins}`}
                    type="button"
                    onClick={() => handleIntervalSelect(mins)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>

            {/* Custom interval input */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Personalizado:
              </span>
              <div className="relative flex-1">
                <input
                  id="input-custom-interval"
                  type="number"
                  min={1}
                  max={180}
                  placeholder="Ex: 20"
                  value={customInterval}
                  onChange={(e) => handleCustomIntervalChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${
                    customInterval
                      ? isDark
                        ? 'bg-slate-950 border-blue-500 text-white'
                        : 'bg-slate-50 border-blue-600 text-slate-900'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                  minutos
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message if start time has passed */}
          {warningMessage && (
            <div
              id="start-time-warning"
              className="mb-6 p-4 rounded-xl border flex items-start gap-3 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-2">
                <p>{warningMessage}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetCurrentAsStart}
                    className="px-2.5 py-1 rounded-md font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Ajustar início para agora ({deviceTimeStr})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-start-board"
            type="submit"
            className="w-full py-4 px-6 rounded-xl font-bold tracking-wider uppercase text-base flex items-center justify-center gap-2 transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-[0.99]"
          >
            <Play className="w-5 h-5 fill-current" />
            Iniciar Quadro
          </button>
        </form>
      </div>
    </div>
  );
};
