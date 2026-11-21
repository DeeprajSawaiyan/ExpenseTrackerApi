import { useEffect } from 'react'

const APP_NAME = 'ExpTrack'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`
  }, [title])
}
