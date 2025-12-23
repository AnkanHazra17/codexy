import AuthLayout from '@/modules/auth/layouts/auth-layout'
import React from 'react'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  )
}
