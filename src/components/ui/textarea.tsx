import { cn } from 'cn'
import * as React from 'react'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground transition-colors duration-150 outline-none placeholder:text-gray-700 hover:border-gray-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-gray-100 aria-invalid:border-red-700 aria-invalid:ring-2 aria-invalid:ring-red-700/30 md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
