import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient';
import { User, Camera, Target, ChevronRight, Loader2, Sparkles, Flame, Zap, Coffee, Rocket, Check } from 'lucide-react';
import { toast } from 'sonner';

const TOTAL_STEPS = 3;

const GOAL_OPTIONS = [
  { value: 1, label: '1 Pomodoro', desc: 'Just getting started 🌱', icon: Coffee },
  { value: 2, label: '2 Pomodoros', desc: 'Light work day 😌', icon: Zap },
  { value: 4, label: '4 Pomodoros', desc: 'Steady grind mode 💪', icon: Flame },
  { value: 6, label: '6 Pomodoros', desc: 'Serious hustle 🔥', icon: Rocket },
  { value: 8, label: '8 Pomodoros', desc: 'No cap, beast mode 😤', icon: Sparkles },
];

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-500"
          style={{
            height: '6px',
            borderRadius: '3px',
            background: i < current
              ? 'var(--accent)'
              : i === current
              ? 'var(--accent)'
              : 'var(--border)',
            width: i === current ? '32px' : '16px',
            opacity: i < current ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────── Step 1: Display Name ─────────────── */
function StepName({ value, onChange, onNext }) {
  const [err, setErr] = useState('');

  const handleNext = () => {
    if (!value.trim()) { setErr('Gotta give us a name bestie 👀'); return; }
    if (value.trim().length < 2) { setErr('At least 2 characters pls 🙏'); return; }
    onNext();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">👋</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What should we call you?</h2>
        <p className="text-[var(--text-muted)] text-sm">This shows up on your profile and leaderboard</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <input
          id="onboard-name"
          type="text"
          placeholder="e.g. Alex, studygrinder, chill_bro..."
          value={value}
          onChange={e => { onChange(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          className="w-full px-4 py-3 rounded-xl border text-[var(--text-primary)] bg-[var(--card)] placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 text-base"
          style={{ borderColor: err ? '#ef4444' : 'var(--border)' }}
          autoFocus
        />
        {err && <p className="text-red-500 text-xs pl-1">{err}</p>}
      </div>

      <button
        onClick={handleNext}
        className="onboard-btn flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)' }}
      >
        Let's go <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─────────────── Step 2: Avatar ─────────────── */
function StepAvatar({ displayName, avatarUrl, onAvatarChange, onNext, onSkip }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const initial = displayName?.charAt(0)?.toUpperCase() || '?';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image too large. Max 3MB 🙅');
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const ext = file.name.split('.').pop();
      const path = `avatars/${userId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      onAvatarChange(data.publicUrl + '?t=' + Date.now());
      toast.success('Looking fresh! 🔥');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed, try again 😬');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">📸</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add a profile pic</h2>
        <p className="text-[var(--text-muted)] text-sm">Optional but it makes you look legit ngl</p>
      </div>

      {/* Avatar preview */}
      <div
        className="relative cursor-pointer group"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <div
          className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-white transition-all duration-200 group-hover:opacity-80"
          style={{ background: avatarUrl ? 'transparent' : 'var(--accent)' }}
        >
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : initial
          }
        </div>
        <div className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
          style={{ background: 'var(--accent)' }}>
          {uploading
            ? <Loader2 size={16} className="text-white animate-spin" />
            : <Camera size={16} className="text-white" />
          }
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="px-6 py-2.5 rounded-xl border font-medium text-[var(--text-muted)] transition-all hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] text-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          disabled={uploading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)', opacity: uploading ? 0.7 : 1 }}
        >
          {avatarUrl ? 'Looks good!' : 'Continue'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Step 3: Daily Goal ─────────────── */
function StepGoal({ value, onChange, onFinish, loading }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">🎯</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Set your daily goal</h2>
        <p className="text-[var(--text-muted)] text-sm">How many Pomodoros you tryna hit per day?</p>
      </div>

      <div className="w-full max-w-sm space-y-2.5">
        {GOAL_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left hover:scale-[1.01]"
              style={{
                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                background: selected ? 'color-mix(in srgb, var(--accent) 10%, var(--card))' : 'var(--card)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: selected ? 'var(--accent)' : 'var(--border)' }}>
                <Icon size={18} className={selected ? 'text-white' : 'text-[var(--text-muted)]'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)] text-sm">{opt.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
              </div>
              {selected && <Check size={18} style={{ color: 'var(--accent)' }} />}
            </button>
          );
        })}
      </div>

      <button
        onClick={onFinish}
        disabled={!value || loading}
        className="flex items-center gap-2 px-10 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--accent)' }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
        {loading ? 'Setting up…' : "Let's focus! 🚀"}
      </button>
    </div>
  );
}

/* ─────────────── Main Onboarding Page ─────────────── */
export default function OnboardingPage() {
  const { completeOnboarding, currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [dailyGoal, setDailyGoal] = useState(4);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await completeOnboarding({ displayName, avatarUrl, dailyGoal });
      toast.success(`Welcome aboard, ${displayName}! Time to get locked in 🔥`);
      navigate('/', { replace: true });
    } catch {
      toast.error('Something went wrong 😬 try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'var(--accent)', transform: 'translate(-40%, -40%)' }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--accent)', transform: 'translate(40%, 40%)' }} />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Brand header */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: 'var(--accent)' }}>FocusFlow</p>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Quick setup</h1>
        </div>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        {/* Steps */}
        <div className="transition-all duration-300">
          {step === 0 && (
            <StepName
              value={displayName}
              onChange={setDisplayName}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepAvatar
              displayName={displayName}
              avatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
              onNext={() => setStep(2)}
              onSkip={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepGoal
              value={dailyGoal}
              onChange={setDailyGoal}
              onFinish={handleFinish}
              loading={saving}
            />
          )}
        </div>

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="absolute top-6 left-6 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
