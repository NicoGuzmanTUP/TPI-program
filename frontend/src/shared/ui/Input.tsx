import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', type, ...resto }: InputProps) {
  const [visible, setVisible] = useState(false)
  const esPassword = type === 'password'

  const input = (
    <input
      id={id}
      type={esPassword && visible ? 'text' : type}
      className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tomate/40 ${
        esPassword ? 'pr-10' : ''
      } ${error ? 'border-red-600' : 'border-borde'} ${className}`}
      {...resto}
    />
  )

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      {esPassword ? (
        <div className="relative">
          {input}
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-tinta-suave hover:text-tinta"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {visible ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
      ) : (
        input
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
}
