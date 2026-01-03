import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Grid, List, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import TenderCard from '../../components/tender/TenderCard';
import TenderFilters from '../../components/tender/TenderFilters';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import tenderService from '../../services/tenderService';
import { shadows } from '../../styles/constants';
import type { Tender, Category, Department } from '../../types';

const TenderList: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tenders, setTenders] = React.useState<Tender[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Filter state from URL params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const categoryId = searchParams.get('category_id') || '';
  const departmentId = searchParams.get('department_id') || '';

  const canManageTenders = user?.role === 'Admin' || user?.role === 'Tender Officer';

  const fetchTenders = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await tenderService.getTenders({
        page,
        size: 12,
        search: search || undefined,
        status: status || undefined,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        department_id: departmentId ? parseInt(departmentId) : undefined
      });
      setTenders(response.items);
      setTotalPages(response.pages);
      setTotalItems(response.total);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load tenders'
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, status, categoryId, departmentId, addToast]);

  const fetchFiltersData = async () => {
    try {
      const [cats, depts] = await Promise.all([
        tenderService.getCategories().catch(() => []),
        tenderService.getDepartments().catch(() => [])
      ]);
      setCategories(cats);
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  };

  React.useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  React.useEffect(() => {
    fetchFiltersData();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handlePublish = async (id: number) => {
    try {
      await tenderService.publishTender(id);
      addToast({
        type: 'success',
        title: 'Published',
        message: 'Tender has been published successfully'
      });
      fetchTenders();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to publish tender'
      });
    }
  };

  const handleClone = async (id: number) => {
    try {
      await tenderService.cloneTender(id);
      addToast({
        type: 'success',
        title: 'Cloned',
        message: 'Tender has been cloned successfully'
      });
      fetchTenders();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to clone tender'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tender?')) return;
    try {
      await tenderService.deleteTender(id);
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Tender has been deleted successfully'
      });
      fetchTenders();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete tender'
      });
    }
  };

  if (loading && tenders.length === 0) {
    return <Loading text="Loading tenders..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb items={[{ label: 'Tenders' }]} />

      {/* Header */}
      <div className="tender-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Tenders</h1>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
            {totalItems} tender{totalItems !== 1 ? 's' : ''} found
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Grid style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px',
                borderRadius: '4px',
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <List style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTenders}
            icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
          >
            Refresh
          </Button>
          {canManageTenders && (
            <Link to="/tenders/create">
              <Button icon={<Plus style={{ width: '16px', height: '16px' }} />}>
                Create Tender
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <TenderFilters
        search={search}
        onSearchChange={(v) => updateFilter('search', v)}
        status={status}
        onStatusChange={(v) => updateFilter('status', v)}
        categoryId={categoryId}
        onCategoryChange={(v) => updateFilter('category_id', v)}
        departmentId={departmentId}
        onDepartmentChange={(v) => updateFilter('department_id', v)}
        categories={categories}
        departments={departments}
        onClear={clearFilters}
      />

      {/* Tender Grid/List */}
      {tenders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: shadows.govt
        }}>
          <div style={{ color: '#9ca3af', marginBottom: '16px' }}>
            <svg style={{ margin: '0 auto', height: '48px', width: '48px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>No tenders found</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {search || status || categoryId || departmentId
              ? 'Try adjusting your filters'
              : 'Get started by creating a new tender'}
          </p>
          {canManageTenders && !search && !status && (
            <Link to="/tenders/create">
              <Button icon={<Plus style={{ width: '16px', height: '16px' }} />}>Create Tender</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'tender-grid' : 'tender-list'}>
          {tenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              onPublish={canManageTenders ? handlePublish : undefined}
              onClone={canManageTenders ? handleClone : undefined}
              onDelete={canManageTenders ? handleDelete : undefined}
              showActions={canManageTenders}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateFilter('page', (page - 1).toString())}
          >
            Previous
          </Button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#4b5563' }}>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateFilter('page', (page + 1).toString())}
          >
            Next
          </Button>
        </div>
      )}

      <style>{`
        .tender-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .tender-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .tender-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .tender-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        @media (min-width: 768px) {
          .tender-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .tender-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default TenderList;
