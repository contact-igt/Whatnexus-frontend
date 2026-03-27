"use client"
import type { RootState } from '@/redux/store';
import { useSelector, shallowEqual } from 'react-redux';

export function useAuth() {
  return useSelector(
    (state: RootState) => ({
      token: state.auth.token,
      user: state.auth.user,
      whatsappApiDetails: state.auth.whatsappApiDetails,
      activeTabData: state.auth.activeTabData,
      activationToken: state.auth.activationToken,
      activeStatus: state.auth.activeStatus,
      currentStatusDataState: state.auth.currentStatusDataState,
    }),
    shallowEqual
  );
}