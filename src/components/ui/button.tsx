import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'
import * as React from 'react'

/**
 * Geist button (https://vercel.com/geist/button). Variants map to Geist's
 * default / secondary / tertiary / error; sizes to small / medium / large.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border type-button-14 whitespace-nowrap transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-gray-900',
        outline: 'border-border bg-background text-foreground hover:border-gray-500 hover:bg-gray-100',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-gray-200',
        ghost: 'border-transparent text-muted-foreground hover:bg-gray-100 hover:text-foreground',
        destructive: 'border-transparent bg-destructive text-white hover:bg-red-800 focus-visible:ring-red-700',
        link: 'border-transparent text-blue-900 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-3.5',
        sm: 'h-8 px-3 type-label-13',
        lg: 'h-12 px-5 type-copy-16 font-medium',
        icon: 'size-10',
        'icon-sm': 'size-8'
      },
      shape: {
        rounded: '',
        pill: 'rounded-full px-6'
      }
    },
    defaultVariants: { variant: 'default', size: 'default', shape: 'rounded' }
  }
)

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, shape }), className)} {...props} />
}

export { Button, buttonVariants }
