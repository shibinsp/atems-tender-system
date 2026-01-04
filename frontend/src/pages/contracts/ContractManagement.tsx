import React from 'react';
import { FileText, Clock, AlertTriangle, Eye, CheckCircle, XCircle, Building, FileSignature } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { contractService } from '../../services/contractService';
import type { Contract, Approval } from '../../services/contractService';

interface Blacklist {
  id: number;
  bidder_id: number;
  reason: string;
  blacklist_date: string;
  expiry_date: string;
  is_permanent: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = ({ title, value, icon, color, bg }) => (
  <Card style={{ height: '100%' }}>
    <CardContent style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '8px 0 0' }}>{value}</p>
        </div>
        <div style={{ padding: 12, backgroundColor: bg, borderRadius: 10 }}>
          {React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, { size: 24, color })}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ContractManagement() {
  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [blacklist, setBlacklist] = React.useState<Blacklist[]>([]);
  const [activeTab, setActiveTab] = React.useState<'contracts' | 'approvals' | 'blacklist'>('contracts');
  const [loading, setLoading] = React.useState(true);
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);

  React.useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contracts') {
        const res = await contractService.getContracts();
        setContracts(res.data);
      } else if (activeTab === 'approvals') {
        const res = await contractService.getPendingApprovals();
        setApprovals(res.data);
      } else if (activeTab === 'blacklist') {
        const res = await contractService.getBlacklist();
        setBlacklist(res.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const handleApproval = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      await contractService.processApproval(id, { status });
      loadData();
    } catch (err) {
      console.error('Error processing approval:', err);
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      'Draft': { bg: '#f3f4f6', color: '#6b7280' },
      'LoI Issued': { bg: '#eff6ff', color: '#2563eb' },
      'LoA Issued': { bg: '#f5f3ff', color: '#7c3aed' },
      'BG Pending': { bg: '#fff7ed', color: '#ea580c' },
      'Active': { bg: '#f0fdf4', color: '#16a34a' },
      'Completed': { bg: '#ecfdf5', color: '#059669' },
      'Terminated': { bg: '#fef2f2', color: '#dc2626' },
      'Pending': { bg: '#fefce8', color: '#ca8a04' },
      'Approved': { bg: '#f0fdf4', color: '#16a34a' },
      'Rejected': { bg: '#fef2f2', color: '#dc2626' },
    };
    return styles[status] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return '₹0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const tabs = [
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'approvals', label: 'Pending Approvals', icon: Clock },
    { id: 'blacklist', label: 'Blacklist', icon: AlertTriangle },
  ];

  return (
    <div>
      <PageHeader
        title="Contract Management"
        subtitle="Manage contracts, approvals, and vendor compliance"
        icon={<FileSignature size={24} color="#1e3a5f" />}
      />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Contracts" value={contracts.length} icon={<FileText />} color="#2563eb" bg="#eff6ff" />
        <StatCard title="Active" value={contracts.filter(c => c.status === 'Active').length} icon={<CheckCircle />} color="#16a34a" bg="#f0fdf4" />
        <StatCard title="Pending Approvals" value={approvals.length} icon={<Clock />} color="#ca8a04" bg="#fefce8" />
        <StatCard title="Blacklisted" value={blacklist.length} icon={<AlertTriangle />} color="#dc2626" bg="#fef2f2" />
      </div>

      {/* Tabs */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                  border: 'none', background: isActive ? '#eff6ff' : 'transparent',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  color: isActive ? '#2563eb' : '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 60 }}><Loading text="Loading..." /></div>
          ) : (
            <>
              {/* Contracts Tab */}
              {activeTab === 'contracts' && (
                contracts.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
                    <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>No contracts found</p>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>Contracts appear after awarding tenders</p>
                  </div>
                ) : (
                  <div>
                    {contracts.map((contract) => {
                      const statusStyle = getStatusStyle(contract.status);
                      return (
                        <div key={contract.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{contract.contract_number}</span>
                              <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, backgroundColor: statusStyle.bg, color: statusStyle.color }}>{contract.status}</span>
                            </div>
                            <p style={{ fontSize: 14, color: '#111827', margin: 0 }}>{contract.title}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', marginRight: 16 }}>
                            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{formatCurrency(contract.contract_value)}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>LoI: {formatDate(contract.loi_date)}</p>
                          </div>
                          <button onClick={() => setSelectedContract(contract)} style={{ padding: 8, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Eye size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Approvals Tab */}
              {activeTab === 'approvals' && (
                approvals.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#16a34a' }} />
                    <p style={{ margin: 0 }}>No pending approvals</p>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>All requests have been processed</p>
                  </div>
                ) : (
                  <div>
                    {approvals.map((approval) => {
                      const statusStyle = getStatusStyle(approval.status);
                      return (
                        <div key={approval.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Tender #{approval.tender_id}</span>
                              <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, backgroundColor: '#f5f3ff', color: '#7c3aed' }}>{approval.approval_type}</span>
                              <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, backgroundColor: statusStyle.bg, color: statusStyle.color }}>{approval.status}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                              Budget: {approval.budget_head || '-'} • Cost Center: {approval.cost_center || '-'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', marginRight: 16 }}>
                            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{approval.estimated_amount ? formatCurrency(approval.estimated_amount) : '-'}</p>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Button onClick={() => handleApproval(approval.id, 'Approved')} style={{ backgroundColor: '#16a34a' }}>
                              <CheckCircle size={14} /> Approve
                            </Button>
                            <Button onClick={() => handleApproval(approval.id, 'Rejected')} variant="outline" style={{ color: '#dc2626', borderColor: '#dc2626' }}>
                              <XCircle size={14} /> Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Blacklist Tab */}
              {activeTab === 'blacklist' && (
                blacklist.length === 0 ? (
                  <div style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
                    <Building size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>No blacklisted vendors</p>
                    <p style={{ fontSize: 13, margin: '4px 0 0' }}>All vendors are in good standing</p>
                  </div>
                ) : (
                  <div>
                    {blacklist.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Vendor #{item.bidder_id}</span>
                            <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, backgroundColor: item.is_permanent ? '#fef2f2' : '#fff7ed', color: item.is_permanent ? '#dc2626' : '#ea580c' }}>
                              {item.is_permanent ? 'Permanent' : 'Temporary'}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{item.reason}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 13, color: '#111827', margin: 0 }}>From: {formatDate(item.blacklist_date)}</p>
                          {!item.is_permanent && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Until: {formatDate(item.expiry_date)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <Card style={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <CardContent style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>{selectedContract.contract_number}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>{selectedContract.title}</p>
                </div>
                <button onClick={() => setSelectedContract(null)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  {(() => { const s = getStatusStyle(selectedContract.status); return <span style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 20, backgroundColor: s.bg, color: s.color }}>{selectedContract.status}</span>; })()}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Contract Value</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>{formatCurrency(selectedContract.contract_value)}</p>
                  </div>
                  <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Tender ID</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>#{selectedContract.tender_id}</p>
                  </div>
                </div>
                <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>Timeline</h4>
                  {[
                    { label: 'LoI Issued', date: selectedContract.loi_date, color: '#2563eb' },
                    { label: 'LoA Issued', date: selectedContract.loa_date, color: '#7c3aed' },
                    { label: 'Start Date', date: selectedContract.start_date, color: '#16a34a' },
                    { label: 'End Date', date: selectedContract.end_date, color: '#dc2626' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: 13, color: '#6b7280', width: 80 }}>{item.label}:</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{formatDate(item.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
