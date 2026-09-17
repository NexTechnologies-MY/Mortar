import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
}
