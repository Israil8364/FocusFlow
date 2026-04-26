import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$2',
    period: '/mo',
    sub: 'Billed monthly',
    badge: null,
    badgeColor: null,
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$18',
    period: '/yr',
    sub: '$1.50 / month, billed yearly',
    badge: 'Most popular',
    badgeColor: 'text-[var(--accent)]',
    featured: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$54',
    period: '/once',
    sub: 'One-time payment, forever',
    badge: 'Best value',
    badgeColor: 'text-[#3aaa6e]',
    featured: false,
  },
];

const FEATURES = [
  'Add projects',
  'See yearly report',
  'Download report',
  'Import tasks from Todoist',
  'No ads',
  'All future updates',
];

const UpgradePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const avatarUrl = currentUser?.avatar
    ? currentUser.avatar.startsWith('http') ? currentUser.avatar : supabase.storage.from('avatars').getPublicUrl(currentUser.avatar).data.publicUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'default'}&backgroundColor=f0ede8`;

  return (
    <>
      <Helmet>
        <title>Upgrade — FocusFlow</title>
      </Helmet>

      <div className="max-w-lg mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-semibold text-[18px] tracking-tight text-[var(--text-primary)]">Upgrade</h1>
          <img
            src={avatarUrl}
            alt={currentUser?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover border-2 border-[var(--border)]"
          />
        </div>

        {/* Plan picker label */}
        <p className="text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase mb-3">
          Choose your plan
        </p>

        {/* Plan cards */}
        <div className="flex flex-col gap-3 mb-8">
          {PLANS.map(plan => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full text-left p-5 rounded-[var(--radius-md)] border-2 bg-[var(--card)] transition-all duration-200 active:scale-[0.99] ${
                  isSelected
                    ? 'border-[var(--text-primary)] shadow-neu-sm'
                    : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                }`}
              >
                {plan.badge && (
                  <p className={`text-[11px] font-bold mb-1 ${plan.badgeColor}`}>{plan.badge}</p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{plan.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{plan.sub}</p>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                    <span className="text-xs text-[var(--text-muted)]">{plan.period}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          className="w-full h-[52px] rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] font-semibold text-[15px] shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 mb-8"
        >
          {selectedPlan === 'lifetime' ? 'Get Lifetime' : `Start ${PLANS.find(p => p.id === selectedPlan)?.name}`}
        </button>

        {/* Features */}
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] border border-[var(--border)] p-6 shadow-neu-sm">
          <p className="font-semibold text-[var(--text-primary)] mb-4">Everything in Premium</p>
          <ul className="space-y-3">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-[var(--text-primary)] text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3aaa6e1a' }}>
                  <Check className="w-3 h-3" style={{ color: '#3aaa6e' }} strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default UpgradePage;
