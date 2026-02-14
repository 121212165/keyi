import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import assessmentReducer from './slices/assessmentSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    assessment: assessmentReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action 中的 Date 对象
        ignoredActions: ['chat/addMessage'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
