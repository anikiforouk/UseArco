import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#64748b' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function Workspace() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' });
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
  }, []);

  useEffect(() => {
    if (!id || !token) return;
    fetchProject();
    fetchTasks();
  }, [id, token]);

  const fetchProject = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/projects/' + id);
      const data = await res.json();
      setProject(data);
    } catch (e) { console.error(e); }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks/project/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = (status = 'todo', task = null) => {
    if (task) {
      setEditTask(task);
      setForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, dueDate: task.dueDate ? task.dueDate.slice(0,10) : '' });
    } else {
      setEditTask(null);
      setForm({ title: '', description: '', priority: 'medium', status, dueDate: '' });
    }
    setShowModal(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks/' + editTask._id, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify(form)
        });
        const updated = await res.json();
        setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      } else {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ ...form, projectId: id })
        });
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
      }
      setShowModal(false);
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks/' + taskId, {
      method: 'DELETE', headers: { Authorization: 'Bearer ' + token }
    });
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  const moveTask = async (taskId, newStatus) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/tasks/' + taskId, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ status: newStatus })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t._id === updated._id ? updated : t));
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (loading) return <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}></div>;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Link href={'/projects/' + id} className='text-sm hover:opacity-70' style={{ color: 'var(--accent)' }}>Back to Project</Link>
              <span style={{ color: 'var(--text-secondary)' }}>/</span>
              <span className='text-sm' style={{ color: 'var(--text-secondary)' }}>Workspace</span>
            </div>
            <h1 className='text-2xl font-bold' style={{ color: 'var(--text-primary)' }}>{project?.title || 'Project Workspace'}</h1>
          </div>
          <button onClick={() => openModal()} className='btn-primary'>+ Add Task</button>
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className='card p-4 mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>Overall Progress</span>
              <span className='text-sm font-bold' style={{ color: 'var(--accent)' }}>{progress}% ({doneTasks}/{totalTasks} tasks)</span>
            </div>
            <div className='w-full rounded-full h-2.5' style={{ background: 'var(--border)' }}>
              <div className='h-2.5 rounded-full transition-all' style={{ width: progress + '%', background: 'var(--accent)' }} />
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className='flex flex-col gap-3'>
                {/* Column header */}
                <div className='flex items-center justify-between px-1'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2.5 h-2.5 rounded-full' style={{ background: col.color }} />
                    <span className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>{col.label}</span>
                    <span className='text-xs px-1.5 py-0.5 rounded-full' style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{colTasks.length}</span>
                  </div>
                  <button onClick={() => openModal(col.id)} className='text-lg leading-none hover:opacity-60' style={{ color: 'var(--text-secondary)' }}>+</button>
                </div>

                {/* Tasks */}
                <div className='flex flex-col gap-2 min-h-24'>
                  {colTasks.map(task => (
                    <div key={task._id} className='card p-3 cursor-pointer' onClick={() => openModal(col.id, task)}>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <p className='text-sm font-medium leading-snug' style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                        <button onClick={e => { e.stopPropagation(); deleteTask(task._id); }} className='text-xs opacity-0 hover:opacity-100 shrink-0' style={{ color: '#ef4444' }}>✕</button>
                      </div>
                      {task.description && <p className='text-xs mb-2 line-clamp-2' style={{ color: 'var(--text-secondary)' }}>{task.description}</p>}
                      <div className='flex items-center justify-between'>
                        <span className='text-xs px-2 py-0.5 rounded-full font-medium' style={{ background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                        {task.dueDate && <span className='text-xs' style={{ color: 'var(--text-secondary)' }}>{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      {/* Move buttons */}
                      <div className='flex gap-1 mt-2'>
                        {COLUMNS.filter(c => c.id !== col.id).map(c => (
                          <button key={c.id} onClick={e => { e.stopPropagation(); moveTask(task._id, c.id); }}
                            className='text-xs px-1.5 py-0.5 rounded' style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            {c.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4' style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className='card w-full max-w-md p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-bold text-lg' style={{ color: 'var(--text-primary)' }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <form onSubmit={saveTask} className='flex flex-col gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Task Title</label>
                <input className='input' required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder='What needs to be done?' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Description</label>
                <textarea className='input' rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder='Optional details...' />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Priority</label>
                  <select className='input' value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Status</label>
                  <select className='input' value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Due Date</label>
                <input type='date' className='input' value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className='flex gap-3 pt-2'>
                <button type='button' className='btn-secondary flex-1' onClick={() => setShowModal(false)}>Cancel</button>
                <button type='submit' className='btn-primary flex-1'>{editTask ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}