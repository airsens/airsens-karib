import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useStore } from './context/store';
import { Login } from './modules/Login';
import { AIAssistant } from './modules/AIAssistant';
import { AdminPanel } from './modules/AdminPanel';
import { Dashboard } from './modules/Dashboard';
import { AircraftModule } from './modules/AircraftModule';
import { ComponentsModule } from './modules/ComponentsModule';
import { FleetPlanningModule } from './modules/FleetPlanningModule';
import { ReliabilityModule } from './modules/ReliabilityModule';
import { WorkOrdersModule } from './modules/WorkOrdersModule';
import { AmplificationModule } from './modules/AmplificationModule';
import {
  AdSbModule, MelModule, InventoryModule, LogbookModule,
  AmpModule, ToolsModule, SalesModule,
} from './modules/TableModules';
import { ConfigurationModule, StructuralModule, AgeingModule } from './modules/EngineeringModules';
import { ControlTower } from './modules/ControlTower';
import type { ModuleKey } from './data/types';
import { ShieldAlert } from 'lucide-react';

const Denied: React.FC = () => (
  <div className="panel panel-pad fade-up" style={{ maxWidth: 460, margin: '60px auto', textAlign: 'center', padding: 40 }}>
    <ShieldAlert size={40} className="tamber" style={{ margin: '0 auto 16px' }} />
    <div className="hi" style={{ fontSize: 18, fontWeight: 700 }}>Access Restricted</div>
    <p className="muted" style={{ fontSize: 13.5, marginTop: 8 }}>You don't have permission to view this module. Contact your organization admin to request access.</p>
  </div>
);

const Guard: React.FC<{ mod: ModuleKey; children: React.ReactNode }> = ({ mod, children }) => {
  const { can } = useStore();
  return can(mod, 'view') ? <>{children}</> : <Denied />;
};

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  const ok = currentUser?.role === 'superadmin' || currentUser?.role === 'org-admin';
  return ok ? <>{children}</> : <Denied />;
};

const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  return currentUser?.role === 'superadmin' ? <>{children}</> : <Denied />;
};

const Shell: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Guard mod="dashboard"><Dashboard /></Guard>} />
      <Route path="/aircraft" element={<Guard mod="aircraft"><AircraftModule /></Guard>} />
      <Route path="/components" element={<Guard mod="components"><ComponentsModule /></Guard>} />
      <Route path="/fleet-planning" element={<Guard mod="fleet-planning"><FleetPlanningModule /></Guard>} />
      <Route path="/logbook" element={<Guard mod="logbook"><LogbookModule /></Guard>} />
      <Route path="/amp" element={<Guard mod="amp"><AmpModule /></Guard>} />
      <Route path="/adsb" element={<Guard mod="adsb"><AdSbModule /></Guard>} />
      <Route path="/mel" element={<Guard mod="mel"><MelModule /></Guard>} />
      <Route path="/reliability" element={<Guard mod="reliability"><ReliabilityModule /></Guard>} />
      <Route path="/configuration" element={<Guard mod="configuration"><ConfigurationModule /></Guard>} />
      <Route path="/work-orders" element={<Guard mod="work-orders"><WorkOrdersModule /></Guard>} />
      <Route path="/inventory" element={<Guard mod="inventory"><InventoryModule /></Guard>} />
      <Route path="/tools-manuals" element={<Guard mod="tools-manuals"><ToolsModule /></Guard>} />
      <Route path="/sales" element={<Guard mod="sales"><SalesModule /></Guard>} />
      <Route path="/amplification" element={<Guard mod="amplification"><AmplificationModule /></Guard>} />
      <Route path="/structural" element={<Guard mod="structural"><StructuralModule /></Guard>} />
      <Route path="/ageing" element={<Guard mod="ageing"><AgeingModule /></Guard>} />
      <Route path="/admin" element={<AdminGuard><AdminPanel /></AdminGuard>} />
      <Route path="/control-tower" element={<SuperAdminGuard><ControlTower /></SuperAdminGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <AIAssistant />
  </Layout>
);

export default function App() {
  const { currentUser } = useStore();
  return (
    <BrowserRouter>
      {currentUser ? <Shell /> : <Login />}
    </BrowserRouter>
  );
}
