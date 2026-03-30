import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  glass?: boolean
  flush?: boolean
}

export function Card({ children, className = '', hover = false, glass = false, flush = false, ...props }: CardProps) {
  const base = `rounded-2xl border transition-all duration-200`
  const surface = glass
    ? 'bg-white/75 backdrop-blur-xl border-white/60 shadow-[0_2px_16px_rgba(25,64,103,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]'
    : 'bg-white border-[#dce5ec]/80 shadow-[0_2px_12px_rgba(25,64,103,0.07),0_1px_3px_rgba(0,0,0,0.03)]'
  const interactive = hover
    ? 'hover:shadow-[0_8px_32px_rgba(25,64,103,0.14),0_2px_8px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:border-[#c8d8e8] cursor-pointer'
    : ''
  return (
    <div
      className={`${base} ${surface} ${interactive} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
