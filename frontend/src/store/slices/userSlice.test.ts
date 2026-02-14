import { describe, it, expect } from 'vitest'
import userReducer, { setUserId, setLoading, setError, logout } from './userSlice'

describe('userSlice', () => {
  const initialState = {
    id: 'anonymous_user',
    isAnonymous: true,
    loading: false,
    error: null,
  }

  it('should return initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should set userId', () => {
    const state = userReducer(initialState, setUserId('user-123'))
    expect(state.id).toBe('user-123')
    expect(state.isAnonymous).toBe(false)
  })

  it('should detect anonymous user', () => {
    const state = userReducer(initialState, setUserId('anonymous_user'))
    expect(state.isAnonymous).toBe(true)
  })

  it('should set loading', () => {
    expect(userReducer(initialState, setLoading(true)).loading).toBe(true)
  })

  it('should set error', () => {
    expect(userReducer(initialState, setError('Auth failed')).error).toBe('Auth failed')
  })

  it('should logout', () => {
    const loggedInState = {
      ...initialState,
      id: 'user-123',
      isAnonymous: false,
    }
    const state = userReducer(loggedInState, logout())
    expect(state.id).toBe('anonymous_user')
    expect(state.isAnonymous).toBe(true)
    expect(state.error).toBeNull()
  })
})
