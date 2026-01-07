import { useAuth } from '@/redux/selectors/auth/authSelector';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: any }) => {
    const { token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!token) {
            router.replace(`/login?from=${encodeURIComponent(pathname)}`)
        }
    }, [token, router, pathname]);

    if(!token) return null;

    return <>{children}</>;
};

export default ProtectedRoute;