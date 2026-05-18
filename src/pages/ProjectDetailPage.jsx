import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Modal, EmptyState, Spinner, StatusBadge, PriorityBadge, ConfirmDialog, Select } from '../components/ui/index.jsx';
import {
  ArrowLeft, Plus, CheckSquare, Clock, AlertTriangle, Trash2,
  User, Calendar, ChevronDown, RefreshCw, MoreHorizontal, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

// ── Create Task Modal ──────────────────────────────────────────────────────────
function CreateTaskModal({ isOpen, onClose, projectId, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    due_date: '', assigned_to: '',
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) usersAPI.list().then(r => setUsers(r.data.data || [])).catch(() => {});
  }, [isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await tasksAPI.create(projectId, form);
      toast.success('Task created!');
      onCreate(data.data);
      onClose();
      setForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs).flat()[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Task Title</label>
          <input className="input-field" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="What needs to be done?" required autoFocus />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none" rows={2} value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="Optional details..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Priority" value={form.priority} onChange={v => set('priority', v)}
            options={[{ value: 'high', label: '🔴 High' }, { value: 'medium', label: '🟡 Medium' }, { value: 'low', label: '⚪ Low' }]} />
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input-field" value={form.due_date}
              onChange={e => set('due_date', e.target.value)} required
              min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        <div>
          <label className="label">Assign To</label>
          <select className="input-field" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} required>
            <option value="">Select a user...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <><Plus size={16} /> Create Task</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Status Change Menu ─────────────────────────────────────────────────────────
function StatusMenu({ task, isAdmin, onStatusChange }) {
  const [open, setOpen] = useState(false);

  const STATUSES = ['TODO', 'WIP', 'DONE', ...(isAdmin ? ['OVERDUE'] : [])];

  const canChange = (newStatus) => {
    if (task.status === 'OVERDUE' && newStatus === 'WIP') return false;
    if (task.status === 'OVERDUE' && newStatus === 'DONE' && !isAdmin) return false;
    return task.status !== newStatus;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <StatusBadge status={task.status} />
        <ChevronDown size={12} className="text-ink-500" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 glass-card p-1.5 min-w-[140px] shadow-xl shadow-ink-950">
          {STATUSES.map(s => {
            const ok = canChange(s);
            return (
              <button
                key={s}
                disabled={!ok}
                onClick={() => { onStatusChange(task.id, s); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors
                  ${ok ? 'hover:bg-ink-700 text-ink-200' : 'opacity-30 cursor-not-allowed text-ink-500'}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Task Row ───────────────────────────────────────────────────────────────────
function TaskRow({ task, isAdmin, onStatusChange, onDelete, canDelete }) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const overdue = task.status === 'OVERDUE';
  const pastDue = dueDate && isPast(dueDate) && task.status !== 'DONE';

  return (
    <div className={`glass-card p-4 transition-all duration-200 hover:border-ink-700/60 
      ${overdue ? 'border-coral-500/20 bg-coral-500/5' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Priority indicator */}
        <div className={`w-1 self-stretch rounded-full shrink-0 ${
          task.priority === 'high' ? 'bg-coral-400' :
          task.priority === 'medium' ? 'bg-amber-400' : 'bg-ink-700'
        }`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold text-sm ${overdue ? 'text-coral-300' : 'text-ink-100'}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <StatusMenu task={task} isAdmin={isAdmin} onStatusChange={onStatusChange} />
              {canDelete && (
                <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg text-ink-600 hover:text-coral-400 hover:bg-coral-500/10 transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-ink-500 mb-3 line-clamp-1">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs font-mono text-ink-500 flex-wrap">
            <PriorityBadge priority={task.priority} />
            {task.assignee && (
              <span className="flex items-center gap-1.5">
                <User size={11} />
                {task.assignee.name}
              </span>
            )}
            {dueDate && (
              <span className={`flex items-center gap-1.5 ${pastDue ? 'text-coral-400' : ''}`}>
                {overdue ? <AlertTriangle size={11} /> : <Calendar size={11} />}
                {format(dueDate, 'MMM d, yyyy')}
                {overdue && <span className="text-coral-400 font-semibold">· OVERDUE</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        projectsAPI.get(id),
        tasksAPI.listByProject(id),
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data || []);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await tasksAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? data.data : t));
      toast.success(`Status → ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tasksAPI.delete(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <button onClick={() => navigate('/projects')} className="btn-ghost flex items-center gap-2 mb-4 -ml-1 text-ink-500">
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-ink-500 uppercase tracking-widest mb-1">
              {project?.status}
            </p>
            <h1 className="page-title">{project?.name}</h1>
            {project?.description && (
              <p className="text-ink-500 mt-2 max-w-xl">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="btn-ghost flex items-center gap-2">
              <RefreshCw size={15} />
            </button>
            {isAdmin && (
              <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { key: 'TODO', label: 'To Do', color: 'text-ink-400' },
          { key: 'WIP', label: 'In Progress', color: 'text-blue-400' },
          { key: 'DONE', label: 'Done', color: 'text-volt-400' },
          { key: 'OVERDUE', label: 'Overdue', color: 'text-coral-400' },
        ].map((s, i) => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className={`glass-card p-4 text-left transition-all ${filter === s.key ? 'border-volt-500/30' : 'hover:border-ink-700'}`}
          >
            <p className="text-xs text-ink-500 font-mono mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{counts[s.key] || 0}</p>
          </button>
        ))}
      </div>

      {/* Members */}
      {project?.members?.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-ink-500 font-mono">Members:</span>
          <div className="flex -space-x-2">
            {project.members.slice(0, 6).map((m) => (
              <div
                key={m.id}
                title={m.name}
                className="w-7 h-7 rounded-full bg-ink-700 border-2 border-ink-950 flex items-center justify-center text-xs font-bold text-ink-300"
              >
                {m.name[0].toUpperCase()}
              </div>
            ))}
          </div>
          {project.members.length > 6 && (
            <span className="text-xs text-ink-500">+{project.members.length - 6} more</span>
          )}
        </div>
      )}

      {/* Filter strip */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filter === 'all' ? 'bg-volt-500/15 text-volt-400' : 'text-ink-500 hover:text-ink-300'}`}>
          All ({tasks.length})
        </button>
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${filter === k ? 'bg-volt-500/15 text-volt-400' : 'text-ink-500 hover:text-ink-300'}`}>
            {k} ({v})
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks here"
          description={isAdmin ? "Create the first task for this project" : "No tasks assigned to you in this project"}
          action={isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Task
            </button>
          )}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              isAdmin={isAdmin}
              onStatusChange={handleStatusChange}
              onDelete={setDeleteTarget}
              canDelete={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={id}
        onCreate={(t) => setTasks(prev => [t, ...prev])}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        danger
      />
    </div>
  );
}
