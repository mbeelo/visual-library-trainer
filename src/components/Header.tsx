import { Users, Plus, LogOut, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrainingList } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeList: TrainingList;
  allLists: TrainingList[];
  onSetActiveList: (list: TrainingList) => void;
  onNavigateHome?: () => void;
  onShowAuth?: (mode: 'signin' | 'signup') => void;
}

export default function Header({
  activeList,
  allLists,
  onSetActiveList,
  onNavigateHome,
  onShowAuth
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut, subscriptionTier } = useAuth();
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            AfterImage
          </span>
        </button>
        <div className="flex gap-3 items-center">
          {!user && onShowAuth && (
            <>
              <button
                onClick={() => onShowAuth('signin')}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onShowAuth('signup')}
                className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign Up
              </button>
            </>
          )}

          {user && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {user.email}
                </span>
                {subscriptionTier === 'pro' && (
                  <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
                    Pro
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  await signOut()
                  onNavigateHome?.()
                }}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}

          <button
            onClick={() => navigate('/app/browse-lists')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Users size={20} />
            Browse Lists
          </button>
          <button
            onClick={() => navigate('/app/create-list')}
            className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create List
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Active list:</span>
        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={activeList.id}
          onChange={(e) => {
            const selectedList = allLists.find(list => list.id === e.target.value);
            if (selectedList) {
              onSetActiveList(selectedList);
            }
          }}
        >
          {allLists.map(list => (
            <option key={list.id} value={list.id}>
              {list.name} {list.isCustom && !list.creator ? '(Custom)' : list.creator ? `by ${list.creator}` : ''}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}