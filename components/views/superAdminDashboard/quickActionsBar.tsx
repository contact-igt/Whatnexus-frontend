"use client";

import React from 'react';
import { Building2, UserPlus, Send, CreditCard, Settings, Shield } from 'lucide-react';
import { glassCard, tx } from '../dashboard/glassStyles';

interface QuickActionsBarProps {
    isDarkMode?: boolean;
}

const actions = [
    { label: 'Add Tenant', icon: Building2, color: '#8b5cf6', href: '/tenant' },
    { label: 'Add Admin', icon: UserPlus, color: '#6366f1', href: '/management' },
    { label: 'Broadcast', icon: Send, color: '#10b981', href: '/campaign' },
    { label: 'Billing', icon: CreditCard, color: '#f59e0b', href: '/billing' },
    { label: 'Settings', icon: Settings, color: '#64748b', href: '/settings' },
    { label: 'Security', icon: Shield, color: '#ef4444', href: '/settings' },
];

export const QuickActionsBar = ({ isDarkMode = true }: QuickActionsBarProps) => {
    const t = tx(isDarkMode);

    return (
        <div className="rounded-xl p-4 border" style={glassCard(isDarkMode)}>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.label}
                            onClick={() => {
                                window.location.href = action.href;
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-[1.03] active:scale-[0.98]"
                            style={{
                                background: isDarkMode ? '#18181b' : '#fafafa',
                                border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`,
                            }}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${action.color}15`, color: action.color, border: `1px solid ${action.color}25` }}>
                                <Icon size={15} />
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: t.secondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
