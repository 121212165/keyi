import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  sessionId: string;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  sessionId: '',
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.sending = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.sessionId = '';
      state.messages = [];
      state.error = null;
    },
  },
});

export const {
  setSessionId,
  setMessages,
  addMessage,
  setLoading,
  setSending,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
