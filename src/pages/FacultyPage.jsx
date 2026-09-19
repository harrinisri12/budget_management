import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FacultyList } from '../components/faculty/FacultyList';

export const FacultyPage = () => {
  return (
    <DashboardLayout pageTitle="Faculty Directory">
      <FacultyList />
    </DashboardLayout>
  );
};
