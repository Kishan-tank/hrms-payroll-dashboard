import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  separator?: boolean;
}

export interface ContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ open, x, y, items, onClose }: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: x, top: y });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const width = 200;
      let newLeft = x;
      let newTop = y;

      if (x + width > window.innerWidth) {
        newLeft = Math.max(0, x - width);
      }
      
      const estimatedHeight = items.length * 36 + (items.filter(i => i.separator).length * 9) + 8;
      if (y + estimatedHeight > window.innerHeight) {
        newTop = Math.max(0, y - estimatedHeight);
      }

      setPosition({ left: newLeft, top: newTop });
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open, x, y, items]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleScroll = () => onClose();
    
    const handleContextMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      ref={menuRef}
      className={`fixed z-[9999] w-[200px] overflow-hidden rounded-xl border-[0.5px] border-slate-200 bg-white py-1 shadow-lg transition-all duration-[120ms] dark:border-slate-700 dark:bg-slate-900 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
      }`}
      style={{ left: position.left, top: position.top }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.separator && (
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          )}
          <button
            type="button"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              item.disabled
                ? 'cursor-not-allowed opacity-40'
                : item.variant === 'danger'
                ? 'cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                : 'cursor-pointer text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
            }`}
          >
            <i className={`ti ti-${item.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
