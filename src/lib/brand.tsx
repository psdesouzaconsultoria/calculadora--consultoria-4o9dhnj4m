// Identidade visual PS DE SOUZA — CONSULTORIA & SERVIÇOS CONTÁBIL
// Importe e use <BrandLogo /> onde precisar exibir o logotipo original da empresa.
import logo from '@/assets/2025-08-logo-ps-de-souza-azul-ac109.jpg'
import { cn } from '@/lib/utils'

export const LOGO_SRC = logo

interface BrandLogoProps {
  className?: string
  alt?: string
}

/** Logotipo original da PS DE SOUZA (coluna dourada sobre azul-marinho). */
export function BrandLogo({
  className,
  alt = 'PS DE SOUZA — Consultoria & Serviços Contábil',
}: BrandLogoProps) {
  return <img src={LOGO_SRC} alt={alt} className={cn('object-contain', className)} />
}
