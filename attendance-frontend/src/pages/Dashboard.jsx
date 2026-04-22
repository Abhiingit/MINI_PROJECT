import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Clock, Calendar, FileText,
  LogOut, Download, CheckCircle2, Timer,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

/* ── helpers ─────────────────────────────── */
const fmt = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

/* ── sub-components ──────────────────────── */
function Sidebar({ activeTab, setActiveTab, user, logout }) {
  const navItems = [
    { id: 'overview',  label: 'Overview',      icon: LayoutDashboard },
    { id: 'history',   label: 'History',        icon: Calendar },
    { id: 'leave',     label: 'Apply Leave',    icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <LayoutDashboard size={16} color="white" />
        </div>
        <span className="sidebar-logo-text">AttendTrack</span>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>
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
          <div className="user-avatar">{initials(user?.name)}</div>
          <span className="user-name">{user?.name || 'User'}</span>
        </div>
        {user?.role === 'admin' && (
          <button
            className="nav-item"
            onClick={() => window.location.href = '/admin'}
            style={{ color: 'var(--accent-2)', marginBottom: '2px' }}
          >
            <LayoutDashboard size={14} />
            Admin Panel
          </button>
        )}
        <button className="nav-item" onClick={logout} style={{ color: '#ef4444', marginTop: '4px' }}>
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function StatStrip({ stats, loading }) {
  const tiles = [
    { label: 'Working Days',    value: stats.totalWorking, cls: '' },
    { label: 'Present',         value: stats.present,      cls: 'green' },
    { label: 'Absent',          value: stats.absent,       cls: 'red' },
    { label: 'Attendance Rate', value: `${stats.percentage}%`, cls: stats.percentage >= 75 ? 'accent' : 'red' },
  ];
  return (
    <div className="stat-strip">
      {tiles.map(t => (
        <div className="stat-tile" key={t.label}>
          <div className="stat-tile-label">{t.label}</div>
          <div className={`stat-tile-value ${t.cls}`}>
            {loading ? '—' : t.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckInCard({ status, loading, onCheckIn, onCheckOut }) {
  const isIn = status === 'CHECKED_IN';
  return (
    <div className="card checkin-card">
      <div className="card-header">
        <span className="card-title"><Clock size={15} /> Today's Action</span>
        <span
          className={`badge ${isIn ? 'badge-green' : 'badge-amber'}`}
        >
          {isIn ? 'Active' : 'Pending'}
        </span>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="spinner spinner-lg" />
        ) : (
          <>
            <div className={`status-ring ${isIn ? 'active' : 'waiting'}`}>
              {isIn
                ? <CheckCircle2 size={36} color="var(--green)" />
                : <Timer size={36} color="var(--amber)" />
              }
            </div>
            <p className="status-text">{isIn ? 'Session Active' : 'Not Checked In'}</p>
            {isIn
              ? <button className="btn btn-danger" onClick={onCheckOut}>Check Out</button>
              : <button className="btn btn-primary" onClick={onCheckIn}>Check In Now</button>
            }
          </>
        )}
      </div>
    </div>
  );
}

function HeatmapCard({ days }) {
  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="card-header">
        <span className="card-title"><Calendar size={15} /> Last 28 Days</span>
      </div>
      <div className="card-body">
        <div className="heatmap-grid">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="heatmap-label">{d}</div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className={`heatmap-day ${day.status}`}
              title={`${new Date(day.date).toDateString()} — ${day.status}`}
            >
              {day.dayNum}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span><span className="legend-dot" style={{ background:'var(--green)', border:'1px solid var(--green-border)' }} />Present</span>
          <span><span className="legend-dot" style={{ background:'var(--red)', border:'1px solid var(--red-border)' }} />Absent</span>
          <span><span className="legend-dot" style={{ background:'var(--surface-2)' }} />Weekend</span>
        </div>
      </div>
    </div>
  );
}

function HistoryTable({ records, loading, onExport }) {
  if (loading) return (
    <div className="empty-state"><div className="spinner spinner-lg" /></div>
  );
  if (!records.length) return (
    <div className="empty-state">
      <Calendar size={40} />
      <p>No attendance records yet.</p>
    </div>
  );
  return (
    <div className="table-scroll">
      <table className="att-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id}>
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
  );
}

function LeaveForm() {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    // NOTE: Backend doesn't yet have GET /api/leave — only POST /api/leave/apply
    // So we show submit form only; list will be empty unless backend adds the route
    setLeaves([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      return toast.error('Please fill all fields');
    }
    setBusy(true);
    try {
      await api.post('/api/leave/apply', form);
      toast.success('Leave application submitted!');
      setForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title"><FileText size={15} /> Apply for Leave</span>
        </div>
        <div className="card-body">
          <form className="leave-form" onSubmit={handleSubmit}>
            <div>
              <label style={{ fontSize:'12.5px', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Start Date</label>
              <input
                type="date"
                className="input-no-icon"
                value={form.startDate}
                onChange={e => setForm(p => ({...p, startDate: e.target.value}))}
                required
              />
            </div>
            <div>
              <label style={{ fontSize:'12.5px', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>End Date</label>
              <input
                type="date"
                className="input-no-icon"
                value={form.endDate}
                onChange={e => setForm(p => ({...p, endDate: e.target.value}))}
                required
              />
            </div>
            <div>
              <label style={{ fontSize:'12.5px', color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6 }}>Reason</label>
              <textarea
                className="input-no-icon"
                placeholder="Briefly describe the reason for leave..."
                value={form.reason}
                onChange={e => setForm(p => ({...p, reason: e.target.value}))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="spinner" /> : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>

      {leaves.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Past Applications</p>
          <div className="leave-list">
            {leaves.map((l, i) => (
              <div key={i} className="leave-item">
                <div>
                  <div className="leave-reason">{l.reason}</div>
                  <div className="leave-dates">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</div>
                </div>
                <span className={`badge ${l.status === 'approved' ? 'badge-green' : l.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────── */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [status, setStatus]       = useState('WAITING');
  const [stats, setStats]         = useState({ totalWorking:0, present:0, absent:0, percentage:0 });
  const [calDays, setCalDays]     = useState([]);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res  = await api.get('/api/attendance/my-attendance');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setRecords(data);

      const today = new Date().toDateString();
      const todayRec = data.find(r => new Date(r.date).toDateString() === today);
      setStatus(todayRec?.status === 'Present' && !todayRec?.checkOutTime ? 'CHECKED_IN' : 'WAITING');

      computeStats(data);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (data) => {
    const days = [];
    let present = 0, working = 0;
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (!isWeekend) working++;
      const rec = data.find(r => new Date(r.date).toDateString() === d.toDateString());
      const isToday = d.toDateString() === new Date().toDateString();
      let s = isWeekend ? 'weekend' : (rec?.status === 'Present' ? 'present' : (d < new Date().setHours(0,0,0,0) ? 'absent' : 'pending'));
      if (isToday) s += ' today';
      if (s.includes('present')) present++;
      days.push({ date: d, status: s, dayNum: d.getDate() });
    }
    setCalDays(days);
    const absent = working - present;
    setStats({ totalWorking: working, present, absent, percentage: working ? Math.round((present/working)*100) : 0 });
  };

  const checkIn = async () => {
    setActionBusy(true);
    try {
      await api.post('/api/attendance/checkin');
      toast.success('Checked in!');
      setStatus('CHECKED_IN');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally { setActionBusy(false); }
  };

  const checkOut = async () => {
    setActionBusy(true);
    try {
      await api.post('/api/attendance/checkout');
      toast.success('Checked out!');
      setStatus('WAITING');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally { setActionBusy(false); }
  };

  const downloadCSV = () => {
    if (!records.length) return toast.error('No data to export');
    const rows = records.map(r =>
      `"${new Date(r.date).toLocaleDateString()}","${r.status}","${fmt(r.checkInTime)}","${fmt(r.checkOutTime)}"`
    );
    const csv = ['Date,Status,Check-In,Check-Out', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    a.download = `attendance_${Date.now()}.csv`;
    a.click();
    toast.success('Download started');
  };

  /* ── Page titles ── */
  const titles = {
    overview: { title: 'Overview',    sub: 'Your attendance at a glance' },
    history:  { title: 'History',     sub: 'Full attendance log' },
    leave:    { title: 'Apply Leave', sub: 'Submit a leave request' },
  };

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout} />

      <main className="main-content fade-up">
        <div className="page-header">
          <h1 className="page-title">{titles[activeTab].title}</h1>
          <p className="page-subtitle">{titles[activeTab].sub}</p>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <StatStrip stats={stats} loading={loading} />
            <div className="content-grid">
              <div>
                <CheckInCard
                  status={status}
                  loading={loading || actionBusy}
                  onCheckIn={checkIn}
                  onCheckOut={checkOut}
                />
                <HeatmapCard days={calDays} />
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><Calendar size={15} /> Recent</span>
                  <button className="btn btn-ghost" onClick={downloadCSV}>
                    <Download size={13} /> Export CSV
                  </button>
                </div>
                <HistoryTable records={records.slice(0, 10)} loading={loading} onExport={downloadCSV} />
              </div>
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title"><Calendar size={15} /> Full Attendance Log</span>
              <button className="btn btn-ghost" onClick={downloadCSV}>
                <Download size={13} /> Export CSV
              </button>
            </div>
            <HistoryTable records={records} loading={loading} onExport={downloadCSV} />
          </div>
        )}

        {/* ── LEAVE TAB ── */}
        {activeTab === 'leave' && <LeaveForm />}
      </main>
    </div>
  );
};

export default Dashboard;
