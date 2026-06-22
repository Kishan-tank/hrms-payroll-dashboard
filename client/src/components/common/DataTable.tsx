/**
 * DataTable — reusable, client-side sortable/searchable/paginated table.
 *
 * Client-side mode (default): omit onSearch, totalItems,
 * currentPage, onPageChange. DataTable handles all filtering,
 * sorting, and pagination internally.
 *
 * Server-side mode: provide onSearch and/or the three
 * pagination props. DataTable renders controls but defers
 * logic to the caller.
 *
 * Loading state: reuses TableSkeleton from Skeletons.tsx.
 * Empty state: renders EmptyState from EmptyState.tsx inside a <td>.
 */

import { useState, useMemo, useId } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Skeletons';

// ─── Column definition ───────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  /** Unique key; also used as the sort key when no `sortValue` is provided. */
  key: string;
  /** Column header label or element. */
  header: ReactNode;
  /** If true, clicking the header cycles asc → desc → none. */
  sortable?: boolean;
  /** Custom sort value extractor. Falls back to `row[key]`. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Custom cell renderer. When omitted, renders `String(row[key] ?? '')`. */
  render?: (row: T, index: number) => ReactNode;
  /** Extra className applied to every `<td>` in this column. */
  className?: string;
  /** Extra className applied to the `<th>`. */
  headerClassName?: string;
  /** Inline style on each `<td>`. */
  style?: CSSProperties;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DataTableProps<T> {
  /** Column definitions — order determines render order. */
  columns: DataTableColumn<T>[];
  /** The full dataset. Sorting/search/pagination operate on this. */
  data: T[];
  /**
   * Derives a stable React key from a row.
   * Prefer a unique id field; falls back to array index when not provided.
   */
  rowKey?: (row: T, index: number) => string | number;
  /** While true, renders a TableSkeleton in place of rows. */
  loading?: boolean;
  /** Enables the built-in search bar above the table. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Keys to search across. If omitted and `searchable` is true,
   * searches all string/number values via Object.values().
   * Ignored when `getSearchText` is provided.
   */
  searchKeys?: (keyof T)[];
  /**
   * Returns a single flat search string for a row.
   * Use this instead of `searchKeys` when the searchable fields
   * are nested (e.g. row.employeeId.name). When provided, it takes
   * priority over `searchKeys`.
   */
  getSearchText?: (row: T) => string;
  /** Page size for client-side pagination. 0 = no pagination. Default: 10. */
  pageSize?: number;
  /**
   * The empty state shown when there are no rows after filtering.
   * Pass the full <EmptyState ... /> or any ReactNode; the component
   * wraps it in a <td> automatically.
   */
  emptyState?: ReactNode;
  /** Callback when a row is clicked. */
  onRowClick?: (row: T, index: number) => void;
  /** Extra className on the outer container div. */
  className?: string;
  /** Min width for the inner table (for horizontal scroll). Default: 700px. */
  minWidth?: number;
  /**
   * Server-side search callback.
   * When provided, DataTable renders the search input but calls
   * onSearch(query) on change instead of filtering internally.
   * The internal useMemo search is bypassed entirely.
   */
  onSearch?: (query: string) => void;
  /** Server-side pagination: total items across all pages. */
  totalItems?: number;
  /** Server-side pagination: current active page. */
  currentPage?: number;
  /**
   * Server-side pagination callback.
   * When provided alongside totalItems and currentPage, DataTable renders
   * pagination controls using these values instead of computing them from the
   * local sorted/filtered array.
   */
  onPageChange?: (page: number) => void;
}

// ─── Sort direction ──────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc' | null;

