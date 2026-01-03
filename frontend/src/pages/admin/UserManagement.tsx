import React from 'react';
import { Users, Plus, Search, Edit, Trash2, Shield, Mail, MoreVertical } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import UserFormModal from '../../components/admin/UserFormModal';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import adminService from '../../services/adminService';
import type { User, Department, UserRole } from '../../types';

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  Admin: { bg: '#fee2e2', color: '#b91c1c' },
  'Tender Officer': { bg: '#dbeafe', color: '#1d4ed8' },
  Evaluator: { bg: '#f3e8ff', color: '#7c3aed' },
  Bidder: { bg: '#dcfce7', color: '#15803d' },
  Viewer: { bg: '#f3f4f6', color: '#374151' },
};

const UserManagement: React.FC = () => {
  const { addToast } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = React.useState<User[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [menuOpen, setMenuOpen] = React.useState<number | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments(true),
      ]);
      setUsers(usersRes.items);
      setDepartments(deptsRes);
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = users.filter(
    (u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.full_name}?`)) return;
    try {
      await adminService.deleteUser(user.id);
      addToast({ type: 'success', title: 'Deleted', message: 'User deleted' });
      fetchData();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
    }
    setMenuOpen(null);
  };

  if (loading) return <Loading text="Loading users..." />;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.length} users`}
        icon={<Users size={24} color="#1e3a5f" />}
        actions={<Button icon={<Plus size={16} />} onClick={() => { setEditingUser(null); setShowModal(true); }}>Add User</Button>}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: users.length, color: '#1e3a5f' },
          { label: 'Active', value: users.filter((u) => u.is_active).length, color: '#16a34a' },
          { label: 'Pending', value: users.filter((u) => !u.is_verified).length, color: '#ca8a04' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent style={{ padding: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." style={{ paddingLeft: 36 }} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['User', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(30,58,95,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            color: '#1e3a5f',
                          }}
                        >
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{user.full_name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: ROLE_COLORS[user.role].bg,
                          color: ROLE_COLORS[user.role].color,
                        }}
                      >
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                          color: user.is_active ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                          style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === user.id && (
                          <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(null)} />
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                width: 140,
                                backgroundColor: '#fff',
                                borderRadius: 6,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                border: '1px solid #e5e7eb',
                                zIndex: 20,
                                overflow: 'hidden',
                              }}
                            >
                              <button
                                onClick={() => { setEditingUser(user); setShowModal(true); setMenuOpen(null); }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showModal && (
        <UserFormModal
          user={editingUser}
          departments={departments}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSaved={() => { setShowModal(false); setEditingUser(null); fetchData(); }}
        />
      )}
    </div>
  );
};

export default UserManagement;
