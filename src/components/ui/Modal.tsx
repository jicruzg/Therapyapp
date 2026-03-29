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
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0d1b2a]/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(25,64,103,0.2)] w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-[#dce5ec]`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#dce5ec]">
            <h2 className="text-lg font-bold text-[#0d1b2a]">{title}</h2>
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
