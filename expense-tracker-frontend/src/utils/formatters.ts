export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(`${date}T00:00:00`))
}

export function formatDateForApi(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeDateForInput(date?: string): string {
  if (!date) {
    return formatDateForApi()
  }

  return date.split('T')[0]
}

export function formatMemberSince(date?: string): string {
  if (!date) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
  }).format(new Date(date))
}
