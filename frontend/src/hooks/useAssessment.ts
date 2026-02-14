import { useCallback, useState } from 'react'
import { api } from '../api'

export interface AssessmentScale {
  scale_type: string
  name: string
  description: string
  questions: Array<{
    id: number
    text: string
  }>
}

export interface AssessmentResult {
  score: number
  level: string
  description: string
  recommendations: string[]
}

export function useAssessment() {
  const [scale, setScale] = useState<AssessmentScale | null>(null)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadScale = useCallback(async (type: 'phq9' | 'gad7' | 'pss10') => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.assessment.getScale(type)
      setScale(data)
      setResult(null)
    } catch (err) {
      setError('加载量表失败')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAssessment = useCallback(
    async (type: 'phq9' | 'gad7' | 'pss10', answers: number[]) => {
      setSubmitting(true)
      setError(null)
      try {
        const data = await api.assessment.submit(type, answers)
        setResult(data)
        return data
      } catch (err) {
        setError('提交评估失败')
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setScale(null)
    setResult(null)
    setError(null)
  }, [])

  return {
    scale,
    result,
    loading,
    submitting,
    error,
    loadScale,
    submitAssessment,
    reset,
  }
}
