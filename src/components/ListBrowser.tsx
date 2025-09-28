import { useState } from 'react';
import { Check, Download } from 'lucide-react';
import { communityLists } from '../data';
import { TrainingList } from '../types';

interface ListBrowserProps {
  show: boolean;
  onUseList: (list: TrainingList) => void;
  currentListId: string;
  customLists: TrainingList[];
}

export default function ListBrowser({ show, onUseList, currentListId, customLists }: ListBrowserProps) {
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  if (!show) return null;

  const handleUseList = async (list: TrainingList) => {
    setLoadingListId(list.id);

    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    onUseList(list);
    setLoadingListId(null);
  };

  const getTotalItems = (list: TrainingList) => {
    return Object.values(list.categories).reduce((total, items) => total + items.length, 0);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Custom Lists Section */}
      {customLists.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Custom Lists</h2>
          <div className="space-y-3 mb-8">
            {customLists.map(list => {
              const isActive = list.id === currentListId;
              const isLoading = loadingListId === list.id;
              const totalItems = getTotalItems(list);

              return (
                <div key={list.id} className={`flex justify-between items-center p-4 border rounded-lg transition-colors ${
                  isActive ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-400'
                }`}>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{list.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-amber-700 font-medium">✨ Custom</span>
                      <span className="text-sm text-gray-400">• {totalItems} items</span>
                      <span className="text-sm text-gray-400">• {Object.keys(list.categories).length} categories</span>
                    </div>

                    {/* Preview categories */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.keys(list.categories).slice(0, 3).map(category => (
                        <span key={category} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                      {Object.keys(list.categories).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{Object.keys(list.categories).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {isActive ? (
                      <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                        <Check size={16} />
                        Active
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUseList(list)}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Use This List
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Community Lists Section */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Lists</h2>
      <div className="space-y-3">
        {communityLists.map(list => {
          const isActive = list.id === currentListId;
          const isLoading = loadingListId === list.id;
          const totalItems = getTotalItems(list);

          return (
            <div key={list.id} className={`flex justify-between items-center p-4 border rounded-lg transition-colors ${
              isActive ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-400'
            }`}>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{list.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">by {list.creator}</span>
                  <span className="text-sm text-gray-400">• {totalItems} items</span>
                  <span className="text-sm text-gray-400">• {Object.keys(list.categories).length} categories</span>
                </div>

                {/* Preview categories */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.keys(list.categories).slice(0, 3).map(category => (
                    <span key={category} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {category}
                    </span>
                  ))}
                  {Object.keys(list.categories).length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{Object.keys(list.categories).length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {isActive ? (
                  <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                    <Check size={16} />
                    Active
                  </div>
                ) : (
                  <button
                    onClick={() => handleUseList(list)}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Use This List
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> Community lists are curated by experienced artists to help you practice specific skills and subjects systematically.
        </p>
      </div>
    </div>
  );
}