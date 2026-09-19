import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OwnerBadge } from '../OwnerBadge'

describe('OwnerBadge', () => {
  it('renders the role and name', () => {
    render(<OwnerBadge role="loan_admin" name="Tan Mei Ling" />)
    expect(screen.getByText('Loan Admin · Tan Mei Ling')).not.toBeNull()
  })

  it('renders the role alone when no name is given', () => {
    render(<OwnerBadge role="legal" />)
    expect(screen.getByText('Legal')).not.toBeNull()
  })
})
