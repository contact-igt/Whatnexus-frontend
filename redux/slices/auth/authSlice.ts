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
  activationToken: string | null;
  activeTabData: string;
  activeStatus: any;
  currentStatusDataState: any;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  whatsappApiDetails: null,
  activationToken: null,
  activeTabData: 'dashboard',
  activeStatus: 'pending',
  currentStatusDataState: null,
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
    setActivationToken: (state, action: PayloadAction<string>) => {
      state.activationToken = action.payload;
    },
    setCurrentStatusData: (state, action: PayloadAction<any>) => {
      state.currentStatusDataState = action.payload;
    },
    setActiveStatus: (state, action: PayloadAction<any>) => {
      state.activeStatus = action.payload;
    },
    resetActiveStatus: (state)=>{
      state.activeStatus = "pending";
      state.currentStatusDataState = null;
    },
    clearAuthData: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.whatsappApiDetails = null;
      state.activationToken = null;
      state.activeTabData = 'dashboard';
      state.activeStatus = 'pending';
      state.currentStatusDataState = null;
    },
  },
});

export const { setAuthData, clearAuthData, setWhatsAppApiDetails, setActiveTabData, setActivationToken, setCurrentStatusData, setActiveStatus, resetActiveStatus } = authSlice.actions;
export default authSlice.reducer;
