// ─── BILLING MOCK DATA ───
// All monetary values are computed by the platform from:
// (message_count × rate_card[category][country]) + platform_fee
// Nothing here is pulled from a Meta billing API.

export const WALLET_DATA = {
  balance: 1247.50,
  currency: 'USD',
  lastTopUp: { date: '2026-02-28', amount: 500 },
  autoRecharge: { enabled: true, threshold: 100, amount: 500 },
  estimatedDaysRemaining: 18,
  avgDailySpend: 69.30,
};

export const BILLING_KPI = {
  walletBalance: { value: '$1,247.50', trend: '+$500.00', trendLabel: 'Last top-up', percent: 62 },
  totalSpend: { value: '$2,138.42', trend: '+12.4%', trendLabel: 'vs last month', percent: 71 },
  marketingSpend: { value: '$1,486.20', trend: '+18.2%', trendLabel: 'vs last month', percent: 85 },
  utilitySpend: { value: '$389.60', trend: '-4.1%', trendLabel: 'vs last month', percent: 45 },
  authSpend: { value: '$262.62', trend: '+6.8%', trendLabel: 'vs last month', percent: 30 },
  freeTierUsage: { value: '14,820', trend: '+22%', trendLabel: 'messages free', percent: 55 },
  messagesSent: { value: '48,290', trend: '+9.3%', trendLabel: 'total this month', percent: 78 },
  billingStatus: 'Active',
  avgCostPerConversation: '$0.044',
  billableConversations: '33,470',
};

export const DAILY_SPEND_DATA = [
  { day: 'Mar 1', marketing: 52, utility: 14, auth: 9 },
  { day: 'Mar 2', marketing: 48, utility: 12, auth: 8 },
  { day: 'Mar 3', marketing: 61, utility: 16, auth: 11 },
  { day: 'Mar 4', marketing: 44, utility: 11, auth: 7 },
  { day: 'Mar 5', marketing: 55, utility: 15, auth: 10 },
  { day: 'Mar 6', marketing: 72, utility: 18, auth: 12 },
  { day: 'Mar 7', marketing: 63, utility: 14, auth: 9 },
  { day: 'Mar 8', marketing: 58, utility: 13, auth: 10 },
  { day: 'Mar 9', marketing: 49, utility: 12, auth: 8 },
  { day: 'Mar 10', marketing: 42, utility: 10, auth: 7 },
];

export const WEEKLY_SPEND_DATA = [
  { week: 'Week 1', marketing: 205, utility: 53, auth: 35 },
  { week: 'Week 2', marketing: 248, utility: 60, auth: 41 },
  { week: 'Week 3', marketing: 220, utility: 49, auth: 33 },
  { week: 'Week 4', marketing: 192, utility: 45, auth: 29 },
];

export const MONTHLY_SPEND_DATA = [
  { month: 'Oct', marketing: 820, utility: 210, auth: 140 },
  { month: 'Nov', marketing: 950, utility: 240, auth: 160 },
  { month: 'Dec', marketing: 1100, utility: 260, auth: 190 },
  { month: 'Jan', marketing: 1250, utility: 280, auth: 210 },
  { month: 'Feb', marketing: 1380, utility: 310, auth: 230 },
  { month: 'Mar', marketing: 1486, utility: 390, auth: 263 },
];

export const CATEGORY_DATA = {
  marketing: {
    totalSpend: '$1,486.20',
    messageCount: '18,420',
    percentOfTotal: 69.5,
    trend: '+18.2%',
    avgCostPerMsg: '$0.0807',
    conversations: '12,840',
  },
  utility: {
    totalSpend: '$389.60',
    chargedMessages: '8,240',
    freeMessages: '6,180',
    percentOfTotal: 18.2,
    trend: '-4.1%',
    avgCostPerMsg: '$0.0473',
    conversations: '7,120',
  },
  authentication: {
    totalSpend: '$262.62',
    messageCount: '6,810',
    deliveryRate: '98.4%',
    percentOfTotal: 12.3,
    trend: '+6.8%',
    avgCostPerMsg: '$0.0386',
    conversations: '6,810',
  },
  freeTier: {
    volume: '14,820',
    estimatedSavings: '$1,196.40',
    windowUtilization: '87%',
    conversations: '6,700',
  },
};

export const TOP_TEMPLATES = [
  { name: 'welcome_offer_v3', category: 'Marketing', sent: 4820, cost: '$389.22', costPerMsg: '$0.081', conversionRate: '12.4%' },
  { name: 'order_confirmation', category: 'Utility', sent: 3210, cost: '$128.40', costPerMsg: '$0.040', conversionRate: '—' },
  { name: 'appointment_reminder', category: 'Utility', sent: 2840, cost: '$113.60', costPerMsg: '$0.040', conversionRate: '—' },
  { name: 'otp_verification', category: 'Authentication', sent: 6810, cost: '$262.62', costPerMsg: '$0.039', conversionRate: '—' },
  { name: 'flash_sale_jan', category: 'Marketing', sent: 3600, cost: '$291.60', costPerMsg: '$0.081', conversionRate: '8.7%' },
  { name: 'loyalty_reward_q1', category: 'Marketing', sent: 2100, cost: '$169.90', costPerMsg: '$0.081', conversionRate: '15.2%' },
];

