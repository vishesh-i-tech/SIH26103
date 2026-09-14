import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import PriorityQueue from "./pages/PriorityQueue";
import Benchmarking from "./pages/Benchmarking";
import BillingAlerts from "./pages/BillingAlerts";
import Assistant from "./pages/Assistant";
import Simulator from "./pages/Simulator";
import OfficersDirectory from "./pages/OfficersDirectory";
import FieldDashboard from "./pages/FieldDashboard";
import FieldTasks from "./pages/FieldTasks";
import FieldEntry from "./pages/FieldEntry";
import FieldSubmissions from "./pages/FieldSubmissions";
import { tokens, monoStyle } from "./styles/tokens";

// Loading component during session restoration
function SessionLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: tokens.paper,
        color: tokens.slate,
        fontFamily: tokens.fontSans,
      }}
    >
      <div
        style={{
          ...monoStyle,
          fontSize: 13,
          fontWeight: 600,
          color: tokens.steel,
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        PAIMANA AI · MOSPI
      </div>
      <div style={{ fontSize: 12 }}>Restoring secure officer session...</div>
    </div>
  );
}

// Redirect root to appropriate dashboard or login
function IndexRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <SessionLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={role === "field_officer" ? "/field-dashboard" : "/dashboard"} replace />;
}

// Route Guard: Ensures user is authenticated and has permitted role
function ProtectedRoute({ allowedRole, children }) {
  const { user, role, loading } = useAuth();

  if (loading) return <SessionLoading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cross-role redirect
  if (allowedRole === "admin" && role === "field_officer") {
    return <Navigate to="/field-dashboard" replace />;
  }

  if (allowedRole === "field_officer" && role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Unauthenticated Auth Portals */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Application Shell */}
      <Route element={<Layout />}>

        {/* MoSPI Admin Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute allowedRole="admin">
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/new"
          element={
            <ProtectedRoute allowedRole="admin">
              <NewProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute allowedRole="admin">
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="priority-queue"
          element={
            <ProtectedRoute allowedRole="admin">
              <PriorityQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="benchmarking"
          element={
            <ProtectedRoute allowedRole="admin">
              <Benchmarking />
            </ProtectedRoute>
          }
        />
        <Route
          path="billing-alerts"
          element={
            <ProtectedRoute allowedRole="admin">
              <BillingAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="assistant"
          element={
            <ProtectedRoute allowedRole="admin">
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="simulator"
          element={
            <ProtectedRoute allowedRole="admin">
              <Simulator />
            </ProtectedRoute>
          }
        />
        <Route
          path="officers"
          element={
            <ProtectedRoute allowedRole="admin">
              <OfficersDirectory />
            </ProtectedRoute>
          }
        />

        {/* Field Officer Routes */}
        <Route
          path="field-dashboard"
          element={
            <ProtectedRoute allowedRole="field_officer">
              <FieldDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="field-tasks"
          element={
            <ProtectedRoute allowedRole="field_officer">
              <FieldTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="field-entry/:projectId"
          element={
            <ProtectedRoute allowedRole="field_officer">
              <FieldEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="field-submissions"
          element={
            <ProtectedRoute allowedRole="field_officer">
              <FieldSubmissions />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<IndexRedirect />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
