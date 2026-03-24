
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div 
        className="animate-in zoom-in duration-200"
        style={{
          background: '#fff', borderRadius: 20, padding: 32,
          width: '100%', maxWidth: 420, textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          position: 'relative',
          border: '1px solid #eee'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', right: 20, top: 20,
            background: 'none', border: 'none', color: '#999', cursor: 'pointer'
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <div style={{
          width: 56, height: 56, borderRadius: '50%', 
          background: isDanger ? '#fef2f2' : '#f0f9ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 20px'
        }}>
          <AlertTriangle className={`w-6 h-6 ${isDanger ? 'text-[#ef4444]' : 'text-[#0ea5e9]'}`} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px', lineHeight: '1.5' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1, height: 48, background: '#f9fafb', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1, height: 48, 
              background: isDanger ? '#ef4444' : '#111827', 
              color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
