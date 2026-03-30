import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', ...props }, ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[#0d1b2a]">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 outline-none
          ${error
            ? 'border-red-300 bg-red-50/60 focus:ring-2 focus:ring-red-200 focus:border-red-400'
            : 'border-[#dce5ec] bg-white/80 hover:border-[#b0c8de] focus:border-[#194067] focus:ring-2 focus:ring-[#194067]/10 focus:bg-white'
          }
          shadow-[0_1px_3px_rgba(25,64,103,0.05)]
          placeholder:text-[#8096a7] placeholder:font-normal text-[#0d1b2a] ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8096a7]">{hint}</span>}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  )
})
