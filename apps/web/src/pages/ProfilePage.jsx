
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import { User, Mail, Key, Trash2, Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@/components/ConfirmationModal.jsx';

const ProfilePage = () => {
  const { currentUser, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      const url = currentUser.avatar 
        ? (currentUser.avatar.startsWith('http') ? currentUser.avatar : supabase.storage.from('avatars').getPublicUrl(currentUser.avatar).data.publicUrl)
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}&backgroundColor=f0ede8`;
      setAvatarPreview(url);
    }
  }, [currentUser]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      toast.error('Profile updates are not available in Guest Mode. Please sign up to save your profile.');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = currentUser.avatar;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;
        avatarUrl = fileName;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser?.email,
          full_name: name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      // In Supabase client, we can't delete the auth user, but we can wipe their data
      await Promise.all([
        supabase.from('profiles').delete().eq('id', currentUser.id),
        supabase.from('tasks').delete().eq('user_id', currentUser.id),
        supabase.from('sessions').delete().eq('user_id', currentUser.id),
        supabase.from('settings').delete().eq('user_id', currentUser.id),
      ]);
      
      toast.success('Your data has been cleared. Logging out...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Failed to clear account data');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile - FocusFlow</title>
      </Helmet>
      
      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account permanently?"
        message="This will delete your entire FocusFlow account, settings, and all your session history. This cannot be undone."
        confirmText="Delete Account"
      />
      <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-heading mb-2">Profile</h1>
          <p className="text-body text-[var(--text-muted)]">Manage your account details and preferences.</p>
        </div>

        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-[var(--bg)] shadow-neu overflow-hidden group">
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-xs text-[var(--text-muted)]">Click to change avatar</div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Display Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={currentUser?.email || ''} 
                  disabled
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2.5 text-[var(--text-muted)] cursor-not-allowed opacity-70"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg)] rounded-[var(--radius-pill)] font-medium shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] p-6 md:p-8">
          <h3 className="text-subheading text-tomato flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowDeleteModal(true)}
              disabled={saving}
              className="px-6 py-2.5 bg-red-50 text-tomato border border-red-100 rounded-md font-medium hover:bg-red-100 transition-colors dark:bg-red-950/30 dark:border-red-900 disabled:opacity-50"
            >
              {saving ? 'Processing...' : 'Delete Account'}
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] rounded-md font-medium hover:bg-[var(--bg)] hover:text-tomato transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProfilePage;
