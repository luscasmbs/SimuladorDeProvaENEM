import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TimeSlot, ThemeMode, LayoutMode, BoardStatus } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface BoardViewProps {
  visibleSlots: TimeSlot[];
  status: BoardStatus;
  theme: ThemeMode;
  layoutMode: LayoutMode;
  startTimeStr: string;
  endTimeStr: string;
}

export const BoardView: React.FC<BoardViewProps> = ({
  visibleSlots,
  status,
  theme,
  layoutMode,
  startTimeStr,
  endTimeStr,
}) => {
  const isDark = theme === 'institutional-dark' || theme === 'blackboard';

  // State: Finished
  if (status === 'finished') {
    return (
      <main
        id="board-main-container"
        className="flex-1 flex flex-col items-center justify-center p-8 select-none"
      >
        <motion.div
          id="board-finished-card"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`text-center py-16 px-12 rounded-2xl max-w-lg w-full border ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl'
              : 'bg-white border-slate-200 text-slate-900 shadow-lg'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${
              isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>
          <h1
            id="text-board-finished"
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase mb-3 font-mono"
          >
            FINALIZADO
          </h1>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Horário de término atingido ({endTimeStr})
          </p>
        </motion.div>
      </main>
    );
  }

  // Calculate dynamic grid columns based on layoutMode and item count
  const count = visibleSlots.length;
  let gridColsClass = 'grid-cols-1 max-w-md';

  if (layoutMode === 'column') {
    gridColsClass = 'grid-cols-1 max-w-md';
  } else if (layoutMode === 'grid') {
    if (count <= 6) {
      gridColsClass = 'grid-cols-1 sm:grid-cols-2 max-w-2xl';
    } else if (count <= 14) {
      gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl';
    } else {
      gridColsClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-6xl';
    }
  } else {
    // 'auto' mode: balance nicely based on slot count
    if (count <= 8) {
      gridColsClass = 'grid-cols-1 max-w-md';
    } else if (count <= 16) {
      gridColsClass = 'grid-cols-1 sm:grid-cols-2 max-w-2xl';
    } else if (count <= 24) {
      gridColsClass = 'grid-cols-2 sm:grid-cols-3 max-w-4xl';
    } else {
      gridColsClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-6xl';
    }
  }

  return (
    <main
      id="board-main-container"
      className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-8 md:p-12 overflow-y-auto"
    >
      {/* If waiting for start */}
      {status === 'waiting' && (
        <div className="mb-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Aguardando horário de início ({startTimeStr})
          </span>
        </div>
      )}

      {/* Grid or list of time slots */}
      <div
        id="board-slots-grid"
        className={`w-full grid gap-3 sm:gap-4 transition-all duration-300 ${gridColsClass}`}
      >
        <AnimatePresence mode="popLayout">
          {visibleSlots.map((slot) => {
            const isCurrent = slot.isCurrent;

            return (
              <motion.div
                key={slot.id}
                id={`slot-card-${slot.timeStr.replace(':', '-')}`}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: 'easeOut' },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: -20,
                  filter: 'blur(4px)',
                  transition: { duration: 0.45, ease: 'easeInOut' },
                }}
                className={`relative rounded-xl select-none flex items-center justify-center px-6 py-4 sm:py-5 border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-900/90 text-slate-100 border-slate-800 shadow-sm'
                    : 'bg-white text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                {/* Time Display */}
                <div className="flex items-center justify-center">
                  <span
                    className={`font-mono font-extrabold tracking-tight tabular-nums ${
                      count <= 8
                        ? 'text-4xl sm:text-5xl md:text-6xl'
                        : count <= 16
                        ? 'text-3xl sm:text-4xl md:text-5xl'
                        : 'text-2xl sm:text-3xl md:text-4xl'
                    }`}
                  >
                    {slot.timeStr}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
};
