import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, UserCog, Trash2, CheckCircle2 } from 'lucide-react';

interface AdminUserRow {
  user_id: string;
  email: string;
  role: 'admin' | 'moderator';
  created_at: string;
}

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newUid, setNewUid] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'moderator'>('moderator');
  const [statusMsg, setStatusMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setUsers(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    if (!newEmail || !newUid) {
      setStatusMsg('Email və UID xanaları doldurulmalıdır.');
      return;
    }

    const { error } = await supabase
      .from('admin_users')
      .insert([{ user_id: newUid, email: newEmail, role: newRole }]);

    if (error) {
      setStatusMsg(`Xəta: ${error.message}`);
    } else {
      setStatusMsg('İstifadəçi uğurla əlavə edildi!');
      setNewEmail('');
      setNewUid('');
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (window.confirm(`"${email}" istifadəçisini silmək istədiyinizə əminsiniz?`)) {
      await supabase.from('admin_users').delete().eq('user_id', userId);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#FFD21A]" />
            Yeni Admin / Moderator Əlavə Et
          </h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Təhlükəsizlik qaydalarına əsasən, yeni istifadəçi şifrəsi Supabase tərəfindən şifrələnməlidir. Yeni Moderator və ya Admin əlavə etmək üçün:<br/><br/>
            1. <strong><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#FFD21A] hover:underline">Supabase Panelinə</a></strong> daxil olun.<br/>
            2. Sol menyudan <strong>Authentication</strong> &gt; <strong>Users</strong> bölməsinə keçin və <strong>Add user &gt; Create new user</strong> basın.<br/>
            3. Həmin adam üçün Email və Şifrə yazaraq yaradın.<br/>
            4. Yaratdığınız istifadəçinin qarşısındakı <strong>User UID</strong> kodunu kopyalayın və aşağıdakı formaya yapışdırın.
          </p>
        </div>
        
        <form onSubmit={handleAddUser} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1.5">User UID (Supabase-dən)</label>
              <input
                type="text"
                required
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
                placeholder="məs: 3f4a...-..."
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="istifadeci@ecolife.az"
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD21A] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1.5">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'moderator')}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FFD21A] focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="moderator">Moderator (Yalnız əlavə/redaktə)</option>
                <option value="admin">Admin (Tam hüquq, silmə daxil)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-[#FFD21A] hover:bg-[#F0C413] text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Əlavə Et</span>
            </button>
            
            {statusMsg && (
              <span className={`text-sm ${statusMsg.includes('Xəta') ? 'text-red-400' : 'text-emerald-400'}`}>
                {statusMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-[#12131A] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#FFD21A]" />
            Mövcud Adminlər və Moderatorlar
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-[10px] uppercase font-mono text-gray-500 bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Email</th>
                <th className="px-6 py-4 font-medium tracking-wider">Rol</th>
                <th className="px-6 py-4 font-medium tracking-wider">Əlavə Edilib</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Yüklənir...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">İstifadəçi tapılmadı.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.user_id, u.email)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors inline-flex opacity-0 group-hover:opacity-100"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
