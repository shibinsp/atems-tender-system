import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  Shield,
  Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import UserFormModal from '../../components/admin/UserFormModal';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import adminService from '../../services/adminService';
import { colors, shadows } from '../../styles/constants';
import type { User, Department, UserRole } from '../../types';

// Inline select component with focus styles
const FilterSelect: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ value, onChange, children }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        boxShadow: isFocused ? `0 0 0 2px ${colors.primary}` : 'none',
        borderColor: isFocused ? colors.primary : '#d1d5db',
      }}
    >
      {children}
    </select>
  );
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  'Admin': { bg: '#fee2e2', color: '#b91c1c' },
  'Tender Officer': { bg: '#dbeafe', color: '#1d4ed8' },
  'Evaluator': { bg: '#f3e8ff', color: '#7c3aed' },
  'Bidder': { bg: '#dcfce7', color: '#15803d' },
  'Viewer': { bg: '#f3f4f6', color: '#374151' }
};

const UserManagement: React.FC = () => {
  const { addToast } = useUIStore();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = React.useState<User[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [actionMenuUser, setActionMenuUser] = React.useState<number | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments(true)
      ]);
      setUsers(usersData.items);
      setDepartments(deptsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !user.full_name.toLowerCase().includes(query) &&
          !user.email.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (roleFilter && user.role !== roleFilter) return false;
      if (statusFilter === 'active' && !user.is_active) return false;
      if (statusFilter === 'inactive' && user.is_active) return false;
      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getDepartmentName = (deptId?: number) => {
    if (!deptId) return '-';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || '-';
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
    setActionMenuUser(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      addToast({
        type: 'success',
        title: 'Deleted',
        message: `User ${user.full_name} has been deleted`
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete user'
      });
    }
    setActionMenuUser(null);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await adminService.toggleUserStatus(user.id);
      addToast({
        type: 'success',
        title: 'Updated',
        message: `User ${user.full_name} has been ${user.is_active ? 'deactivated' : 'activated'}`
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to update user status'
      });
    }
    setActionMenuUser(null);
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Reset password for ${user.full_name}? A temporary password will be generated.`)) {
      return;
    }

    try {
      const result = await adminService.resetPassword(user.id);
      addToast({
        type: 'success',
        title: 'Password Reset',
        message: result.temp_password
          ? `Temporary password: ${result.temp_password}`
          : 'Password reset email has been sent'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to reset password'
      });
    }
    setActionMenuUser(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleUserSaved = () => {
    handleModalClose();
    fetchData();
  };

  if (loading) {
    return <Loading text="Loading users..." />;
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    pending: users.filter(u => !u.is_verified).length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Admin', path: '/admin/users' },
          { label: 'User Management' }
        ]}
      />

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: shadows.govt }}>
        <div className="user-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(30, 58, 95, 0.1)' }}>
              <Users style={{ width: '24px', height: '24px', color: colors.primary }} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>User Management</h1>
              <p style={{ color: '#4b5563' }}>
                Manage system users, roles, and permissions
              </p>
            </div>
          </div>
          <Button onClick={handleCreateUser} icon={<Plus style={{ width: '16px', height: '16px' }} />}>
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{stats.total}</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{stats.active}</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Active</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#ca8a04' }}>{stats.pending}</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Pending Verification</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent style={{ padding: '16px' }}>
          <div className="filters-row">
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#9ca3af'
              }} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Tender Officer">Tender Officer</option>
              <option value="Evaluator">Evaluator</option>
              <option value="Bidder">Bidder</option>
              <option value="Viewer">Viewer</option>
            </FilterSelect>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </FilterSelect>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Department</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Last Login</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                      <Users style={{ width: '48px', height: '48px', margin: '0 auto 8px', color: '#d1d5db' }} />
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="user-row" style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(30, 58, 95, 0.1)'
                          }}>
                            <span style={{ fontWeight: 600, color: colors.primary }}>
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, color: '#111827' }}>{user.full_name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail style={{ width: '12px', height: '12px' }} />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone style={{ width: '12px', height: '12px' }} />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: ROLE_COLORS[user.role].bg,
                          color: ROLE_COLORS[user.role].color
                        }}>
                          <Shield style={{ width: '12px', height: '12px' }} />
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#4b5563' }}>
                          <Building2 style={{ width: '16px', height: '16px' }} />
                          {getDepartmentName(user.department_id)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          {user.is_active ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '14px' }}>
                              <UserCheck style={{ width: '16px', height: '16px' }} />
                              Active
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '14px' }}>
                              <UserX style={{ width: '16px', height: '16px' }} />
                              Inactive
                            </span>
                          )}
                          {!user.is_verified && (
                            <span style={{ fontSize: '12px', color: '#ca8a04' }}>Unverified</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6b7280' }}>
                          <Clock style={{ width: '16px', height: '16px' }} />
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'Never'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="action-btn"
                          >
                            <MoreVertical style={{ width: '16px', height: '16px' }} />
                          </button>

                          {actionMenuUser === user.id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              marginTop: '4px',
                              width: '192px',
                              backgroundColor: 'white',
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e5e7eb',
                              zIndex: 10
                            }}>
                              <button
                                onClick={() => handleEditUser(user)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                className="menu-item"
                              >
                                <Edit style={{ width: '16px', height: '16px' }} />
                                Edit User
                              </button>
                              <button
                                onClick={() => handleResetPassword(user)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                className="menu-item"
                              >
                                <Key style={{ width: '16px', height: '16px' }} />
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                                className="menu-item"
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX style={{ width: '16px', height: '16px' }} />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck style={{ width: '16px', height: '16px' }} />
                                    Activate
                                  </>
                                )}
                              </button>
                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    color: '#dc2626',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                  className="menu-item-danger"
                                >
                                  <Trash2 style={{ width: '16px', height: '16px' }} />
                                  Delete User
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {showModal && (
        <UserFormModal
          user={editingUser}
          departments={departments}
          onClose={handleModalClose}
          onSaved={handleUserSaved}
        />
      )}

      {/* Click outside to close action menu */}
      {actionMenuUser && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 0 }}
          onClick={() => setActionMenuUser(null)}
        />
      )}

      <style>{`
        .user-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .filters-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .user-row:hover {
          background-color: #f9fafb;
        }
        .action-btn:hover {
          background-color: #f3f4f6;
        }
        .menu-item:hover {
          background-color: #f9fafb;
        }
        .menu-item-danger:hover {
          background-color: #fef2f2;
        }
        @media (min-width: 640px) {
          .filters-row {
            flex-direction: row;
          }
        }
        @media (min-width: 1024px) {
          .user-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
