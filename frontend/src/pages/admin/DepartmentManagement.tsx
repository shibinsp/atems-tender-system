import React, { useState } from 'react';
import {
  Building2,
  Tag,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import adminService from '../../services/adminService';
import { colors, shadows } from '../../styles/constants';
import type { Department, Category, DepartmentCreate, CategoryCreate } from '../../types';

// Tab button with inline styles
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
    style={{
      backgroundColor: active ? colors.primary : '#f3f4f6',
      color: active ? 'white' : '#374151',
    }}
  >
    {icon}
    {label}
  </button>
);

// Textarea with focus styles
const FocusTextarea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 3 }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      style={isFocused ? {
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}`,
        borderColor: colors.primary,
      } : {}}
    />
  );
};

// Checkbox with custom styling
const FocusCheckbox: React.FC<{
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className="rounded border-gray-300"
    style={{ accentColor: colors.primary }}
  />
);

type TabType = 'departments' | 'categories';

interface FormModalProps {
  type: 'department' | 'category';
  item: Department | Category | null;
  onClose: () => void;
  onSaved: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ type, item, onClose, onSaved }) => {
  const { addToast } = useUIStore();
  const isEditing = !!item;

  const [formData, setFormData] = React.useState({
    name: item?.name || '',
    code: item?.code || '',
    description: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (type === 'department') {
        const data: DepartmentCreate = {
          name: formData.name,
          code: formData.code || undefined
        };
        if (isEditing) {
          await adminService.updateDepartment(item!.id, data);
        } else {
          await adminService.createDepartment(data);
        }
      } else {
        const data: CategoryCreate = {
          name: formData.name,
          code: formData.code || undefined,
          description: formData.description || undefined
        };
        if (isEditing) {
          await adminService.updateCategory(item!.id, data);
        } else {
          await adminService.createCategory(data);
        }
      }

      addToast({
        type: 'success',
        title: isEditing ? 'Updated' : 'Created',
        message: `${type === 'department' ? 'Department' : 'Category'} ${formData.name} has been ${isEditing ? 'updated' : 'created'}`
      });
      onSaved();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} ${type}`
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit' : 'Add'} {type === 'department' ? 'Department' : 'Category'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setError('');
              }}
              placeholder={`Enter ${type} name`}
              error={error}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., IT, PWD"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">Optional short code (max 10 chars)</p>
          </div>

          {type === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <FocusTextarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={3}
              />
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const DepartmentManagement: React.FC = () => {
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<TabType>('departments');
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showInactive, setShowInactive] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Department | Category | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [deptsData, catsData] = await Promise.all([
        adminService.getDepartments(true),
        adminService.getCategories(true)
      ]);
      setDepartments(deptsData);
      setCategories(catsData);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: Department | Category) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item: Department | Category) => {
    const type = activeTab === 'departments' ? 'department' : 'category';
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

    try {
      if (activeTab === 'departments') {
        await adminService.deleteDepartment(item.id);
      } else {
        await adminService.deleteCategory(item.id);
      }
      addToast({
        type: 'success',
        title: 'Deleted',
        message: `${type} ${item.name} has been deleted`
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.detail || `Failed to delete ${type}`
      });
    }
  };

  const handleToggleStatus = async (item: Department | Category) => {
    try {
      if (activeTab === 'departments') {
        await adminService.updateDepartment(item.id, { is_active: !item.is_active });
      } else {
        await adminService.updateCategory(item.id, { is_active: !item.is_active });
      }
      addToast({
        type: 'success',
        title: 'Updated',
        message: `${item.name} has been ${item.is_active ? 'deactivated' : 'activated'}`
      });
      fetchData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update status'
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSaved = () => {
    handleModalClose();
    fetchData();
  };

  const currentItems = activeTab === 'departments' ? departments : categories;
  const filteredItems = showInactive ? currentItems : currentItems.filter(i => i.is_active);

  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Admin', path: '/admin/users' },
          { label: 'Departments & Categories' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryAlpha10 }}>
              <Building2 className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Departments & Categories</h1>
              <p className="text-gray-600">
                Manage organizational structure and tender categories
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
            Add {activeTab === 'departments' ? 'Department' : 'Category'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t pt-4">
          <TabButton
            active={activeTab === 'departments'}
            onClick={() => setActiveTab('departments')}
            icon={<Building2 className="w-4 h-4" />}
            label={`Departments (${departments.filter(d => d.is_active).length})`}
          />
          <TabButton
            active={activeTab === 'categories'}
            onClick={() => setActiveTab('categories')}
            icon={<Tag className="w-4 h-4" />}
            label={`Categories (${categories.filter(c => c.is_active).length})`}
          />
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <FocusCheckbox
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive {activeTab}
          </label>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              {activeTab === 'departments' ? (
                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              ) : (
                <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              )}
              <p className="text-gray-500">No {activeTab} found</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map(item => (
            <Card
              key={item.id}
              className={`${!item.is_active ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeTab === 'departments' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {activeTab === 'departments' ? (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Tag className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.code && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.is_active ? (
                      <span className="text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="text-red-600">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(item)}
                  >
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    icon={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <FormModal
          type={activeTab === 'departments' ? 'department' : 'category'}
          item={editingItem}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default DepartmentManagement;
