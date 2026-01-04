import React from 'react';
import { Shield, Smartphone, Key, Monitor, Trash2, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { securityService } from '../../services/featureServices';

export default function SecuritySettings() {
  const [twoFAStatus, setTwoFAStatus] = React.useState<{ enabled: boolean; method: string | null }>({ enabled: false, method: null });
  const [sessions, setSessions] = React.useState<Array<{ id: number; device_info: string; ip_address: string; last_activity: string }>>([]);
  const [setupData, setSetupData] = React.useState<{ secret?: string; qr_uri?: string; backup_codes?: string[] } | null>(null);
  const [verifyCode, setVerifyCode] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, sessionsRes] = await Promise.all([
        securityService.get2FAStatus(),
        securityService.getSessions()
      ]);
      setTwoFAStatus(statusRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Error loading security data:', err);
    }
    setLoading(false);
  };

  const handleEnable2FA = async () => {
    try {
      const res = await securityService.enable2FA('totp');
      setSetupData(res.data);
      setMessage({ type: 'success', text: 'Scan the QR code with your authenticator app' });
    } catch {
      setMessage({ type: 'error', text: 'Error enabling 2FA' });
    }
  };

  const handleVerify2FA = async () => {
    try {
      await securityService.verify2FA(verifyCode);
      setMessage({ type: 'success', text: '2FA enabled successfully!' });
      setSetupData(null);
      setVerifyCode('');
      loadData();
    } catch {
      setMessage({ type: 'error', text: 'Invalid code. Please try again.' });
    }
  };

  const handleTerminateSession = async (id: number) => {
    try {
      await securityService.terminateSession(id);
      setMessage({ type: 'success', text: 'Session terminated' });
      loadData();
    } catch {
      setMessage({ type: 'error', text: 'Error terminating session' });
    }
  };

  if (loading) return <Loading text="Loading security settings..." />;

  return (
    <div>
      <PageHeader
        title="Security Settings"
        subtitle="Manage your account security and active sessions"
        icon={<Shield size={24} color="#1e3a5f" />}
      />

      {message && (
        <Card style={{ marginBottom: 24, borderLeft: `4px solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}` }}>
          <CardContent style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} color={message.type === 'success' ? '#16a34a' : '#dc2626'} />
            <span style={{ fontSize: 14, color: message.type === 'success' ? '#16a34a' : '#dc2626' }}>{message.text}</span>
          </CardContent>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="security-grid">
        {/* Two-Factor Authentication */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, backgroundColor: '#eff6ff', borderRadius: 8 }}>
                <Lock size={20} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Two-Factor Authentication</h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>Add an extra layer of security</p>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Smartphone size={20} color="#6b7280" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>Authenticator App</p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Google Authenticator or similar</p>
                  </div>
                </div>
                {twoFAStatus.enabled ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                    <CheckCircle size={14} /> Enabled
                  </span>
                ) : (
                  <Button onClick={handleEnable2FA}>Enable</Button>
                )}
              </div>

              {/* 2FA Setup */}
              {setupData && (
                <div style={{ marginTop: 20, padding: 20, backgroundColor: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', margin: '0 0 16px' }}>Setup Two-Factor Authentication</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="tfa-setup">
                    <div>
                      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>1. Scan this QR code:</p>
                      <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8, display: 'inline-block' }}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(setupData.qr_uri || '')}`} alt="2FA QR" style={{ width: 150, height: 150 }} />
                      </div>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '8px 0 0' }}>Manual: <code style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: 4 }}>{setupData.secret}</code></p>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>2. Enter 6-digit code:</p>
                      <input
                        type="text"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 20, textAlign: 'center', letterSpacing: 8 }}
                      />
                      <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6} style={{ width: '100%', marginTop: 12 }}>
                        Verify & Enable
                      </Button>
                      {setupData.backup_codes && (
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 8px' }}>3. Save backup codes:</p>
                          <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, fontSize: 12, fontFamily: 'monospace' }}>
                            {setupData.backup_codes.map((code, i) => <span key={i}>{code}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: '#f5f3ff', borderRadius: 8 }}>
                  <Monitor size={20} color="#7c3aed" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Active Sessions</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>Manage logged-in devices</p>
                </div>
              </div>
              {sessions.length > 1 && (
                <button onClick={() => securityService.terminateAllSessions().then(loadData)} style={{ fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Terminate All
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                <Monitor size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No active sessions</p>
              </div>
            ) : (
              <div>
                {sessions.map((session) => (
                  <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Monitor size={18} color="#6b7280" />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{session.device_info || 'Unknown Device'}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                          {session.ip_address} • {new Date(session.last_activity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleTerminateSession(session.id)} style={{ padding: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 10, backgroundColor: '#fefce8', borderRadius: 8 }}>
                <Key size={20} color="#ca8a04" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>API Keys</h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>Manage API access for integrations</p>
              </div>
            </div>
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <Key size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p>API key management available in Admin settings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .security-grid { grid-template-columns: 1fr 1fr; }
          .tfa-setup { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
