/**
 * Helper utility untuk parsing dan formatting input nominal angka Rupiah
 * Mendukung pemformatan ribuan otomatis secara visual (cth: 1000000 -> 1.000.000)
 * sehingga pengguna tidak bingung tanda titik atau koma.
 */

// Format string/number ke ribuan dengan titik (cth: "1000000" -> "1.000.000")
export function formatThousands(val: string | number | undefined | null): string {
  if (val === null || val === undefined || val === '') return ''
  const digitsOnly = String(val).replace(/\D/g, '')
  if (!digitsOnly) return ''
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Parse string berformat titik/koma ke number murni (cth: "1.000.000" -> 1000000)
export function parseThousands(val: string | number | undefined | null): number {
  if (val === null || val === undefined || val === '') return 0
  const digitsOnly = String(val).replace(/\D/g, '')
  if (!digitsOnly) return 0
  const parsed = parseInt(digitsOnly, 10)
  return isNaN(parsed) ? 0 : parsed
}
