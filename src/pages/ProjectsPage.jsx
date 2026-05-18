import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, usersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Modal, EmptyState, Spinner, StatusBadge } from '../components/ui/index.jsx';
import { FolderKanban, Plus, Users, CheckSquare, ArrowRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await projectsAPI.create(form);
      toast.success('Project created!');
      onCreate(data.data);
      onClose();
      setForm({ name: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Name</label>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Website Redesign"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What is this project about?"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <><Plus size={16} /> Create</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProjectCard({ project, onClick }) {
  const statusColor = {
    active: 'text-volt-400',
    completed: 'text-blue-400',
    archived: 'text-ink-500',
  }[project.status] || 'text-ink-400';

  const taskCount = project.tasks_count ?? project.tasks?.length ?? 0;
  const memberCount = project.members?.length ?? 0;

  return (
    <div
      onClick={onClick}
      className="glass-card-hover p-6 cursor-pointer group animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-ink-800 flex items-center justify-center group-hover:bg-volt-500/10 transition-colors">
          <FolderKanban size={18} className={`${statusColor} transition-colors`} />
        </div>
        <span className={`text-xs font-mono font-semibold uppercase tracking-widest ${statusColor}`}>
          {project.status}
        </span>
      </div>

      <h3 className="font-bold text-ink-50 text-lg mb-1 group-hover:text-volt-400 transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-ink-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-ink-500 font-mono">
        <span className="flex items-center gap-1.5">
          <CheckSquare size={13} />
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        {project.created_at && (
          <span className="flex items-center gap-1.5 ml-auto">
            <Calendar size={13} />
            {format(new Date(project.created_at), 'MMM d')}
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-ink-800 flex items-center justify-between">
        <span className="text-xs text-ink-600">by {project.creator?.name || 'Admin'}</span>
        <ArrowRight size={14} className="text-ink-600 group-hover:text-volt-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await projectsAPI.list();
      setProjects(data.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="animate-fade-in">
          <p className="text-xs font-mono text-ink-500 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="page-title">Projects</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 animate-fade-in">
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink-300' },
          { label: 'Active', value: stats.active, color: 'text-volt-400' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-xs text-ink-500 font-mono uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed', 'archived'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-volt-500/15 text-volt-400 border border-volt-500/30'
                : 'text-ink-500 hover:text-ink-300 hover:bg-ink-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={isAdmin ? "Create your first project to get started" : "You haven't been added to any projects yet"}
          action={isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Project
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(p) => setProjects(prev => [p, ...prev])}
      />
    </div>
  );
}
