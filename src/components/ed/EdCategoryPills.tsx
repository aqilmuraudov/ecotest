import React from 'react';

interface EdCategoryPillsProps {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  /** On small screens the row scrolls horizontally instead of wrapping */
  scrollOnMobile?: boolean;
  /** Many categories: stack them as a tidy two-column grid on phones (the first one spans the full width) */
  gridOnMobile?: boolean;
}

/** Minimal category pills — amber fill for active, thin outline for rest. */
export const EdCategoryPills: React.FC<EdCategoryPillsProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
  scrollOnMobile = true,
  gridOnMobile = false
}) => (
  <div
    className={`${gridOnMobile ? 'grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2.5 md:justify-center' : scrollOnMobile ? 'ed-pill-row flex overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap' : 'flex flex-wrap'} ${gridOnMobile ? '' : 'gap-2.5 justify-start md:justify-center'} items-center ${className}`}
    style={{ scrollbarWidth: 'none' }}
  >
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`ed-pill ${active ? 'ed-pill--active' : ''} ${gridOnMobile ? 'justify-center text-center !px-3 !text-[13px] max-md:w-full max-md:first:col-span-2 max-md:!whitespace-normal max-md:leading-tight max-md:!py-2' : ''}`}
          aria-pressed={active}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);
