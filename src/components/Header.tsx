import { Users, Plus } from 'lucide-react';
import { TrainingList } from '../types';

interface HeaderProps {
  activeList: TrainingList;
  allLists: TrainingList[];
  onSetActiveList: (list: TrainingList) => void;
  showListBrowser: boolean;
  setShowListBrowser: (show: boolean) => void;
  showListCreator: boolean;
  setShowListCreator: (show: boolean) => void;
  onNavigateHome?: () => void;
}

export default function Header({
  activeList,
  allLists,
  onSetActiveList,
  showListBrowser,
  setShowListBrowser,
  showListCreator,
  setShowListCreator,
  onNavigateHome
}: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onNavigateHome}
          className="text-3xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Visual Library Trainer
        </button>
        <div className="flex gap-3">
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