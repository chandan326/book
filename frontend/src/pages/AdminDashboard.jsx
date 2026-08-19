import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, BookOpen, Eye, HardDrive, Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const adminStats = await apiRequest('/admin/stats');
      const users = await apiRequest('/admin/users');
      const reps = await apiRequest('/admin/reports');
      setStats(adminStats);
      setUsersList(users);
      setReports(reps);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'User' ? 'Admin' : 'User';
    if (!window.confirm(`Change role of user #${userId} to ${newRole}?`)) return;
    try {
      await apiRequest(`/admin/users/${userId}/role?new_role=${newRole}`, 'PUT');
      loadAdminData();
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Loading Super Admin Portal...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit' }}>Super Admin Portal</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            System configuration & moderation panel initialized for <strong>chandan.rai771714@gmail.com</strong>
          </p>
        </div>
      </div>

      {/* Admin Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="card">
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.total_users || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Platform Users</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.total_books || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Books</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.published_books || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Public Manuscripts</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.ai_jobs_run || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>AI Audit Jobs</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.storage_used_mb || 0} MB</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Storage Consumed</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Outfit' }}>User Account Management</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
              <th style={{ padding: '0.75rem' }}>ID</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Full Name</th>
              <th style={{ padding: '0.75rem' }}>Role</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.75rem', fontWeight: 600 }}>#{u.id}</td>
                <td style={{ padding: '0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>{u.full_name || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '1rem',
                    backgroundColor: u.role === 'Super Admin' ? '#FEF2F2' : '#EFF6FF',
                    color: u.role === 'Super Admin' ? '#991B1B' : '#1D4ED8'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {u.role !== 'Super Admin' && (
                    <button 
                      onClick={() => handleChangeRole(u.id, u.role)}
                      className="btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    >
                      Toggle Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Moderation Reports Queue */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'Outfit' }}>Moderation & Abuse Queue</h2>
        {reports.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>No unresolved content moderation reports.</p>
        ) : (
          <div>
            {reports.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid #E2E8F0', padding: '0.75rem 0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Report #{r.id} - Reason: {r.reason}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{r.details || 'No details provided'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
