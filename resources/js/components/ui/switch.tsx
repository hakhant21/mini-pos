import * as React from 'react'
import { cn } from '@/lib/utils'

function Switch({
    className,
    checked,
    onCheckedChange,
    disabled,
    ...props
}: {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
} & React.HTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            data-state={checked ? 'checked' : 'unchecked'}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                'focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
                className,
            )}
            {...props}
        >
            <span
                data-state={checked ? 'checked' : 'unchecked'}
                className={cn(
                    'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5',
                )}
            />
        </button>
    )
}

export { Switch }
