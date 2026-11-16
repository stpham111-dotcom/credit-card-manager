import { CreditCard } from '../types';

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 đ';
  }
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

export function formatPercent(val: number): string {
  return `${val.toLocaleString('vi-VN')}%`;
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export interface CycleInfo {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (Statement day)
  dueDate: string;   // YYYY-MM-DD
  daysUntilStatement: number;
  daysUntilDue: number;
  cycleKey: string;
  isPastStatement: boolean;
}

/**
 * Calculates current billing cycle for a card given today's date.
 * If statementDay is 20:
 * - If today is Nov 16: current cycle is Oct 21 -> Nov 20.
 * - If today is Nov 22: current cycle is Nov 21 -> Dec 20.
 */
export function getCardCycleInfo(card: CreditCard, refDate: Date = new Date()): CycleInfo {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed
  const day = refDate.getDate();

  let statementYear = year;
  let statementMonth = month;

  if (day > card.statementDay) {
    // Current cycle will close next month
    statementMonth += 1;
    if (statementMonth > 11) {
      statementMonth = 0;
      statementYear += 1;
    }
  }

  // End date is statement date of this cycle
  const maxDayInStatementMonth = new Date(statementYear, statementMonth + 1, 0).getDate();
  const actualStatementDay = Math.min(card.statementDay, maxDayInStatementMonth);
  const endD = new Date(statementYear, statementMonth, actualStatementDay);

  // Start date is previous cycle statement date + 1 day
  let prevMonth = statementMonth - 1;
  let prevYear = statementYear;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }
  const maxDayInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const prevStatementDay = Math.min(card.statementDay, maxDayInPrevMonth);
  const startD = new Date(prevYear, prevMonth, prevStatementDay + 1);

  // Due date
  const dueD = new Date(endD);
  if (card.paymentDueDayFixed) {
    let dueMonth = statementMonth;
    let dueYear = statementYear;
    if (card.paymentDueDayFixed <= card.statementDay) {
      dueMonth += 1;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear += 1;
      }
    }
    const maxDay = new Date(dueYear, dueMonth + 1, 0).getDate();
    dueD.setFullYear(dueYear, dueMonth, Math.min(card.paymentDueDayFixed, maxDay));
  } else {
    dueD.setDate(endD.getDate() + (card.paymentDueDaysAfter || 15));
  }

  // Days calculations
  const todayMs = new Date(year, month, day).getTime();
  const endMs = endD.getTime();
  const dueMs = dueD.getTime();
  
  const daysUntilStatement = Math.ceil((endMs - todayMs) / (1000 * 60 * 60 * 24));
  const daysUntilDue = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  const startIso = toIso(startD);
  const endIso = toIso(endD);

  return {
    startDate: startIso,
    endDate: endIso,
    dueDate: toIso(dueD),
    daysUntilStatement,
    daysUntilDue,
    cycleKey: `${startIso}_${endIso}`,
    isPastStatement: daysUntilStatement < 0,
  };
}

export function isDateWithin(dateStr: string, startIso: string, endIso: string): boolean {
  return dateStr >= startIso && dateStr <= endIso;
}
