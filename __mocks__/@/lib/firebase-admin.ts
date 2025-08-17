export const adminAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user' }),
}

function createDoc(id?: string) {
  return {
    id: id ?? 'doc-id',
    set: jest.fn(),
    get: jest.fn(),
  }
}

function createCollection() {
  return {
    doc: jest.fn(() => createDoc()),
  }
}

export const FieldValue = {
  arrayUnion: (...args: any[]) => ({ __arrayUnion: args }),
}

export const adminDb = {
  collection: jest.fn(() => createCollection()),
  runTransaction: jest.fn(async (fn: any) => fn({
    get: jest.fn(async (ref: any) => ({ exists: true, data: () => ({ participantIds: [], currentParticipants: 0, userId: 'owner-id', title: 'Trip', isPrivate: false }) })),
    update: jest.fn(),
    set: jest.fn(),
  })),
}
