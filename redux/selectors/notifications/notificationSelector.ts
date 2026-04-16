"use client"

import type { RootState } from '@/redux/store';
import { useSelector, shallowEqual } from 'react-redux';

export function useNotifications() {
  return useSelector(
    (state: RootState) => ({
      unreadCount: state.notifications.whatsappUnreadCount,
    }),
    shallowEqual
  );
}
