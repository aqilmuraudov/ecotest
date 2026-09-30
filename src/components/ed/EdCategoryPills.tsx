import React from 'react';

interface EdCategoryPillsProps {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  /** On small screens the row scrolls horizontally instead of wrapping */
  scrollOnMobile?: boolean;
}

/** Minimal category pills — amber fill for active, thin outline for rest. */
export const EdCategoryPills: React.FC<EdCategoryPillsProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
  scrollOnMobile = true
}) => (
  <div
    className={`${scrollOnMobile ? 'flex overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap' : 'flex flex-wrap'} gap-2.5 justify-start md:justify-center items-center ${className}`}
    style={{ scrollbarWidth: 'none' }}
  >
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`ed-pill ${active ? 'ed-pill--active' : ''}`}
          aria-pressed={active}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);
