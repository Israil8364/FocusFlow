
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, History, BarChart2, Play, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ConfirmationModal.jsx';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pomodoro, break
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionToDelete);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
      toast.success('Session deleted');
    } catch(error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
        setSessionToDelete(null);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSessions(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'pomodoro') return s.type === 'pomodoro';
    return s.type !== 'pomodoro';
  });

  const totalFocusTime = sessions
    .filter(s => s.type === 'pomodoro')
    .reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <>
      <Helmet>
        <title>History - FocusFlow</title>
      </Helmet>
      <ConfirmationModal 
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this session?"
        message="This record will be permanently removed from your history."
        confirmText="Delete"
      />
      <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-heading mb-2">Session History</h1>
            <p className="text-body text-[var(--text-muted)]">Review your past focus sessions and breaks.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
             <Link to="/timer" className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] border border-[var(--border)] text-sm font-medium bg-[var(--card)] hover:bg-[var(--bg)] transition-colors shadow-sm"><Play className="w-4 h-4" /> Timer</Link>
             <Link to="/analytics" className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] border border-[var(--border)] text-sm font-medium bg-[var(--card)] hover:bg-[var(--bg)] transition-colors shadow-sm"><BarChart2 className="w-4 h-4" /> Analytics</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--card)] p-6 rounded-[var(--radius-md)] shadow-neu-sm border border-[var(--border)]">
            <div className="text-eyebrow text-[var(--text-muted)] mb-2">Total Sessions</div>
            <div className="text-stat">{sessions.length}</div>
          </div>
          <div className="bg-[var(--card)] p-6 rounded-[var(--radius-md)] shadow-neu-sm border border-[var(--border)]">
            <div className="text-eyebrow text-[var(--text-muted)] mb-2">Total Focus Time</div>
            <div className="text-stat">{Math.round(totalFocusTime)} <span className="text-body font-normal text-[var(--text-muted)]">min</span></div>
          </div>
          <div className="bg-[var(--card)] p-6 rounded-[var(--radius-md)] shadow-neu-sm border border-[var(--border)]">
            <div className="text-eyebrow text-[var(--text-muted)] mb-2">Avg Session</div>
            <div className="text-stat">
              {sessions.filter(s=>s.type==='pomodoro').length ? Math.round(totalFocusTime / sessions.filter(s=>s.type==='pomodoro').length) : 0} <span className="text-body font-normal text-[var(--text-muted)]">min</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pomodoro', 'break'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-[var(--radius-pill)] text-sm font-medium capitalize transition-colors ${
                filter === f 
                  ? 'bg-[var(--text-primary)] text-[var(--bg)]' 
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading history...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-muted)]">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No sessions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 md:p-6 hover:bg-[var(--bg)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-12 rounded-full ${session.type === 'pomodoro' ? 'bg-tomato' : 'bg-sage'}`}></div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)] capitalize flex items-center gap-2">
                        {session.type === 'pomodoro' ? 'Focus Session' : 'Break'}
                        <CheckCircle2 className="w-4 h-4 text-sage" />
                      </div>
                      <div className="text-sm text-[var(--text-muted)] flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(session.created_at), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(session.created_at), 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-row items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-[var(--text-primary)]">{session.duration}m</div>
                    </div>
                    <button 
                      onClick={() => setSessionToDelete(session.id)}
                      className="p-2 text-[var(--text-muted)] hover:text-tomato hover:bg-[var(--card)] rounded-full transition-colors flex-shrink-0"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryPage;
