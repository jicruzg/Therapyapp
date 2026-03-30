import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, centered dialog on sm+ */}
      <div className={`
        relative bg-white w-full ${sizes[size]} max-h-[92dvh] flex flex-col
        rounded-t-3xl sm:rounded-2xl
        shadow-[0_-4px_32px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)] sm:shadow-[0_20px_60px_rgba(25,64,103,0.2)]
        border-0 sm:border sm:border-[#dce5ec]
        animate-sheet
      `}>
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-[#dce5ec] rounded-full" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-[#f0f4f8]">
            <h2 className="text-base sm:text-lg font-bold text-[#0d1b2a]">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f0f4f8] rounded-xl transition-colors text-[#526070] hover:text-[#0d1b2a]"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}
