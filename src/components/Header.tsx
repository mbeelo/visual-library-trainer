import { Users, Plus, LogOut } from 'lucide-react';
import { TrainingList } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeList: TrainingList;
  allLists: TrainingList[];
  onSetActiveList: (list: TrainingList) => void;
  showListBrowser: boolean;
  setShowListBrowser: (show: boolean) => void;
  showListCreator: boolean;
  setShowListCreator: (show: boolean) => void;
  onNavigateHome?: () => void;
  onShowAuth?: (mode: 'signin' | 'signup') => void;
}

export default function Header({
  activeList,
  allLists,
  onSetActiveList,
  showListBrowser,
  setShowListBrowser,
  showListCreator,
  setShowListCreator,
  onNavigateHome,
  onShowAuth
}: HeaderProps) {
  const { user, signOut, subscriptionTier } = useAuth();
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onNavigateHome}
          className="text-3xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Visual Library Trainer
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Pro
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}

          <button
            onClick={() => setShowListBrowser(!showListBrowser)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Users size={20} />
            Browse Lists
          </button>
          <button
            onClick={() => setShowListCreator(!showListCreator)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
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