import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Calendar,
    Database,
    Megaphone,
    Zap,
    Settings,
    Building2,
    MessageCircle,
    Timer,
    Group,
    Users2,
    Smartphone,
    UserCog,
    UserCircle,
    LucideIcon,
    Stethoscope,
    Filter,
    Clock,
    Workflow
} from 'lucide-react';

export interface SidebarItem {
    label: string;
    route: string;
    icon: LucideIcon;
    requiresWhatsApp?: boolean;
    roles?: string[];
}

export interface SidebarGroup {
    groupLabel: string;
    items: SidebarItem[];
}

// Tenant (Client) Sidebar Configuration
export const tenantSidebarConfig: SidebarGroup[] = [
    {
        groupLabel: "Dashboard",
        items: [
            {
                label: "Neural Hub",
                route: "/dashboard",
                icon: LayoutDashboard,
                requiresWhatsApp: false,
            }
        ]
    },
    {
        groupLabel: "Team Management",
        items: [
            {
                label: "Agent Matrix",
                route: "/team",
                icon: Users2,
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            },
            {
                label: "Doctors",
                route: "/doctors",
                icon: Stethoscope,
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            }
        ]
    },
    {
        groupLabel: "Communication",
        items: [
            {
                label: "Chats",
                route: "/shared-inbox/live-chats",
                icon: MessageCircle,
                requiresWhatsApp: true,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            },
            {
                label: "History",
                route: "/shared-inbox/history",
                icon: Timer,
                requiresWhatsApp: true,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            }
        ]
    },
    {
        groupLabel: "Contacts & Leads",
        items: [
            {
                label: "Lead Pool",
                route: "/leads",
                icon: Filter,
                requiresWhatsApp: true,
            },
            {
                label: "Contacts",
                route: "/contacts/contacts",
                icon: Users,
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            },
            {
                label: "Groups",
                route: "/contacts/groups",
                icon: Group,
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            },
            {
                label: "Follow-ups",
                route: "/followups",
                icon: Clock,
                requiresWhatsApp: true,
            },
            {
                label: "Appointment",
                route: "/appointments",
                icon: Calendar,
                requiresWhatsApp: false,
            },
            {
                label: "Logic",
                route: "/logic",
                icon: Workflow,
                requiresWhatsApp: false,
            }
        ]
    },
    {
        groupLabel: "Marketing",
        items: [
            {
                label: "Templates",
                route: "/templates",
                icon: Zap,
                requiresWhatsApp: true,
            },
            {
                label: "Campaign",
                route: "/campaign",
                icon: Megaphone,
                requiresWhatsApp: true,
            }
        ]
    },
    {
        groupLabel: "Knowledge Base",
        items: [
            {
                label: "Knowledge",
                route: "/knowledge",
                icon: Database,
                requiresWhatsApp: false,
            }
        ]
    },
    {
        groupLabel: "Settings",
        items: [
            {
                label: "WhatsApp Settings",
                route: "/settings/whatsapp-settings",
                icon: MessageSquare,
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff', 'doctor', 'agent']
            }
        ]
    },
];

// Management (Platform/Super Admin) Sidebar Configuration
export const managementSidebarConfig: SidebarGroup[] = [
    {
        groupLabel: "Dashboard",
        items: [
            {
                label: "Neural Hub",
                route: "/dashboard",
                icon: LayoutDashboard,
                requiresWhatsApp: false,
            }
        ]
    },
    {
        groupLabel: "Platform Management",
        items: [
            {
                label: "Organizations",
                route: "/organizations",
                icon: Building2,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "System Admins",
                route: "/platform-admins",
                icon: UserCog,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            }
        ]
    }
];
