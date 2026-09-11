import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import PriorityQueue from "./pages/PriorityQueue";
import Benchmarking from "./pages/Benchmarking";
import BillingAlerts from "./pages/BillingAlerts";
import Assistant from "./pages/Assistant";
import FieldDashboard from "./pages/FieldDashboard";
import FieldTasks from "./pages/FieldTasks";
import FieldEntry from "./pages/FieldEntry";
import FieldSubmissions from "./pages/FieldSubmissions";

function IndexRedirect() {
  const { role } = useAuth();
  return <Navigate to={role === "field" ? "/field-dashboard" : "/dashboard"} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Unauthenticated / Authentication Gate */}
      <Route path="/login" element={<Login />} />

      {/* Main Application Shell (with unified responsive sidebar and header) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexRedirect />} />

        {/* MoSPI Admin Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<NewProject />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="priority-queue" element={<PriorityQueue />} />
        <Route path="benchmarking" element={<Benchmarking />} />
        <Route path="billing-alerts" element={<BillingAlerts />} />
        <Route path="assistant" element={<Assistant />} />

        {/* Field Officer (Site Engineer) Routes */}
        <Route path="field-dashboard" element={<FieldDashboard />} />
        <Route path="field-tasks" element={<FieldTasks />} />
        <Route path="field-entry/:projectId" element={<FieldEntry />} />
        <Route path="field-submissions" element={<FieldSubmissions />} />
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
