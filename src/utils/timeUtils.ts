import { BoardConfig, TimeSlot, BoardStatus } from '../types';

/**
 * Format a Date or timestamp to HH:MM
 */
export function formatTimeHM(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format a Date or timestamp to HH:MM:SS
 */
export function formatTimeHMS(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Parse HH:MM into minutes from 00:00
 */
export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Parse HH:MM string on a specific date YYYY-MM-DD
 */
export function parseTimeToDate(timeStr: string, baseDateStr?: string, isNextDay: boolean = false): Date {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  let day = today.getDate();

  if (baseDateStr) {
    const parts = baseDateStr.split('-').map(Number);
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    }
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(year, month, day, hours || 0, minutes || 0, 0, 0);

  if (isNextDay) {
    d.setDate(d.getDate() + 1);
  }

  return d;
}

/**
 * Generates all time slots between startTime and endTime with intervalMinutes.
 * Handles overnight schedules (e.g. 22:00 to 01:00).
 */
export function generateTimeSlots(
  startTimeStr: string,
  endTimeStr: string,
  intervalMinutes: number,
  baseDateStr?: string,
  accumulatedPauseOffsetMs: number = 0
): { slots: TimeSlot[]; startDate: Date; endDate: Date } {
  const startMinutes = timeStrToMinutes(startTimeStr);
  let endMinutes = timeStrToMinutes(endTimeStr);

  const isOvernight = endMinutes <= startMinutes;
  if (isOvernight) {
    endMinutes += 24 * 60;
  }

  const startDate = parseTimeToDate(startTimeStr, baseDateStr, false);
  const endDate = parseTimeToDate(endTimeStr, baseDateStr, isOvernight);

  // Apply any accumulated pause shift to the slots
  const effectiveStartDateMs = startDate.getTime() + accumulatedPauseOffsetMs;
  const effectiveEndDateMs = endDate.getTime() + accumulatedPauseOffsetMs;

  const validInterval = Math.max(1, intervalMinutes);
  const totalDurationMinutes = (effectiveEndDateMs - effectiveStartDateMs) / (60 * 1000);

  const slots: TimeSlot[] = [];
  let currentOffsetMinutes = 0;

  while (currentOffsetMinutes <= totalDurationMinutes) {
    const slotTimestamp = effectiveStartDateMs + currentOffsetMinutes * 60 * 1000;
    const slotDate = new Date(slotTimestamp);
    const timeStr = formatTimeHM(slotDate);

    slots.push({
      id: `slot-${timeStr}-${slotTimestamp}`,
      timeStr,
      timestamp: slotTimestamp,
      isCurrent: false,
      isPassed: false,
      isUpcoming: true,
    });

    currentOffsetMinutes += validInterval;
  }

  // Ensure exact end time is included if not aligned with interval
  if (slots.length > 0 && slots[slots.length - 1].timestamp < effectiveEndDateMs) {
    const finalDate = new Date(effectiveEndDateMs);
    const timeStr = formatTimeHM(finalDate);
    slots.push({
      id: `slot-${timeStr}-${effectiveEndDateMs}`,
      timeStr,
      timestamp: effectiveEndDateMs,
      isCurrent: false,
      isPassed: false,
      isUpcoming: true,
    });
  }

  return {
    slots,
    startDate: new Date(effectiveStartDateMs),
    endDate: new Date(effectiveEndDateMs),
  };
}

/**
 * Evaluates the status of the board and marks each slot as passed, current, or upcoming.
 * Strictly adheres to the rule:
 * - At t_0 (start): all slots t_0...t_N are visible, t_0 is highlighted (current).
 * - At t_1: t_0 disappears, t_1 is highlighted (current).
 * - At t_2: t_1 disappears, t_2 is highlighted (current).
 * - When real time >= final end time: all slots disappear, status is 'finished'.
 */
export function evaluateBoardSlots(
  slots: TimeSlot[],
  currentTimeMs: number,
  startDateMs: number,
  endDateMs: number
): {
  visibleSlots: TimeSlot[];
  currentSlot: TimeSlot | null;
  status: BoardStatus;
} {
  // Case 1: Before start time
  if (currentTimeMs < startDateMs) {
    return {
      visibleSlots: slots.map((s, idx) => ({
        ...s,
        isCurrent: idx === 0, // ready on the first slot
        isPassed: false,
        isUpcoming: true,
      })),
      currentSlot: null,
      status: 'waiting',
    };
  }

  // Case 2: At or after final end time
  if (currentTimeMs >= endDateMs) {
    return {
      visibleSlots: [],
      currentSlot: null,
      status: 'finished',
    };
  }

  // Case 3: Running between start and end
  // Find the active slot index:
  // Slot i is active while slots[i].timestamp <= currentTimeMs < slots[i+1]?.timestamp
  // If currentTimeMs is >= slots[i+1].timestamp, slot i has passed and disappears.
  let activeIndex = 0;
  for (let i = 0; i < slots.length; i++) {
    const nextSlot = slots[i + 1];
    const slotTime = slots[i].timestamp;

    if (nextSlot) {
      if (currentTimeMs >= slotTime && currentTimeMs < nextSlot.timestamp) {
        activeIndex = i;
        break;
      }
    } else {
      // Last slot before end
      if (currentTimeMs >= slotTime && currentTimeMs < endDateMs) {
        activeIndex = i;
        break;
      }
    }
  }

  const updatedSlots = slots.map((slot, index) => {
    const isPassed = index < activeIndex;
    const isCurrent = index === activeIndex;
    const isUpcoming = index > activeIndex;

    return {
      ...slot,
      isPassed,
      isCurrent,
      isUpcoming,
    };
  });

  const visibleSlots = updatedSlots.filter(s => !s.isPassed);
  const currentSlot = updatedSlots[activeIndex] || null;

  return {
    visibleSlots,
    currentSlot,
    status: 'running',
  };
}

/**
 * Helper to get current Date string YYYY-MM-DD
 */
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add minutes to "HH:MM" string and return new "HH:MM"
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const totalMinutes = (timeStrToMinutes(timeStr) + minutesToAdd) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
