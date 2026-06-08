import { useEffect } from 'react'

/**
 * Schedule browser notifications for morning and evening reminders.
 * Works while the browser tab is open.
 */
export function useNotifications(notifTimes, todaySession) {
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    const timers = []

    // Morning: remind only if loop not started yet
    if (!todaySession?.morning_mood) {
      const t = scheduleAt(
        notifTimes?.morning || '08:00',
        'Daily Growth 🌅',
        'Lecția ta de azi te așteaptă. Pornește ziua conștient.',
      )
      if (t) timers.push(t)
    }

    // Evening: remind only if loop not completed
    if (!todaySession?.loop_completed) {
      const t = scheduleAt(
        notifTimes?.evening || '21:00',
        'Daily Growth 🌙',
        'Cum a mers ziua? Ia 2 minute să reflectezi și să închizi bucla.',
      )
      if (t) timers.push(t)
    }

    return () => timers.forEach(clearTimeout)
  }, [notifTimes?.morning, notifTimes?.evening, todaySession?.morning_mood, todaySession?.loop_completed])
}

function scheduleAt(timeStr, title, body) {
  try {
    const [h, m] = (timeStr || '08:00').split(':').map(Number)
    const now = new Date()
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (target <= now) return null // already passed today

    const delay = target - now
    if (delay > 24 * 60 * 60 * 1000) return null // sanity guard

    return setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/vite.svg', badge: '/vite.svg' })
      }
    }, delay)
  } catch {
    return null
  }
}

export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}
