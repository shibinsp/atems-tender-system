import React from 'react';
import Breadcrumb from '../../components/layout/Breadcrumb';
import TenderForm from '../../components/tender/TenderForm';

const TenderCreate: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: 'Create New Tender' }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Tender</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new tender
        </p>
      </div>

      <TenderForm mode="create" />
    </div>
  );
};

export default TenderCreate;
