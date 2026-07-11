'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'

export default function PostHogIdentify() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      })
    } else {
      posthog.reset()
    }
  }, [isLoaded, user])

  return null
}
