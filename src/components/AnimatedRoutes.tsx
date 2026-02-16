import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

// Auth pages
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import EmailVerified from "@/pages/EmailVerified";
import AuthCallback from "@/pages/AuthCallback";
import OAuthRoleSelect from "@/pages/OAuthRoleSelect";
import OAuthCallback from "@/pages/OAuthCallback";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

// Creator pages
import Onboarding from "@/pages/Onboarding";
import LinkedAccounts from "@/pages/LinkedAccounts";
import Dashboard from "@/pages/Dashboard";
import Apply from "@/pages/Apply";
import CampaignDetail from "@/pages/CampaignDetail";
import Invitations from "@/pages/Invitations";
import ActiveCampaigns from "@/pages/ActiveCampaigns";
import ActiveCampaignWorkspace from "@/pages/ActiveCampaignWorkspace";
import BrandFit from "@/pages/BrandFit";
import Surveys from "@/pages/Surveys";
import BrandProfile from "@/pages/BrandProfile";
import Messages from "@/pages/Messages";
import ProfileHub from "@/pages/ProfileHub";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Commissions from "@/pages/Commissions";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ArticlePage from "@/pages/ArticlePage";
import Resources from "@/pages/Resources";
import Notifications from "@/pages/Notifications";

// Brand pages
import BrandDashboard from "@/pages/brand/BrandDashboard";
import BrandCampaigns from "@/pages/brand/BrandCampaigns";
import BrandCampaignCreate from "@/pages/brand/BrandCampaignCreate";
import BrandCampaignDetail from "@/pages/brand/BrandCampaignDetail";
import BrandCreators from "@/pages/brand/BrandCreators";
import BrandApplications from "@/pages/brand/BrandApplications";
import BrandReports from "@/pages/brand/BrandReports";
import BrandPayments from "@/pages/brand/BrandPayments";
import BrandProfilePage from "@/pages/brand/BrandProfilePage";
import BrandSettings from "@/pages/brand/BrandSettings";
import BrandHelp from "@/pages/brand/BrandHelp";
import BrandSocialListening from "@/pages/brand/BrandSocialListening";
import BrandResources from "@/pages/brand/BrandResources";
import BrandNotifications from "@/pages/brand/BrandNotifications";
import BrandMessages from "@/pages/brand/BrandMessages";
import AcceptInvite from "@/pages/AcceptInvite";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCreators from "@/pages/admin/AdminCreators";
import AdminBrands from "@/pages/admin/AdminBrands";
import AdminCampaigns from "@/pages/admin/AdminCampaigns";
import AdminSurveys from "@/pages/admin/AdminSurveys";
import AdminMatching from "@/pages/admin/AdminMatching";
import AdminSystemHealth from "@/pages/admin/AdminSystemHealth";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminHelp from "@/pages/admin/AdminHelp";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminTenantRules from "@/pages/admin/AdminTenantRules";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

