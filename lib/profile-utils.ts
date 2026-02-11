/**
 * Get the profile route path based on user role
 * @param role - User role from Redux store
 * @returns Profile route path
 */
export const getProfileRoute = (role: string): string => {
    const managementRoles = ['super_admin', 'platform_admin'];
    const tenantRoles = ['staff', 'agent', 'doctor', 'tenant_admin'];

    if (managementRoles.includes(role)) {
        return '/management/profile';
    } else if (tenantRoles.includes(role)) {
        return '/tenant/profile';
    }

    // Default fallback
    return '/tenant/profile';
};

/**
 * Check if user is a management user
 * @param role - User role from Redux store
 * @returns true if management user, false otherwise
 */
export const isManagementUser = (role: string): boolean => {
    return ['super_admin', 'platform_admin'].includes(role);
};

/**
 * Check if user is a tenant user
 * @param role - User role from Redux store
 * @returns true if tenant user, false otherwise
 */
export const isTenantUser = (role: string): boolean => {
    return ['staff', 'agent', 'doctor', 'tenant_admin'].includes(role);
};
