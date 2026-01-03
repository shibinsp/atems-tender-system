import React from 'react';
import { Building2, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import { useUIStore } from '../../store/uiStore';
import adminService from '../../services/adminService';
import type { Department } from '../../types';

const DepartmentManagement: React.FC = () => {
  const { addToast } = useUIStore();
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);
  const [formData, setFormData] = React.useState({ name: '', code: '' });
  const [menuOpen, setMenuOpen] = React.useState<number | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getDepartments(true);
      setDepartments(data);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load departments' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminService.updateDepartment(editing.id, formData);
        addToast({ type: 'success', title: 'Updated', message: 'Department updated' });
      } else {
        await adminService.createDepartment(formData);
        addToast({ type: 'success', title: 'Created', message: 'Department created' });
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', code: '' });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Operation failed' });
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Delete ${dept.name}?`)) return;
    try {
      await adminService.deleteDepartment(dept.id);
      addToast({ type: 'success', title: 'Deleted', message: 'Department deleted' });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
    }
    setMenuOpen(null);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setFormData({ name: dept.name, code: dept.code || '' });
    setShowForm(true);
    setMenuOpen(null);
  };

  if (loading) return <Loading text="Loading departments..." />;

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        icon={<Building2 size={24} color="#1e3a5f" />}
        actions={
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setEditing(null);
              setFormData({ name: '', code: '' });
              setShowForm(true);
            }}
          >
            Add Department
          </Button>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 400 }}>
            <CardContent style={{ padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px' }}>{editing ? 'Edit' : 'Add'} Department</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., IT, HR" />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{ flex: 1 }}>
                    {editing ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          {departments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <Building2 size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p>No departments yet</p>
            </div>
          ) : (
            <div>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: 'rgba(30,58,95,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Building2 size={20} color="#1e3a5f" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{dept.name}</p>
                      {dept.code && <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Code: {dept.code}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        backgroundColor: dept.is_active ? '#dcfce7' : '#fee2e2',
                        color: dept.is_active ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === dept.id ? null : dept.id)}
                        style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === dept.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(null)} />
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              width: 120,
                              backgroundColor: '#fff',
                              borderRadius: 6,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              border: '1px solid #e5e7eb',
                              zIndex: 20,
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              onClick={() => openEdit(dept)}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(dept)}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentManagement;