import NotFound from "@/pages/NotFound";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // Use "sync" mode for instant transitions - no blocking wait for exit animations
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* ===== PUBLIC AUTH ROUTES ===== */}
        <Route path="/signup" element={
          <PublicOnlyRoute>
            <SignUp />
          </PublicOnlyRoute>
        } />
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        
        {/* OAuth callback and role selection */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/role-select" element={<OAuthRoleSelect />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* ===== CREATOR ROUTES ===== */}
        <Route path="/onboarding" element={
          <ProtectedRoute requiredRole="creator">
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/connect-socials" element={
          <ProtectedRoute requiredRole="creator">
            <LinkedAccounts />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="creator">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/active-campaigns" element={
          <ProtectedRoute requiredRole="creator">
            <ActiveCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/active-campaigns/:id" element={
          <ProtectedRoute requiredRole="creator">
            <ActiveCampaignWorkspace />
          </ProtectedRoute>
        } />
        <Route path="/apply" element={
          <ProtectedRoute requiredRole="creator">
            <Apply />
          </ProtectedRoute>
        } />
        <Route path="/campaign/:id" element={
          <ProtectedRoute requiredRole="creator">
            <CampaignDetail />
          </ProtectedRoute>
        } />
        <Route path="/invitations" element={
          <ProtectedRoute requiredRole="creator">
            <Invitations />
          </ProtectedRoute>
        } />
        <Route path="/brand-fit" element={
          <ProtectedRoute requiredRole="creator">
            <BrandFit />
          </ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute requiredRole="creator">
            <Surveys />
          </ProtectedRoute>
        } />
        <Route path="/brand-profile" element={
          <ProtectedRoute requiredRole="creator">
            <BrandProfile />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute requiredRole="creator">
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requiredRole="creator">
            <ProfileHub />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredRole="creator">
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute requiredRole="creator">
            <Help />
          </ProtectedRoute>
        } />
        <Route path="/help/knowledge-base" element={
          <ProtectedRoute requiredRole="creator">
            <KnowledgeBase />
          </ProtectedRoute>
        } />
        <Route path="/help/articles/:slug" element={
          <ProtectedRoute requiredRole="creator">
            <ArticlePage />
          </ProtectedRoute>
        } />
        <Route path="/commissions" element={
          <ProtectedRoute requiredRole="creator">
            <Commissions />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute requiredRole="creator">
            <Resources />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute requiredRole="creator">
            <Notifications />
          </ProtectedRoute>
        } />
        
        {/* ===== BRAND ROUTES ===== */}
        <Route path="/brand/dashboard" element={
          <ProtectedRoute requiredRole="brand">
            <BrandDashboard />
          </ProtectedRoute>
        } />
        <Route path="/brand/campaigns" element={
          <ProtectedRoute requiredRole="brand">
            <BrandCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/brand/campaigns/create" element={
          <ProtectedRoute requiredRole="brand">
            <BrandCampaignCreate />
          </ProtectedRoute>
        } />
        <Route path="/brand/campaigns/:id" element={
          <ProtectedRoute requiredRole="brand">
            <BrandCampaignDetail />
          </ProtectedRoute>
        } />
        <Route path="/brand/creators" element={
          <ProtectedRoute requiredRole="brand">
            <BrandCreators />
          </ProtectedRoute>
        } />
        <Route path="/brand/applications" element={
          <ProtectedRoute requiredRole="brand">
            <BrandApplications />
          </ProtectedRoute>
        } />
        <Route path="/brand/reports" element={
          <ProtectedRoute requiredRole="brand">
            <BrandReports />
          </ProtectedRoute>
        } />
        <Route path="/brand/payments" element={
          <ProtectedRoute requiredRole="brand">
            <BrandPayments />
          </ProtectedRoute>
        } />
        <Route path="/brand/profile" element={
          <ProtectedRoute requiredRole="brand">
            <BrandProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/brand/settings" element={
          <ProtectedRoute requiredRole="brand">
            <BrandSettings />
          </ProtectedRoute>
        } />
        <Route path="/brand/help" element={
          <ProtectedRoute requiredRole="brand">
            <BrandHelp />
          </ProtectedRoute>
        } />
        <Route path="/brand/social-listening" element={
          <ProtectedRoute requiredRole="brand">
            <BrandSocialListening />
          </ProtectedRoute>
        } />
        <Route path="/brand/resources" element={
          <ProtectedRoute requiredRole="brand">
            <BrandResources />
          </ProtectedRoute>
        } />
        <Route path="/brand/notifications" element={
          <ProtectedRoute requiredRole="brand">
            <BrandNotifications />
          </ProtectedRoute>
        } />
        <Route path="/brand/messages" element={
          <ProtectedRoute requiredRole="brand">
            <BrandMessages />
          </ProtectedRoute>
        } />
        
        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/creators" element={
          <AdminProtectedRoute>
            <AdminCreators />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/brands" element={
          <AdminProtectedRoute>
            <AdminBrands />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/campaigns" element={
          <AdminProtectedRoute>
            <AdminCampaigns />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/surveys" element={
          <AdminProtectedRoute>
            <AdminSurveys />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/matching" element={
          <AdminProtectedRoute>
            <AdminMatching />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/system-health" element={
          <AdminProtectedRoute>
            <AdminSystemHealth />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <AdminSettings />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/help" element={
          <AdminProtectedRoute>
            <AdminHelp />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminProtectedRoute>
            <AdminAnalytics />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/tenant-rules" element={
          <AdminProtectedRoute>
            <AdminTenantRules />
          </AdminProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};