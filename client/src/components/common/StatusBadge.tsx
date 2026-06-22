/**
 * StatusBadge — reusable pill badge with leading dot indicator.
 *
 * Accepts either:
 *   a) A pre-defined `variant` key mapped against a built-in palette, OR
 *   b) An explicit `style` object matching { light, dark, dot } (same
 *      shape as the local statusStyle objects in Attendance/Leave pages).
 *
 * The light + dark class strings are both applied simultaneously via
 * Tailwind's dark: prefix — no toggling required.
 */

import type { ReactNode } from 'react';

// ─── Built-in palette (covers all statuses used across the app) ──────────────

export type StatusVariant =
  | 'Present'
  | 'Late'
  | 'Absent'
  | 'Leave'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Processing'
  | 'Active'
  | 'Inactive'
  | 'On Leave';

type StyleTriple = { light: string; dark: string; dot: string };

const PALETTE: Record<StatusVariant, StyleTriple> = {
  // Attendance
  Present:    { light: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Late:       { light: 'bg-amber-50 text-amber-700 border border-amber-200',       dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',       dot: 'bg-amber-500 dark:bg-amber-400' },
  Absent:     { light: 'bg-red-50 text-red-700 border border-red-200',             dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',             dot: 'bg-red-500 dark:bg-red-400' },
  Leave:      { light: 'bg-violet-50 text-violet-700 border border-violet-200',   dark: 'dark:bg-violet-500/20 dark:border-violet-500/30 dark:text-violet-400',   dot: 'bg-violet-500 dark:bg-violet-400' },
  // Leave page
  Pending:    { light: 'bg-amber-50 text-amber-700 border border-amber-200',       dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',       dot: 'bg-amber-500 dark:bg-amber-400' },
  Approved:   { light: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Rejected:   { light: 'bg-red-50 text-red-700 border border-red-200',             dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',             dot: 'bg-red-500 dark:bg-red-400' },
  // Payroll
  Paid:       { light: 'bg-blue-50 text-blue-700 border border-blue-200',          dark: 'dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400',          dot: 'bg-blue-500 dark:bg-blue-400' },
  Processing: { light: 'bg-teal-50 text-teal-700 border border-teal-200',          dark: 'dark:bg-teal-500/20 dark:border-teal-500/30 dark:text-teal-400',          dot: 'bg-teal-500 dark:bg-teal-400' },
  // Employee status
  Active:     { light: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dark: 'dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  Inactive:   { light: 'bg-red-50 text-red-700 border border-red-200',             dark: 'dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400',             dot: 'bg-red-500 dark:bg-red-400' },
  'On Leave': { light: 'bg-amber-50 text-amber-700 border border-amber-200',       dark: 'dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',       dot: 'bg-amber-500 dark:bg-amber-400' },
};

const FALLBACK: StyleTriple = {
  light: 'bg-slate-50 text-slate-700 border border-slate-200',
  dark:  'dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400',
  dot:   'bg-slate-400',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  /** Status string — looked up in the built-in palette. */
  status: string;
  /**
   * Optional explicit style triple. When provided, overrides the
   * palette lookup entirely (for custom statuses not in the palette).
   */
  customStyle?: StyleTriple;
  /** Render without the leading dot indicator. */
  noDot?: boolean;
  className?: string;
  children?: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StatusBadge({
  status,
  customStyle,
  noDot = false,
  className = '',
  children,
}: StatusBadgeProps) {
  const style = customStyle ?? PALETTE[status as StatusVariant] ?? FALLBACK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style.light} ${style.dark} ${className}`}
    >
      {!noDot && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      )}
      {children ?? status}
    </span>
  );
}
