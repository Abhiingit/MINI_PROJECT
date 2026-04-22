import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  LogOut, CheckCircle2, XCircle, Clock, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

/* ── helpers ────────────────────────────── */
const fmt     = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A';

/* ── Sidebar ────────────────────────────── */
function AdminSidebar({ activeTab, setActiveTab, user, logout }) {
  const navItems = [
    { id: 'overview',    label: 'Overview',       icon: LayoutDashboard },
    { id: 'users',       label: 'Users',           icon: Users },
    { id: 'attendance',  label: 'Attendance',      icon: CalendarCheck },
    { id: 'leaves',      label: 'Leave Requests',  icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <LayoutDashboard size={16} color="white" />
        </div>
        <span className="sidebar-logo-text">Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Manage</span>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar" style={{ background: '#dc2626' }}>
            {initials(user?.name)}
          </div>
          <div>
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Administrator
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: '#ef4444', marginTop: '4px' }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

/* ── Overview Tab ───────────────────────── */
function OverviewTab({ stats, loading }) {
  const tiles = [
    { label: 'Total Users',      value: stats.totalUsers,     color: '' },
    { label: "Today's Present",  value: stats.todayPresent,   color: 'green' },
    { label: 'Pending Leaves',   value: stats.pendingLeaves,  color: 'red' },
    { label: 'Approved Leaves',  value: stats.approvedLeaves, color: 'accent' },
  ];

  return (
    <>
      <div className="stat-strip">
        {tiles.map(t => (
          <div className="stat-tile" key={t.label}>
            <div className="stat-tile-label">{t.label}</div>
            <div className={`stat-tile-value ${t.color}`}>
              {loading ? '—' : (t.value ?? 0)}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '8px' }}>
        <div className="card-header">
          <span className="card-title">Quick Tips</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: <Users size={14} />,        text: 'Go to Users tab to see everyone registered under your company.' },
            { icon: <CalendarCheck size={14} />, text: 'Attendance tab shows all records across all users — filter by name.' },
            { icon: <FileText size={14} />,      text: 'Leave Requests tab — approve or reject pending applications.' },
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--accent-2)', marginTop: '1px', flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Users Tab ──────────────────────────── */
function UsersTab({ users, loading }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    const map = { admin: 'badge-red', manager: 'badge-amber', employee: 'badge-green', student: 'badge-green' };
    return map[role] || 'badge-green';
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title"><Users size={15} /> All Users ({users.length})</span>
        <input
          className="input-no-icon"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '200px', padding: '6px 10px', fontSize: '12.5px' }}
        />
      </div>
      {loading ? (
        <div className="empty-state"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Users size={40} /><p>No users found.</p></div>
      ) : (
        <div className="table-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '10px', flexShrink: 0 }}>
                        {initials(u.name)}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td>{u.department || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Attendance Tab ─────────────────────── */
function AttendanceTab({ records, loading }) {
  const [search, setSearch] = useState('');
  const filtered = records.filter(r =>
    r.userName?.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title"><CalendarCheck size={15} /> All Attendance ({records.length})</span>
        <input
          className="input-no-icon"
          placeholder="Filter by user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '200px', padding: '6px 10px', fontSize: '12.5px' }}
        />
      </div>
      {loading ? (
        <div className="empty-state"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><CalendarCheck size={40} /><p>No records found.</p></div>
      ) : (
        <div className="table-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{r.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{r.userEmail}</div>
                  </td>
                  <td className="date-cell">{fmtDate(r.date)}</td>
                  <td>
                    <span className={`badge ${r.status === 'Present' ? 'badge-green' : 'badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{fmt(r.checkInTime)}</td>
                  <td>{fmt(r.checkOutTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Leave Requests Tab ─────────────────── */
function LeavesTab({ leaves, loading, onUpdateStatus }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title"><FileText size={15} /> Leave Requests ({leaves.length})</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-ghost"
              style={{
                fontSize: '11.5px',
                padding: '4px 10px',
                background: filter === f ? 'var(--surface-2)' : 'transparent',
                color: filter === f ? 'var(--text-1)' : 'var(--text-3)',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="empty-state"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><FileText size={40} /><p>No leave requests found.</p></div>
      ) : (
        <div className="table-scroll">
          <table className="att-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{l.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{l.userEmail}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <span style={{ color: 'var(--text-2)', fontSize: '12.5px' }}>{l.reason}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      l.status === 'approved' ? 'badge-green' :
                      l.status === 'rejected' ? 'badge-red' : 'badge-amber'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {l.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--green)', borderColor: 'var(--green-border)' }}
                          onClick={() => onUpdateStatus(l._id, 'approved')}
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--red)', borderColor: 'var(--red-border)' }}
                          onClick={() => onUpdateStatus(l._id, 'rejected')}
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Main AdminDashboard ────────────────── */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,      setStats]      = useState({});
  const [users,      setUsers]      = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [loading,    setLoading]    = useState({ stats: true, users: false, attendance: false, leaves: false });

  // Load stats on mount
  useEffect(() => { fetchStats(); }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users'      && users.length === 0)      fetchUsers();
    if (activeTab === 'attendance' && attendance.length === 0) fetchAttendance();
    if (activeTab === 'leaves'     && leaves.length === 0)     fetchLeaves();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(l => ({ ...l, stats: true }));
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(l => ({ ...l, stats: false })); }
  };

  const fetchUsers = async () => {
    setLoading(l => ({ ...l, users: true }));
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(l => ({ ...l, users: false })); }
  };

  const fetchAttendance = async () => {
    setLoading(l => ({ ...l, attendance: true }));
    try {
      const res = await api.get('/api/admin/attendance');
      setAttendance(res.data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(l => ({ ...l, attendance: false })); }
  };

  const fetchLeaves = async () => {
    setLoading(l => ({ ...l, leaves: true }));
    try {
      const res = await api.get('/api/admin/leaves');
      setLeaves(res.data);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(l => ({ ...l, leaves: false })); }
  };

  const handleUpdateLeave = async (id, status) => {
    try {
      await api.patch(`/api/admin/leaves/${id}`, { status });
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      toast.success(`Leave ${status}`);
      fetchStats(); // refresh pending count
    } catch { toast.error('Failed to update leave'); }
  };

  const titles = {
    overview:   { title: 'Overview',        sub: 'Company-wide summary' },
    users:      { title: 'Users',           sub: 'All registered users in your company' },
    attendance: { title: 'Attendance Log',  sub: 'All attendance records across all users' },
    leaves:     { title: 'Leave Requests',  sub: 'Review and action leave applications' },
  };

  return (
    <div className="app-shell">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        logout={logout}
      />

      <main className="main-content fade-up">
        <div className="page-header">
          <h1 className="page-title">{titles[activeTab].title}</h1>
          <p className="page-subtitle">{titles[activeTab].sub}</p>
        </div>

        {activeTab === 'overview'   && <OverviewTab   stats={stats}           loading={loading.stats}      />}
        {activeTab === 'users'      && <UsersTab       users={users}           loading={loading.users}      />}
        {activeTab === 'attendance' && <AttendanceTab  records={attendance}    loading={loading.attendance} />}
        {activeTab === 'leaves'     && <LeavesTab      leaves={leaves}         loading={loading.leaves}     onUpdateStatus={handleUpdateLeave} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
