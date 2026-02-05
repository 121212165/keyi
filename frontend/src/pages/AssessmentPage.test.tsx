import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AssessmentPage from '../pages/AssessmentPage'

describe('AssessmentPage', () => {
  it('renders assessment page with title', () => {
    render(<AssessmentPage />)
    expect(screen.getByText(/PHQ-9 抑郁症状评估|GAD-7 焦虑症状评估|PSS-10 压力水平评估/)).toBeInTheDocument()
  })
})
