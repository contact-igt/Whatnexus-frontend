"use client";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const MANAGEMENT_PATH_PREFIXES = [
    '/management',
    '/organizations',
    '/platformAdmins',
    '/admin-billing',
    '/pricing',
];

const isManagementScopePath = (pathname: string) => {
    return MANAGEMENT_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!token) {
            const loginPath = isManagementScopePath(pathname)
                ? '/management/login'
                : '/login';
            router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`);
        }
    }, [token, router, pathname]);

    if (!token) return null;

    return <>{children}</>;
};

export default ProtectedRoute;
