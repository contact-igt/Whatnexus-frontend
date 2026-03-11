"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { BillingHeader } from "./billing-header";
import { BillingKpiCards } from "./billing-kpi-cards";
import { BillingLedger } from "./billing-ledger";
import { BillingWallet } from "./billing-wallet";
import { LEDGER_DATA } from "./billing-mock-data";

export const BillingView = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Billings');
  const [startDate, setStartDate] = useState<Date | null>(new Date(2026, 2, 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date(2026, 2, 10));

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = () => {
    const headers = ['Date / Time', 'Category', 'Template', 'Campaign', 'Messages', 'Country', 'Rate', 'Meta Cost', 'Platform Fee', 'Total', 'Status'];
    const rows = LEDGER_DATA.map(row => [
      row.date, row.category, row.template, row.campaign,
      row.recipients, row.country, row.rate, row.metaCost,
      row.platformFee, row.total, row.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 animate-in fade-in zoom-in-95 duration-500 no-scrollbar pb-32">
      {/* 1. Page Header with Tabs */}
      <BillingHeader
        isDarkMode={isDarkMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onExport={handleExport}
      />

      {/* Billings Tab */}
      {activeTab === 'Billings' && (
        <>
          <BillingKpiCards isDarkMode={isDarkMode} />
          <BillingLedger isDarkMode={isDarkMode} />
        </>
      )}

      {/* Wallet & Payments Tab */}
      {activeTab === 'Wallet & Payments' && (
        <BillingWallet isDarkMode={isDarkMode} />
      )}
    </div>
  );
};
