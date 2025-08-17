export const loginUser = jest.fn().mockResolvedValue(undefined)
export const registerUser = jest.fn().mockResolvedValue(undefined)
export const logoutUser = jest.fn().mockResolvedValue(undefined)
export const signInWithGoogle = jest.fn().mockResolvedValue(undefined)
export const signInWithPhone = jest.fn().mockResolvedValue({ confirm: jest.fn() })
export const confirmPhoneCode = jest.fn().mockResolvedValue(undefined)

export const joinPlan = jest.fn().mockResolvedValue({ joined: true, pending: false })
export const leavePlan = jest.fn().mockResolvedValue(undefined)

export const handleFollowRequest = jest.fn().mockResolvedValue(undefined)
