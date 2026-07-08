import { useEffect } from 'react'

const APP_NAME = 'Expense Tracker'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`
  }, [title])
}
