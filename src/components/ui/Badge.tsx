import type { ReactNode } from 'react'

type Color = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray' | 'orange' | 'navy'

interface BadgeProps {
  color?: Color
  children: ReactNode
  className?: string
}

const colors: Record<Color, string> = {
  green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 border border-amber-200',
  red: 'bg-red-100 text-red-700 border border-red-200',
  blue: 'bg-blue-100 text-blue-700 border border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  orange: 'bg-[#fff8e1] text-[#e6971a] border border-[#f9a825]/30',
  navy: 'bg-[#e8f0f7] text-[#194067] border border-[#194067]/20',
}

export function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
