import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useUIStore } from '../../store/uiStore';
import adminService from '../../services/adminService';
import { colors, shadows } from '../../styles/constants';
import type { SystemSettings } from '../../types';

// Tab button with inline styles
const SettingsTabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors"
    style={{
      backgroundColor: active ? colors.primary : '#f3f4f6',
      color: active ? 'white' : '#374151',
    }}
  >
    {icon}
    {label}
  </button>
);

// Select with focus styles
const SettingsSelect: React.FC<{
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
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      style={isFocused ? {
        outline: 'none',
        boxShadow: `0 0 0 2px ${colors.primary}`,
        borderColor: colors.primary,
      } : {}}
    >
      {children}
    </select>
  );
};

// Checkbox with custom styling
const SettingsCheckbox: React.FC<{
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ checked, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    className="w-5 h-5 rounded border-gray-300"
    style={{ accentColor: colors.primary }}
  />
);

type SettingsTab = 'general' | 'notifications' | 'tender' | 'security';

const Settings: React.FC = () => {
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<SettingsTab>('general');
  const [settings, setSettings] = React.useState<SystemSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load settings'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      addToast({
        type: 'success',
        title: 'Saved',
        message: 'Settings have been updated'
      });
      setHasChanges(false);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setHasChanges(false);
  };

  if (loading) {
    return <Loading text="Loading settings..." />;
  }

  if (!settings) {
    return null;
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'tender' as const, label: 'Tender Settings', icon: <FileText className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Admin', path: '/admin/users' },
          { label: 'Settings' }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-6" style={{ boxShadow: shadows.govt }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryAlpha10 }}>
              <SettingsIcon className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t pt-4 overflow-x-auto">
          {tabs.map(tab => (
            <SettingsTabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <Input
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <SettingsSelect
                  value={settings.default_currency}
                  onChange={(e) => handleChange('default_currency', e.target.value)}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </SettingsSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <SettingsSelect
                  value={settings.date_format}
                  onChange={(e) => handleChange('date_format', e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </SettingsSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <SettingsSelect
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </SettingsSelect>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Send email notifications for tender updates, bid submissions, etc.
                  </p>
                </div>
                <SettingsCheckbox
                  checked={settings.email_notifications}
                  onChange={(e) => handleChange('email_notifications', e.target.checked)}
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">
                    Send SMS alerts for critical deadlines and updates
                  </p>
                </div>
                <SettingsCheckbox
                  checked={settings.sms_notifications}
                  onChange={(e) => handleChange('sms_notifications', e.target.checked)}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tender Settings */}
      {activeTab === 'tender' && (
        <Card>
          <CardHeader>
            <CardTitle>Tender Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Bids Required
                </label>
                <Input
                  type="number"
                  min="1"
                  value={settings.min_bids_required}
                  onChange={(e) => handleChange('min_bids_required', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum number of bids required before evaluation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EMD Percentage
                </label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.emd_percentage}
                    onChange={(e) => handleChange('emd_percentage', parseFloat(e.target.value) || 0)}
                  />
                  <span className="ml-2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Default Earnest Money Deposit percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Security Percentage
                </label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.performance_security_percentage}
                    onChange={(e) => handleChange('performance_security_percentage', parseFloat(e.target.value) || 0)}
                  />
                  <span className="ml-2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Default performance security as % of contract value
                </p>
              </div>

              <div>
                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Auto-publish RFP</p>
                    <p className="text-sm text-gray-500">
                      Automatically publish RFP when tender is published
                    </p>
                  </div>
                  <SettingsCheckbox
                    checked={settings.auto_publish_rfp}
                    onChange={(e) => handleChange('auto_publish_rfp', e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>File & Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum File Size (MB)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_file_size_mb}
                  onChange={(e) => handleChange('max_file_size_mb', parseInt(e.target.value) || 25)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum allowed file size for uploads
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[42px]">
                  {settings.allowed_file_types.map((type, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      .{type}
                      <button
                        onClick={() => {
                          const newTypes = settings.allowed_file_types.filter((_, i) => i !== index);
                          handleChange('allowed_file_types', newTypes);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add file type (e.g., pdf)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.toLowerCase().replace(/^\./, '');
                        if (value && !settings.allowed_file_types.includes(value)) {
                          handleChange('allowed_file_types', [...settings.allowed_file_types, value]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to add a new file type
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Security Notice</h4>
              <p className="text-sm text-yellow-700">
                All uploaded files are scanned for malware. Only PDF files are allowed for tender documents
                to ensure document integrity and prevent tampering.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 flex items-center gap-4">
          <p className="text-sm text-yellow-700">You have unsaved changes</p>
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default Settings;
