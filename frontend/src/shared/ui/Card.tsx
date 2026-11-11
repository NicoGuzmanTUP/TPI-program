import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-borde bg-white shadow-sm ${className}`}
      {...resto}
    />
  )
}
