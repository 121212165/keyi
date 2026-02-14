import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: 'anonymous_user',
  isAnonymous: true,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
      state.isAnonymous = action.payload === 'anonymous_user';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.id = 'anonymous_user';
      state.isAnonymous = true;
      state.error = null;
    },
  },
});

export const { setUserId, setLoading, setError, logout } = userSlice.actions;

export default userSlice.reducer;
