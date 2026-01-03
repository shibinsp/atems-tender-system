import React from 'react';
import { X, Save, User, Mail, Phone, Shield, Building2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useUIStore } from '../../store/uiStore';
import adminService from '../../services/adminService';
import { colors } from '../../styles/constants';
import type { User as UserType, Department, UserRole, UserCreate, UserUpdate } from '../../types';

interface UserFormModalProps {
  user: UserType | null;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'Admin', label: 'Administrator', description: 'Full system access' },
  { value: 'Tender Officer', label: 'Tender Officer', description: 'Create and manage tenders' },
  { value: 'Evaluator', label: 'Evaluator', description: 'Evaluate and score bids' },
  { value: 'Bidder', label: 'Bidder', description: 'Submit bids and RFIs' },
  { value: 'Viewer', label: 'Viewer', description: 'Read-only access' }
];

const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  departments,
  onClose,
  onSaved
}) => {
  const { addToast } = useUIStore();
  const isEditing = !!user;

  const [formData, setFormData] = React.useState({
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'Bidder' as UserRole,
    department_id: user?.department_id?.toString() || ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      if (isEditing) {
        const updateData: UserUpdate = {
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          role: formData.role,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined
        };
        await adminService.updateUser(user.id, updateData);
        addToast({
          type: 'success',
          title: 'Updated',
          message: `User ${formData.full_name} has been updated`
        });
      } else {
        const createData: UserCreate = {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          role: formData.role,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined
        };
        await adminService.createUser(createData);
        addToast({
          type: 'success',
          title: 'Created',
          message: `User ${formData.full_name} has been created`
        });
      }
      onSaved();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} user`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User style={{ width: '20px', height: '20px', color: colors.primary }} />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
              {isEditing ? 'Edit User' : 'Add New User'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              <User style={{ width: '14px', height: '14px' }} />
              Full Name *
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter full name"
              error={errors.full_name}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              <Mail style={{ width: '14px', height: '14px' }} />
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="user@example.com"
              error={errors.email}
              disabled={isEditing}
            />
            {isEditing && (
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Email cannot be changed</p>
            )}
          </div>

          {/* Password (only for new users) */}
          {!isEditing && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Password *
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                  error={errors.password}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
              </div>
            </>
          )}

          {/* Phone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              <Phone style={{ width: '14px', height: '14px' }} />
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="10-digit phone number"
              error={errors.phone}
            />
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              <Shield style={{ width: '14px', height: '14px' }} />
              Role *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ROLES.map(role => (
                <label
                  key={role.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: `2px solid ${formData.role === role.value ? colors.primary : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.role === role.value ? 'rgba(30, 58, 95, 0.05)' : 'white',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleChange('role', e.target.value)}
                    style={{ marginRight: '12px' }}
                  />
                  <div>
                    <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{role.label}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              <Building2 style={{ width: '14px', height: '14px' }} />
              Department
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => handleChange('department_id', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">No Department</option>
              {departments.filter(d => d.is_active).map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Optional - assign user to a department
            </p>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            icon={<Save style={{ width: '16px', height: '16px' }} />}
          >
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
