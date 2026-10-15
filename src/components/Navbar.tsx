import { useState } from 'react';
import { User, AppNotification } from '../types';
import { 
  GraduationCap, 
  Layers, 
  Bell, 
  RotateCcw, 
  UserCheck, 
  ChevronDown, 
  Briefcase, 
  Building2, 
  ShieldAlert, 
  CheckCheck,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  viewMode: 'portal' | 'blueprint';
  onSwitchViewMode: (mode: 'portal' | 'blueprint') => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onResetData: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onSwitchUser,
  viewMode,
  onSwitchViewMode,
  notifications,
  onMarkNotificationRead,
  onResetData,
}: NavbarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                CampusRecruit
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  ENTERPRISE
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Placement & Career Advancement Cell</p>
            </div>
          </div>

          {/* View Mode Switch (Live Portal vs Architecture Blueprint) */}
          <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSwitchViewMode('portal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'portal'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recruitment Portal
            </button>
            <button
              onClick={() => onSwitchViewMode('blueprint')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'blueprint'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture & ER Schema</span>
            </button>
          </div>

          {/* Right Controls: Role Switcher & Notifications */}
          <div className="flex items-center gap-2">
            {/* View Mode Switch for mobile */}
            <div className="flex md:hidden">
              <button
                onClick={() => onSwitchViewMode(viewMode === 'portal' ? 'blueprint' : 'portal')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-400"
              >
                {viewMode === 'portal' ? 'Blueprint' : 'Portal'}
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-xs z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">Notifications ({notifications.length})</span>
                    <button
                      onClick={() => notifications.forEach(n => onMarkNotificationRead(n.id))}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center text-slate-500 py-4">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            n.read
                              ? 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                              : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-white text-[11px]">{n.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-950 border border-indigo-500/40 flex-shrink-0">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-indigo-400 uppercase font-mono font-bold">
                    {currentUser.role.toUpperCase()}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 text-xs z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold text-slate-500">
                    Switch Test User & Role
                  </div>

                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="leading-tight">{u.name}</div>
                          <div className="text-[10px] opacity-75 uppercase font-mono">
                            {u.role} {u.department ? `(${u.department})` : ''}
                          </div>
                        </div>
                      </div>
                      {u.id === currentUser.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}

                  <div className="pt-2 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        onResetData();
                        setShowRoleMenu(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-rose-400 hover:bg-rose-950/40 text-[11px] font-semibold text-left flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Datasets
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