function SortIcon({ dir }: { dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-[2px]" aria-hidden="true">
      <span className={`block h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent transition-opacity ${dir === 'asc' ? 'border-b-current opacity-100' : 'border-b-slate-300 opacity-40 dark:border-b-slate-600'}`} />
      <span className={`block h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent transition-opacity ${dir === 'desc' ? 'border-t-current opacity-100' : 'border-t-slate-300 opacity-40 dark:border-t-slate-600'}`} />
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  searchKeys,
  getSearchText,
  pageSize = 10,
  emptyState,
  onRowClick,
  className = '',
  minWidth = 700,
  onSearch,
  totalItems,
  currentPage,
  onPageChange,
}: DataTableProps<T>) {
  const searchId = useId();

  // ── Local state ──────────────────────────────────────────────────────────
  const [query, setQuery]         = useState('');
  const [sortKey, setSortKey]     = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<SortDir>(null);
  const [page, setPage]           = useState(1);

  // ── Search ───────────────────────────────────────────────────────────────
  const searched = useMemo(() => {
    if (onSearch) return data;
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (getSearchText) {
        // Caller-supplied flat string — supports nested fields
        return getSearchText(row).toLowerCase().includes(q);
      }
      const vals = searchKeys
        ? searchKeys.map((k) => String(row[k] ?? ''))
        : Object.values(row).map(String);
      return vals.some((v) => v.toLowerCase().includes(q));
    });
  }, [data, query, searchKeys, getSearchText]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return searched;
    const col = columns.find((c) => c.key === sortKey);
    return [...searched].sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : (a as Record<string, unknown>)[sortKey];
      const bv = col?.sortValue ? col.sortValue(b) : (b as Record<string, unknown>)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searched, sortKey, sortDir, columns]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const isServerSidePagination = totalItems !== undefined && currentPage !== undefined && onPageChange !== undefined;

  const totalPages = isServerSidePagination && pageSize > 0
    ? Math.max(1, Math.ceil(totalItems! / pageSize))
    : pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;

  const safePage = isServerSidePagination
    ? Math.min(currentPage!, totalPages)
    : Math.min(page, totalPages);

  const paginated = isServerSidePagination
    ? sorted
    : pageSize > 0 ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : sorted;

  function handlePageChange(newPage: number) {
    if (isServerSidePagination) {
      onPageChange?.(newPage);
    } else {
      setPage(newPage);
    }
  }

  // ── Column header click ──────────────────────────────────────────────────
  function handleSort(col: DataTableColumn<T>) {
    if (!col.sortable) return;
    if (sortKey !== col.key) { setSortKey(col.key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (onSearch) {
      onSearch(q);
    } else {
      setPage(1);
    }
  }

  // ── Default empty state ──────────────────────────────────────────────────
  const defaultEmptyState = (
    <EmptyState
      icon={
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      }
      title="No records found"
      description={query ? `No results for "${query}". Try a different search.` : 'There are no records to display.'}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl ${className}`}>

      {/* ── Search bar ── */}
      {searchable && (
        <div className="border-b border-slate-100 px-4 py-3 dark:border-white/[0.07]">
          <div className="relative max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500/50"
            />
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth }}>
            {/* Head */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleSort(col)}
                    className={[
                      'px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400',
                      col.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200' : '',
                      col.headerClassName ?? '',
                    ].join(' ')}
                  >
                    <span className="inline-flex items-center">
                      {col.header}
                      {col.sortable && <SortIcon dir={sortKey === col.key ? sortDir : null} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {emptyState ?? defaultEmptyState}
                  </td>
                </tr>
              ) : (
                paginated.map((row, rowIndex) => {
                  const key = rowKey ? rowKey(row, rowIndex) : rowIndex;
                  const globalIndex = (safePage - 1) * pageSize + rowIndex;
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row, globalIndex)}
                      className={[
                        'transition-colors duration-150',
                        rowIndex < paginated.length - 1 ? 'border-b border-slate-100 dark:border-white/[0.05]' : '',
                        onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]' : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.02]',
                      ].join(' ')}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-300 ${col.className ?? ''}`}
                          style={col.style}
                        >
                          {col.render
                            ? col.render(row, globalIndex)
                            : String((row as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-white/[0.07]">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {isServerSidePagination
                ? (totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1)
                : (sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1)}–{
              isServerSidePagination
                ? Math.min(safePage * pageSize, totalItems ?? 0)
                : Math.min(safePage * pageSize, sorted.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {isServerSidePagination ? totalItems : sorted.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.04]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
              .reduce<(number | '…')[]>((acc, n, i, arr) => {
                if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push('…');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handlePageChange(n as number)}
                    aria-label={`Page ${n}`}
                    aria-current={safePage === n ? 'page' : undefined}
                    className={`h-7 min-w-[28px] rounded-lg px-1.5 text-xs font-semibold transition ${
                      safePage === n
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.04]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
