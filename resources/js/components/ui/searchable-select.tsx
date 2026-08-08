import { CheckIcon, ChevronDownIcon, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SearchableSelectOption = {
    value: string;
    label: string;
};

export type SearchableSelectProps = {
    value: string;
    onValueChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
};

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder,
    searchPlaceholder = 'Search...',
    emptyText = 'No results',
    className,
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return options;
        }

        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    const openDropdown = () => {
        const el = triggerRef.current;

        if (!el) {
            return;
        }

        const rect = el.getBoundingClientRect();

        setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        setQuery('');
        setOpen(true);
    };

    useEffect(() => {
        if (!open) {
            setPosition(null);

            return;
        }

        const onMouseDown = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        const onScroll = (e: Event) => {
            if (
                dropdownRef.current &&
                dropdownRef.current.contains(e.target as Node)
            ) {
                return;
            }

            setOpen(false);
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('scroll', onScroll, true);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [open]);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={openDropdown}
                className={cn(
                    'border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
                    className,
                )}
            >
                <span
                    className={cn(
                        'line-clamp-1 text-left',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
            </button>
            {open && position && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        zIndex: 50,
                    }}
                    className="bg-popover text-popover-foreground flex min-w-40 flex-col overflow-hidden rounded-md border shadow-md"
                >
                    <div className="flex items-center gap-2 border-b px-2 py-1.5">
                        <Search className="size-4 shrink-0 opacity-50" />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-8 border-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filtered.length === 0 && (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </p>
                        )}
                        {filtered.map((o) => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => {
                                    onValueChange(o.value);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 pr-8 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                    o.value === value &&
                                        'bg-accent text-accent-foreground',
                                )}
                            >
                                <span className="line-clamp-1">{o.label}</span>
                                {o.value === value && (
                                    <CheckIcon className="size-4 shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
