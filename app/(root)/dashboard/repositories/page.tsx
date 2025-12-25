import AppContainer from '@/components/sidebar/app-container'
import Repository from '@/modules/repository/ui/repository'
import React from 'react'

export default function RepositoriesPage() {
  return (
    <AppContainer title="Repositories">
      <Repository />
    </AppContainer>
  )
}
