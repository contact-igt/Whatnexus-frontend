
"use client";

import { useEffect, useState } from 'react';
import { WelcomeScreen } from "@/components/views/welcome-screen";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardView } from "@/components/views/dashboard-view";
import { LeadsView } from "@/components/views/leads-view";
import { ChatView } from "@/components/views/chat-view";
import { TeamManagementView } from "@/components/views/team-view";
import { KnowledgeView } from "@/components/views/knowledge/knowledge-view";
import { BroadcastView } from "@/components/views/broadcast-view";
import { LogicView } from "@/components/views/logic-view";
import { SystemGovernanceView } from "@/components/views/system-view";
import { FollowUpHubView } from "@/components/views/follow-up-view";
import { ProfileView } from "@/components/views/profile/profile-view";
import { AppointmentsView } from "@/components/views/appointments/appointments-view";
import { DoctorsView } from "@/components/views/doctor/doctors-view";
import { CONTACTS_MOCK } from "@/lib/data";
import { cn } from "@/lib/utils";
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { setActiveTabData } from '@/redux/slices/auth/authSlice';
import { useDispatch } from 'react-redux';

export default function Home() {
  const dispatch = useDispatch();
  const { activeTabData } = useAuth();
  console.log("activeTabData", activeTabData)
  // const [hasSyncComplete, setHasSyncComplete] = useState(false);
  const [activeTab, setActiveTab] = useState(activeTabData || 'dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedContact, setSelectedContact] = useState(CONTACTS_MOCK[0]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // if (!hasSyncComplete) {
  //   return <WelcomeScreen isDarkMode={isDarkMode} onComplete={() => setHasSyncComplete(true)} />;
  // }
  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
    dispatch(setActiveTabData(tab));
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView isDarkMode={isDarkMode} />;
      case 'leads': return <LeadsView isDarkMode={isDarkMode} />;
      case 'chats': return <ChatView isDarkMode={isDarkMode} selectedContact={selectedContact} setSelectedContact={setSelectedContact} />;
      case 'team': return <TeamManagementView isDarkMode={isDarkMode} />;
      case 'knowledge': return <KnowledgeView isDarkMode={isDarkMode} />;
      case 'broadcast': return <BroadcastView isDarkMode={isDarkMode} />;
      case 'logic': return <LogicView isDarkMode={isDarkMode} />;
      case 'system': return <SystemGovernanceView isDarkMode={isDarkMode} />;
      case 'followups': return <FollowUpHubView isDarkMode={isDarkMode} />;
      case 'appointments': return <AppointmentsView isDarkMode={isDarkMode} />;
      case 'doctors': return <DoctorsView isDarkMode={isDarkMode} />;
      case 'profile': return <ProfileView isDarkMode={isDarkMode} />;
      default: return <DashboardView isDarkMode={isDarkMode} />;
    }
  };

  useEffect(() => {
    if (activeTabData) {
      setActiveTab(activeTabData)
    }
  }, [activeTabData])

  return (
    <ProtectedRoute>
      <div className={cn("flex h-screen font-sans overflow-hidden relative transition-colors duration-1000", isDarkMode ? 'bg-[#0A0A0B] text-slate-200' : 'bg-[#FAFAFB] text-slate-900')}>
        <div className={cn("absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000", isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-200/40')} />

        {/* Sidebar Navigation */}
        <Sidebar handleActiveTab={handleActiveTab} activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
          <Header isDarkMode={isDarkMode} onNavigateToProfile={() => handleActiveTab('profile')} />

          <div className="flex-1 min-h-0 overflow-hidden relative">
            {renderView()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}