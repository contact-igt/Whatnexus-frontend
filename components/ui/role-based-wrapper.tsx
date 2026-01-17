"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { ReactNode } from "react";

interface RoleBasedWrapperProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode;
}

export const RoleBasedWrapper = ({ children, allowedRoles, fallback = null }: RoleBasedWrapperProps) => {
    const { user } = useAuth();
    
    if (!user || !user.role) return <>{fallback}</>;

    const hasPermission = allowedRoles.some(role =>
        role.toUpperCase() === user.role.toUpperCase()
    );

    if (!hasPermission) return <>{fallback}</>;

    return <>{children}</>;
};