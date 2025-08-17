import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useJoinPlan } from '@/hooks/use-plans'
import { QueryClient } from '@tanstack/react-query'
import { TestProviders, createTestQueryClient } from './utils/test-utils'
import * as svc from '@/lib/firebase-services'

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }))
jest.mock('@/lib/firebase-services')

const planId = 'p1'
const userId = 'u1'

function JoinComponent() {
  const { mutate } = useJoinPlan()
  return <button onClick={() => mutate({ planId, userId })}>join</button>
}

describe('Join plan hook', () => {
  it('optimistically updates cache and calls service', async () => {
    const client: QueryClient = createTestQueryClient()
    // Seed cache with plan
    client.setQueryData(['plans', planId], { id: planId, participantIds: [], currentParticipants: 0 })
    client.setQueryData(['joinedPlans', userId], { pages: [{ plans: [] }], pageParams: [null] })

    render(
      <TestProviders client={client}>
        <JoinComponent />
      </TestProviders>
    )

    fireEvent.click(screen.getByText('join'))

    // Optimistic update
    const updatedPlan = client.getQueryData<any>(['plans', planId])
    expect(updatedPlan.currentParticipants).toBe(1)
    expect(updatedPlan.participantIds).toContain(userId)

    await waitFor(() => expect(svc.joinPlan).toHaveBeenCalledWith(planId, userId))
  })
})
