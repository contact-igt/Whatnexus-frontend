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
    Workflow,
    BadgeCheck,
    ShieldCheck,
    CreditCard,
    Mail,
    Trash2,
    Terminal,
    FlaskConical,
    Landmark,
    UserPlus,
    DollarSign,
    Image,
    BookOpen,
    Video,
    Bell,

} from 'lucide-react';

export interface SidebarItem {
    label: string;
    route: string;
    icon: LucideIcon;
    featureKey?: string;
    requiresWhatsApp?: boolean;
    requiresLocal?: boolean;
    roles?: string[];
    matchMode?: 'exact' | 'prefix';
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
                featureKey: "dashboard",
                requiresWhatsApp: false,
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
                featureKey: "chat",
                requiresWhatsApp: true,
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "History",
                route: "/shared-inbox/history",
                icon: Timer,
                featureKey: "history",
                requiresWhatsApp: true,
                roles: ['tenant_admin', 'staff']
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
                featureKey: "leadpool",
                requiresWhatsApp: true,
            },
            {
                label: "Contacts",
                route: "/contacts/contacts",
                icon: Users,
                featureKey: "contacts",
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Groups",
                route: "/contacts/groups",
                icon: Group,
                featureKey: "groups",
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Follow-up Hub",
                route: "/followups",
                icon: Clock,
                featureKey: "followups",
                requiresWhatsApp: true,
            },
            {
                label: "Appointments",
                route: "/appointments",
                icon: Calendar,
                featureKey: "appointments",
                requiresWhatsApp: true,
            },
            {
                label: "Reminders",
                route: "/reminders",
                icon: Bell,
                featureKey: "appointments",
                requiresWhatsApp: true,
            },
            // {
            //     label: "Logic",
            //     route: "/logic",
            //     icon: Workflow,
            //     requiresWhatsApp: false,
            // }
        ]
    },
    {
        groupLabel: "Marketing",
        items: [
            {
                label: "Templates",
                route: "/templates",
                icon: Zap,
                featureKey: "templates",
                requiresWhatsApp: true,
            },
            {
                label: "Campaigns",
                route: "/campaign",
                icon: Megaphone,
                featureKey: "campaign",
                requiresWhatsApp: true,
            },
            {
                label: "Media Gallery",
                route: "/gallery",
                icon: Image,
                featureKey: "media_gallery",
                requiresWhatsApp: true,
            }
        ]
    },
        {
        groupLabel: "Team Management",
        items: [
            {
                label: "Doctors",
                route: "/doctors",
                icon: Stethoscope,
                featureKey: "doctors",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Branches",
                route: "/branches",
                icon: Building2,
                featureKey: "branches",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Specialization",
                route: "/specialization",
                icon: BadgeCheck,
                featureKey: "specialization",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Courses",
                route: "/courses",
                icon: BookOpen,
                featureKey: "courses",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Sessions",
                route: "/courses/sessions",
                icon: Video,
                featureKey: "sessions",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Mentors",
                route: "/courses/mentors",
                icon: UserCircle,
                featureKey: "mentors",
                requiresWhatsApp: false,
                matchMode: 'exact',
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "Agent Matrix",
                route: "/team",
                icon: Users2,
                featureKey: "agent_matrix",
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff']
            }
        ]
    },
    {
        groupLabel: "Knowledge Base",
        items: [
            {
                label: "Knowledge Base",
                route: "/knowledge?tab=data-sources",
                icon: Database,
                featureKey: "knowledge",
                requiresWhatsApp: false,
            }
        ]
    },
    {
        groupLabel: "Billing",
        items: [
            {
                label: "Billing & Payments",
                route: "/billing",
                icon: CreditCard,
                featureKey: "billing_payment",
                requiresWhatsApp: true,
                roles: ['tenant_admin']
            }
        ]
    },
    {
        groupLabel: "Settings",
        items: [
            {
                label: "General Settings",
                route: "/settings/general",
                icon: Settings,
                featureKey: "general_settings",
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "WhatsApp Settings",
                route: "/settings/whatsapp-settings",
                icon: MessageSquare,
                featureKey: "whatsapp_settings",
                requiresWhatsApp: false,
                roles: ['tenant_admin', 'staff']
            },
            {
                label: "WhatsApp Playground",
                route: "/settings/whatsapp-playground",
                icon: FlaskConical,
                featureKey: "whatsapp_playground",
                requiresWhatsApp: false,
                requiresLocal: true,
                roles: ['tenant_admin', 'staff']
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
                label: "Command Center",
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
                icon: Landmark,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Tenant Onboarding",
                route: "/management/onboarded",
                icon: UserPlus,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Tenant Invitations",
                route: "/management/invitations",
                icon: Mail,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Tenant Access Control",
                route: "/management/tenant-access",
                icon: ShieldCheck,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Industries",
                route: "/management/industries",
                icon: Building2,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "SaaS Modules",
                route: "/management/saas-modules",
                icon: Database,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Plans",
                route: "/management/plans",
                icon: CreditCard,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Industry Module Mapping",
                route: "/management/industry-module-mapping",
                icon: Workflow,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Plan Module Mapping",
                route: "/management/plan-module-mapping",
                icon: Terminal,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Tenant Dynamic Access",
                route: "/management/tenant-dynamic-access",
                icon: ShieldCheck,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "System Admins",
                route: "/platformAdmins",
                icon: UserCog,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            },
            {
                label: "Admin Billing",
                route: "/admin-billing",
                icon: CreditCard,
                requiresWhatsApp: false,
                roles: ['super_admin']
            },
            {
                label: "Pricing & Rates",
                route: "/pricing",
                icon: DollarSign,
                requiresWhatsApp: false,
                roles: ['super_admin', 'platform_admin']
            }
        ]
    }
];
