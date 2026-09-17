import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Unmount rendered trees between tests (Testing Library only does this itself when globals are on).
afterEach(cleanup)
