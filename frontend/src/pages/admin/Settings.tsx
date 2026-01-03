import React from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import { useUIStore } from '../../store/uiStore';
import adminService from '../../services/adminService';
import type { SystemSettings } from '../../types';

const Settings: React.FC = () => {
  const { addToast } = useUIStore();
  const [settings, setSettings] = React.useState<SystemSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getSettings();
        setSettings(data);
      } catch {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [addToast]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      addToast({ type: 'success', title: 'Saved', message: 'Settings updated' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    if (settings) setSettings({ ...settings, [key]: value });
  };

  if (loading) return <Loading text="Loading settings..." />;
  if (!settings) return null;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="System configuration"
        icon={<SettingsIcon size={24} color="#1e3a5f" />}
        actions={<Button icon={<Save size={16} />} onClick={handleSave} loading={saving}>Save Changes</Button>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* General */}
        <Card>
          <CardContent style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#111827' }}>General Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <Input label="Site Name" value={settings.site_name} onChange={(e) => updateSetting('site_name', e.target.value)} />
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Default Currency</label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => updateSetting('default_currency', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting('timezone', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tender Settings */}
        <Card>
          <CardContent style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#111827' }}>Tender Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Input
                label="Min Bids Required"
                type="number"
                value={settings.min_bids_required}
                onChange={(e) => updateSetting('min_bids_required', parseInt(e.target.value) || 0)}
              />
              <Input
                label="EMD Percentage (%)"
                type="number"
                value={settings.emd_percentage}
                onChange={(e) => updateSetting('emd_percentage', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Performance Security (%)"
                type="number"
                value={settings.performance_security_percentage}
                onChange={(e) => updateSetting('performance_security_percentage', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Max File Size (MB)"
                type="number"
                value={settings.max_file_size_mb}
                onChange={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', color: '#111827' }}>Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'email_notifications' as const, label: 'Email Notifications' },
                { key: 'sms_notifications' as const, label: 'SMS Notifications' },
              ].map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(e) => updateSetting(item.key, e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
