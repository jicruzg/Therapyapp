import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', children, loading, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.96]'
  const variants = {
    primary:   'bg-[#f9a825] text-[#0d1b2a] hover:bg-[#e6971a] shadow-[0_2px_12px_rgba(249,168,37,0.28)] hover:shadow-[0_6px_24px_rgba(249,168,37,0.42)] hover:-translate-y-px',
    secondary: 'bg-[#194067] text-white hover:bg-[#1e5080] shadow-[0_2px_12px_rgba(25,64,103,0.22)] hover:shadow-[0_6px_24px_rgba(25,64,103,0.36)] hover:-translate-y-px',
    ghost:     'text-[#526070] hover:bg-[#e8f0f7] hover:text-[#194067]',
    danger:    'bg-red-500 text-white hover:bg-red-600 shadow-[0_2px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.38)] hover:-translate-y-px',
    outline:   'border-2 border-[#194067]/25 text-[#194067] hover:bg-[#e8f0f7] hover:border-[#194067]/50',
  }
  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