export const TOP_CAMPAIGNS = [
  { name: 'New Year Flash Sale', template: 'flash_sale_jan', recipients: 8400, cost: '$680.40', costPerRecipient: '$0.081', deliveryRate: '97.2%' },
  { name: 'Welcome Series', template: 'welcome_offer_v3', recipients: 4820, cost: '$389.22', costPerRecipient: '$0.081', deliveryRate: '99.1%' },
  { name: 'Re-Engagement Q1', template: 'comeback_offer', recipients: 3200, cost: '$259.20', costPerRecipient: '$0.081', deliveryRate: '96.8%' },
  { name: 'Loyalty Rewards Drop', template: 'loyalty_reward_q1', recipients: 2100, cost: '$169.90', costPerRecipient: '$0.081', deliveryRate: '98.5%' },
];

export const COUNTRY_SPEND = [
  { country: 'India', code: 'IN', messages: 22400, spend: '$672.00', rate: '$0.03' },
  { country: 'United States', code: 'US', messages: 6800, spend: '$510.00', rate: '$0.075' },
  { country: 'United Kingdom', code: 'GB', messages: 4200, spend: '$357.00', rate: '$0.085' },
  { country: 'UAE', code: 'AE', messages: 3100, spend: '$248.00', rate: '$0.08' },
  { country: 'Germany', code: 'DE', messages: 2400, spend: '$204.00', rate: '$0.085' },
];

export const LEDGER_DATA = [
  { date: '2026-03-10 14:22', category: 'Marketing', template: 'welcome_offer_v3', campaign: 'Welcome Series', recipients: 120, country: 'India', rate: '$0.030', metaCost: '$3.60', platformFee: '$0.36', total: '$3.96', status: 'Delivered' },
  { date: '2026-03-10 13:55', category: 'Authentication', template: 'otp_verification', campaign: '—', recipients: 45, country: 'US', rate: '$0.045', metaCost: '$2.03', platformFee: '$0.20', total: '$2.23', status: 'Delivered' },
  { date: '2026-03-10 12:10', category: 'Utility', template: 'order_confirmation', campaign: '—', recipients: 88, country: 'India', rate: '$0.020', metaCost: '$1.76', platformFee: '$0.18', total: '$1.94', status: 'Delivered' },
  { date: '2026-03-10 11:30', category: 'Marketing', template: 'flash_sale_jan', campaign: 'Flash Sale', recipients: 1200, country: 'UK', rate: '$0.085', metaCost: '$102.00', platformFee: '$10.20', total: '$112.20', status: 'Delivered' },
  { date: '2026-03-09 18:42', category: 'Free', template: 'service_reply', campaign: '—', recipients: 64, country: 'India', rate: '$0.000', metaCost: '$0.00', platformFee: '$0.00', total: '$0.00', status: 'Delivered' },
  { date: '2026-03-09 16:20', category: 'Marketing', template: 'comeback_offer', campaign: 'Re-Engagement Q1', recipients: 800, country: 'UAE', rate: '$0.080', metaCost: '$64.00', platformFee: '$6.40', total: '$70.40', status: 'Delivered' },
  { date: '2026-03-09 14:05', category: 'Utility', template: 'appointment_reminder', campaign: '—', recipients: 210, country: 'Germany', rate: '$0.025', metaCost: '$5.25', platformFee: '$0.53', total: '$5.78', status: 'Pending' },
  { date: '2026-03-09 09:15', category: 'Authentication', template: 'otp_verification', campaign: '—', recipients: 32, country: 'US', rate: '$0.045', metaCost: '$1.44', platformFee: '$0.14', total: '$1.58', status: 'Failed' },
  { date: '2026-03-08 20:30', category: 'Marketing', template: 'loyalty_reward_q1', campaign: 'Loyalty Rewards Drop', recipients: 540, country: 'India', rate: '$0.030', metaCost: '$16.20', platformFee: '$1.62', total: '$17.82', status: 'Delivered' },
  { date: '2026-03-08 16:12', category: 'Utility', template: 'order_confirmation', campaign: '—', recipients: 156, country: 'UK', rate: '$0.085', metaCost: '$13.26', platformFee: '$1.33', total: '$14.59', status: 'Delivered' },
  { date: '2026-03-08 11:45', category: 'Free', template: 'service_reply', campaign: '—', recipients: 92, country: 'UAE', rate: '$0.000', metaCost: '$0.00', platformFee: '$0.00', total: '$0.00', status: 'Delivered' },
  { date: '2026-03-07 09:00', category: 'Authentication', template: 'otp_verification', campaign: '—', recipients: 78, country: 'India', rate: '$0.005', metaCost: '$0.39', platformFee: '$0.04', total: '$0.43', status: 'Delivered' },
];

export const INVOICES = [
  { id: 'INV-2026-003', period: 'Feb 2026', messages: '42,100', metaCost: '$1,684.00', platformFee: '$168.40', total: '$1,852.40', status: 'Paid' },
  { id: 'INV-2026-002', period: 'Jan 2026', messages: '38,400', metaCost: '$1,536.00', platformFee: '$153.60', total: '$1,689.60', status: 'Paid' },
  { id: 'INV-2026-001', period: 'Dec 2025', messages: '35,200', metaCost: '$1,408.00', platformFee: '$140.80', total: '$1,548.80', status: 'Paid' },
];
