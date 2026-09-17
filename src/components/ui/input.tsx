import { cn } from 'cn'
import * as React from 'react'

/** Geist input: 40px tall, hairline border, blue focus ring. 16px text on mobile avoids iOS zoom. */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base text-foreground transition-colors duration-150 outline-none placeholder:text-gray-700 hover:border-gray-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-muted-foreground aria-invalid:border-red-700 aria-invalid:ring-2 aria-invalid:ring-red-700/30 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Input }
