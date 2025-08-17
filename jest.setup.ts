import '@testing-library/jest-dom'

// Polyfill crypto.getRandomValues for libraries that need it in tests
if (!(globalThis as any).crypto) {
  ;(globalThis as any).crypto = {
    getRandomValues: (arr: Uint8Array) => require('crypto').randomFillSync(arr),
  } as Crypto
}

// Suppress noisy console.error for React act warnings etc. (keep real errors visible in CI by customizing if needed)
const originalError = console.error
console.error = (...args: any[]) => {
  const msg = args?.[0] ?? ''
  if (typeof msg === 'string' && /not wrapped in act|ReactDOMTestUtils/.test(msg)) return
  originalError(...args)
}
