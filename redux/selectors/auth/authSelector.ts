import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

export function useAuth() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user  = useSelector((state: RootState) => state.auth.user);
  const whatsappApiDetails = useSelector((state: RootState)=> state.auth.whatsappApiDetails)
  const activeTabData = useSelector((state: RootState)=> state.auth.activeTabData)
  return { token, user, whatsappApiDetails, activeTabData };
}