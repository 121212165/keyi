import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AssessmentQuestion {
  id: number;
  text: string;
}

export interface AssessmentResult {
  score: number;
  level: string;
  description: string;
}

export interface Assessment {
  type: 'phq9' | 'gad7' | 'pss10';
  questions: AssessmentQuestion[];
  answers: number[];
  result: AssessmentResult | null;
  submitting: boolean;
  error: string | null;
}

const initialState: Assessment = {
  type: 'phq9',
  questions: [],
  answers: [],
  result: null,
  submitting: false,
  error: null,
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<'phq9' | 'gad7' | 'pss10'>) => {
      state.type = action.payload;
      state.questions = [];
      state.answers = [];
      state.result = null;
    },
    setQuestions: (state, action: PayloadAction<AssessmentQuestion[]>) => {
      state.questions = action.payload;
    },
    setAnswer: (state, action: PayloadAction<{ index: number; value: number }>) => {
      state.answers[action.payload.index] = action.payload.value;
    },
    setAnswers: (state, action: PayloadAction<number[]>) => {
      state.answers = action.payload;
    },
    setResult: (state, action: PayloadAction<AssessmentResult>) => {
      state.result = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetAssessment: (state) => {
      state.answers = [];
      state.result = null;
      state.error = null;
    },
  },
});

export const {
  setType,
  setQuestions,
  setAnswer,
  setAnswers,
  setResult,
  setSubmitting,
  setError,
  resetAssessment,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
