import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationsState {
  whatsappUnreadCount: number;
}

const initialState: NotificationsState = {
  whatsappUnreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setWhatsAppUnreadCount: (state, action: PayloadAction<number>) => {
      state.whatsappUnreadCount = Math.max(0, action.payload || 0);
    },
    incrementWhatsAppUnreadCount: (state, action: PayloadAction<number>) => {
      state.whatsappUnreadCount = Math.max(0, state.whatsappUnreadCount + action.payload);
    },
    clearWhatsAppUnreadCount: (state) => {
      state.whatsappUnreadCount = 0;
    },
  },
});

export const {
  setWhatsAppUnreadCount,
  incrementWhatsAppUnreadCount,
  clearWhatsAppUnreadCount,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
