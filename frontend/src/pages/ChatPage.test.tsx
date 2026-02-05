import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatPage from '../pages/ChatPage'

describe('ChatPage', () => {
  it('renders chat page with initial message', () => {
    render(<ChatPage />)
    expect(screen.getByText('心理咨询对话')).toBeInTheDocument()
  })
})
