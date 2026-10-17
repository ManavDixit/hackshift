import { useApp } from '@/lib/appContext';
import { LandingPage } from '@/pages/LandingPage';
import { SignInPage } from '@/pages/SignInPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { AgentNetworkPage } from '@/pages/AgentNetworkPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { AiDoctorPage } from '@/pages/AiDoctorPage';
import { HospitalsPage } from '@/pages/HospitalsPage';
import { FindCarePage } from '@/pages/FindCarePage';
import { CostEstimatorPage } from '@/pages/CostEstimatorPage';
import { SpecialistsPage } from '@/pages/SpecialistsPage';
import { MedicinesPage } from '@/pages/MedicinesPage';
import { BloodBankPage } from '@/pages/BloodBankPage';
import { LabsPage } from '@/pages/LabsPage';
import { CareLoopPage } from '@/pages/CareLoopPage';
import { RecordsPage } from '@/pages/RecordsPage';
import { WorkerDashboardPage } from '@/pages/WorkerDashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { MediCoverPage } from '@/pages/MediCoverPage';

export function Router() {
  const { page } = useApp();
  switch (page) {
    case 'home':
      return <LandingPage />;
    case 'signin':
      return <SignInPage />;
    case 'onboarding':
      return <OnboardingPage />;
    case 'agents':
      return <AgentNetworkPage />;
    case 'overview':
      return <OverviewPage />;
    case 'aidoctor':
      return <AiDoctorPage />;
    case 'find-care':
      return <FindCarePage />;
    case 'cost-estimator':
      return <CostEstimatorPage />;
    case 'specialists':
      return <SpecialistsPage />;
    case 'medicines':
      return <MedicinesPage />;
    case 'bloodbank':
      return <BloodBankPage />;
    case 'labs':
      return <LabsPage />;
    case 'careloop':
      return <CareLoopPage />;
    case 'records':
      return <RecordsPage />;
    case 'notifications':
      return <OverviewPage />;
    case 'worker':
      return <WorkerDashboardPage />;
    case 'medicover':
      return <MediCoverPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <LandingPage />;
  }
}
