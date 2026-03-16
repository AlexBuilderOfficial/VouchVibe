import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { CampaignForm } from './pages/CampaignForm';
import { PublicCampaign } from './pages/PublicCampaign';
import { Landing } from './pages/Landing';
import { PricingPage } from './pages/PricingPage';
import { CollectPage } from './pages/CollectPage';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Public campaign pages */}
      <Route path="/c/:slug" element={<PublicCampaign />} />
      <Route path="/collect/:slug" element={<PublicCampaign />} />
      
      {/* Demo collection page - shows demo campaign */}
      <Route path="/collect" element={<CollectPage />} />
      
      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/campaigns/new"
        element={
          <ProtectedRoute>
            <CampaignForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/campaigns/:id"
        element={
          <ProtectedRoute>
            <CampaignForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
