import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  role: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  whatsappApiDetails: any | null;
  activeTabData: string;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  whatsappApiDetails: null,
  activeTabData: 'dashboard',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    setActiveTabData: (state, action: PayloadAction<string>) => {
      state.activeTabData = action.payload;
    },
    setWhatsAppApiDetails: (state, action: PayloadAction<{ apiDetails: any }>) => {
      state.whatsappApiDetails = action.payload;
    },
    clearAuthData: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.whatsappApiDetails = null;
      state.activeTabData = 'dashboard';
    },
  },
});

export const { setAuthData, clearAuthData, setWhatsAppApiDetails, setActiveTabData } = authSlice.actions;
export default authSlice.reducer;
