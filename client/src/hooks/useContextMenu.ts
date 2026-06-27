import { useState } from 'react';
import type { ContextMenuItem } from '../components/common/ContextMenu';

export interface UseContextMenuReturn {
  menuProps: {
    open: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
  };
  handleContextMenu: (
    e: React.MouseEvent,
    items: ContextMenuItem[]
  ) => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  function handleContextMenu(e: React.MouseEvent, newItems: ContextMenuItem[]) {
    e.preventDefault();
    e.stopPropagation(); // Critical: prevents onRowClick from also firing
    setPosition({ x: e.clientX, y: e.clientY });
    setItems(newItems);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return {
    menuProps: { open, x: position.x, y: position.y, items, onClose: close },
    handleContextMenu,
  };
}
