import { POST } from '@/app/api/plans/[planId]/join/route'
import { NextResponse } from 'next/server'
import * as admin from '@/lib/firebase-admin'

jest.mock('@/lib/firebase-admin')

function makeReq(token?: string) {
  const headers: any = new Headers()
  if (token) headers.set('authorization', `Bearer ${token}`)
  const req = new Request('http://localhost/api/plans/p1/join', { method: 'POST', headers }) as any
  return req
}

describe('API /plans/[planId]/join', () => {
  it('returns 401 when missing token', async () => {
    const res = await POST(makeReq(), { params: { planId: 'p1' } as any })
    const json = await (res as NextResponse).json()
    expect(json.error).toBeDefined()
  })

  it('joins a public plan', async () => {
    ;(admin as any).adminAuth.verifyIdToken.mockResolvedValue({ uid: 'u1' })
    const res = await POST(makeReq('tok'), { params: { planId: 'p1' } as any })
    const json = await (res as any).json()
    expect(json.ok).toBe(true)
    expect(json.joined).toBe(true)
  })
})
