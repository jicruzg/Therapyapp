import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#dce5ec] ${hover ? 'hover:shadow-[0_4px_24px_rgba(25,64,103,0.12)] cursor-pointer' : 'shadow-[0_2px_12px_rgba(25,64,103,0.07)]'} transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
