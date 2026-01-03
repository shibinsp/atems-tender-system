import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Breadcrumb from '../../components/layout/Breadcrumb';
import TenderForm from '../../components/tender/TenderForm';
import Loading from '../../components/ui/Loading';
import tenderService from '../../services/tenderService';
import type { Tender } from '../../types';

const TenderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = React.useState<Tender | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTender = async () => {
      if (!id) return;
      try {
        const data = await tenderService.getTender(parseInt(id));
        if (data.status !== 'Draft') {
          setError('Only draft tenders can be edited');
          return;
        }
        setTender(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load tender');
      } finally {
        setLoading(false);
      }
    };
    fetchTender();
  }, [id]);

  if (loading) {
    return <Loading text="Loading tender..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <a href="/tenders" className="text-primary hover:underline">
          Back to Tenders
        </a>
      </div>
    );
  }

  if (!tender) {
    return <Navigate to="/tenders" replace />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Tenders', path: '/tenders' },
          { label: tender.tender_id, path: `/tenders/${tender.id}` },
          { label: 'Edit' }
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Tender</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update tender details - {tender.tender_id}
        </p>
      </div>

      <TenderForm mode="edit" tender={tender} />
    </div>
  );
};

export default TenderEdit;
