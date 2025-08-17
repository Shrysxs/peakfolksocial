import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import * as svc from '@/lib/firebase-services'

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }))
jest.mock('@/lib/firebase-services')
jest.mock('firebase/auth', () => ({ onAuthStateChanged: (auth: any, cb: any) => { cb(null); return () => {} } }))
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn(async () => ({ exists: () => false })) }))

function AuthConsumer() {
  const { login, register, logout } = useAuth()
  return (
    <div>
      <button onClick={() => login('a@b.com', 'pw')}>login</button>
      <button onClick={() => register('a@b.com', 'pw', 'user')}>register</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('Auth flow', () => {
  it('calls login/register/logout services', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    fireEvent.click(screen.getByText('login'))
    await waitFor(() => expect(svc.loginUser).toHaveBeenCalledWith('a@b.com', 'pw'))

    fireEvent.click(screen.getByText('register'))
    await waitFor(() => expect(svc.registerUser).toHaveBeenCalledWith('a@b.com', 'pw', 'user'))

    fireEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(svc.logoutUser).toHaveBeenCalled())
  })
})
