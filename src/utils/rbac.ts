import { UserRole } from '../types';
import { PageId } from '../components/layout/Sidebar';

export interface RolePermissions {
  allowedPages: PageId[];
  canEditBins: boolean;
  canDeleteBins: boolean;
  canCreateRequests: boolean;
  canAssignRequests: boolean;
  canCancelRequests: boolean;
  canManageRoutes: boolean;
  canManageFleet: boolean;
  canViewFinancialsAndSecrets: boolean;
  canAccessSettings: boolean;
  canAccessAnalytics: boolean;
  canResetData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    allowedPages: ['overview', 'bins', 'requests', 'routes', 'fleet', 'analytics', 'notifications', 'settings'],
    canEditBins: true,
    canDeleteBins: true,
    canCreateRequests: true,
    canAssignRequests: true,
    canCancelRequests: true,
    canManageRoutes: true,
    canManageFleet: true,
    canViewFinancialsAndSecrets: true,
    canAccessSettings: true,
    canAccessAnalytics: true,
    canResetData: true
  },
  manager: {
    allowedPages: ['overview', 'bins', 'requests', 'routes', 'fleet', 'analytics', 'notifications'],
    canEditBins: true,
    canDeleteBins: false, // Managers cannot delete physical infrastructure
    canCreateRequests: true,
    canAssignRequests: true,
    canCancelRequests: true,
    canManageRoutes: true,
    canManageFleet: false, // View only, cannot delete/modify fleet
    canViewFinancialsAndSecrets: false, // No admin secrets, API tokens, or salary/financial logs
    canAccessSettings: false, // Only admin can access system settings & secrets
    canAccessAnalytics: true,
    canResetData: false
  },
  worker: {
    allowedPages: ['overview', 'requests', 'routes', 'bins', 'notifications'],
    canEditBins: false, // Field workers report/clear bins, cannot reconfigure them
    canDeleteBins: false,
    canCreateRequests: false,
    canAssignRequests: false,
    canCancelRequests: false,
    canManageRoutes: false,
    canManageFleet: false,
    canViewFinancialsAndSecrets: false,
    canAccessSettings: false,
    canAccessAnalytics: false,
    canResetData: false
  }
};

export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.worker;
  return !!perms[permission];
};

export const canAccessPage = (role: UserRole, page: PageId): boolean => {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.worker;
  return perms.allowedPages.includes(page);
};
