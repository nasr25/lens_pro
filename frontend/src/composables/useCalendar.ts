import { ref, computed } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import type { SlotCalendarEntry, CalendarStatus } from '@/types';

// In Saudi Arabia, the week starts on Saturday (day index 6)
const WEEK_START = 6;

export function useCalendar(slotsRef: { value: SlotCalendarEntry[] }) {
  const currentDate = ref(new Date());

  const currentMonth = computed(() => format(currentDate.value, 'yyyy-MM'));
  const currentYear  = computed(() => currentDate.value.getFullYear());
  const currentMonthNum = computed(() => currentDate.value.getMonth());

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat('ar-SA', {
      month: 'long',
      year: 'numeric',
      calendar: 'gregory',
    }).format(currentDate.value)
  );

  const weekDayHeaders = computed(() => {
    const days = [];
    const baseDate = new Date(2024, 0, 6); // A Saturday
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(new Intl.DateTimeFormat('ar-SA', { weekday: 'short' }).format(d));
    }
    return days;
  });

  const calendarDays = computed(() => {
    const start = startOfMonth(currentDate.value);
    const end   = endOfMonth(currentDate.value);
    const days  = eachDayOfInterval({ start, end });

    // Offset: how many cells before the 1st day
    const firstDayOfWeek = getDay(start); // 0=Sun,...,6=Sat
    // Normalize offset so Saturday=0
    const offset = (firstDayOfWeek - WEEK_START + 7) % 7;

    const slotMap = new Map<string, SlotCalendarEntry>();
    for (const slot of slotsRef.value) {
      slotMap.set(slot.slot_date, slot);
    }

    const cells: Array<{ date: string; day: number; slot: SlotCalendarEntry | null; isEmpty: boolean }> = [];

    // Empty leading cells
    for (let i = 0; i < offset; i++) {
      cells.push({ date: '', day: 0, slot: null, isEmpty: true });
    }

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const slot    = slotMap.get(dateStr) ?? null;
      cells.push({ date: dateStr, day: day.getDate(), slot, isEmpty: false });
    }

    return cells;
  });

  function prevMonth(): void {
    currentDate.value = subMonths(currentDate.value, 1);
  }

  function nextMonth(): void {
    currentDate.value = addMonths(currentDate.value, 1);
  }

  function isPast(dateStr: string): boolean {
    return new Date(dateStr) < new Date(format(new Date(), 'yyyy-MM-dd'));
  }

  return {
    currentDate,
    currentMonth,
    currentYear,
    currentMonthNum,
    monthLabel,
    weekDayHeaders,
    calendarDays,
    prevMonth,
    nextMonth,
    isPast,
  };
}
