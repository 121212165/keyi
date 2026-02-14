import { describe, it, expect } from 'vitest'
import assessmentReducer, {
  setType,
  setQuestions,
  setAnswer,
  setResult,
  setSubmitting,
  setError,
  resetAssessment,
} from './assessmentSlice'

describe('assessmentSlice', () => {
  const initialState = {
    type: 'phq9' as const,
    questions: [],
    answers: [],
    result: null,
    submitting: false,
    error: null,
  }

  it('should return initial state', () => {
    expect(assessmentReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should set type', () => {
    const state = assessmentReducer(initialState, setType('gad7'))
    expect(state.type).toBe('gad7')
    expect(state.questions).toEqual([])
    expect(state.answers).toEqual([])
    expect(state.result).toBeNull()
  })

  it('should set questions', () => {
    const questions = [
      { id: 1, text: 'Question 1' },
      { id: 2, text: 'Question 2' },
    ]
    const state = assessmentReducer(initialState, setQuestions(questions))
    expect(state.questions).toEqual(questions)
  })

  it('should set answer', () => {
    const state = assessmentReducer(initialState, setAnswer({ index: 0, value: 2 }))
    expect(state.answers[0]).toBe(2)
  })

  it('should set answers', () => {
    const state = assessmentReducer(initialState, setAnswers([1, 2, 3, 4]))
    expect(state.answers).toEqual([1, 2, 3, 4])
  })

  it('should set result', () => {
    const result = {
      score: 15,
      level: 'moderate',
      description: 'Moderate depression',
    }
    const state = assessmentReducer(initialState, setResult(result))
    expect(state.result).toEqual(result)
  })

  it('should set submitting', () => {
    expect(assessmentReducer(initialState, setSubmitting(true)).submitting).toBe(true)
  })

  it('should set error', () => {
    expect(assessmentReducer(initialState, setError('Failed')).error).toBe('Failed')
  })

  it('should reset assessment', () => {
    const stateWithData = {
      ...initialState,
      answers: [1, 2, 3],
      result: { score: 10, level: 'mild', description: 'Test' },
      error: 'Some error',
    }
    const reset = assessmentReducer(stateWithData, resetAssessment())
    expect(reset.answers).toEqual([])
    expect(reset.result).toBeNull()
    expect(reset.error).toBeNull()
  })
})
