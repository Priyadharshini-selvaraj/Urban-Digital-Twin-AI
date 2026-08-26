import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardOverview from '../pages/DashboardOverview';
import UploadModel from '../pages/UploadModel';
import CityViewer from '../pages/CityViewer';
import RoutePlanner from '../pages/RoutePlanner';
import AIPrediction from '../pages/AIPrediction';
import Analytics from '../pages/Analytics';
import Reports from '../pages/Reports';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="upload" element={<UploadModel />} />
        <Route path="viewer" element={<CityViewer />} />
        <Route path="routes" element={<RoutePlanner />} />
        <Route path="ai" element={<AIPrediction />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
