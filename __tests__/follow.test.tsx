import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useHandleFollowRequest } from '@/hooks/use-users'
import { TestProviders } from './utils/test-utils'
import * as svc from '@/lib/firebase-services'

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }))
jest.mock('@/lib/firebase-services')

function FollowComponent() {
  const { mutate, isPending } = useHandleFollowRequest()
  return (
    <button disabled={isPending} onClick={() => mutate({ requesterId: 'r1', targetUserId: 't1', accept: true })}>
      follow-accept
    </button>
  )
}

describe('Follow/unfollow', () => {
  it('accepts follow requests via service', async () => {
    render(
      <TestProviders>
        <FollowComponent />
      </TestProviders>
    )

    fireEvent.click(screen.getByText('follow-accept'))
    await waitFor(() => expect(svc.handleFollowRequest).toHaveBeenCalledWith('r1', 't1', true))
  })
})
