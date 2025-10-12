import {
  Eye,
  Search,
  Filter,
  BookOpen,
  Trophy,
  ImageIcon,
  Plus
} from 'lucide-react';
import { HistoryEntry, ItemRatings, TrainingAlgorithm, TrainingList } from '../types';
import { SimpleImageService } from '../services/simpleImageService';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface DashboardProps {
  algorithmMode: boolean;
  setAlgorithmMode: (mode: boolean) => void;
  generateChallenge: () => void;
  history: HistoryEntry[];
  itemRatings: ItemRatings;
  timer: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedAlgorithm: TrainingAlgorithm;
  trainingAlgorithms: TrainingAlgorithm[];
  onAlgorithmChange: (algorithm: TrainingAlgorithm) => void;
  activeList: TrainingList;
  onPracticeSubject?: (subject: string, category: string) => void;
}

interface SubjectData {
  name: string;
  category: string;
  referenceCount: number;
  memoryStrength: number; // 0-5 based on ratings
  recentImages: string[]; // URLs of recent reference images
  lastPracticed?: Date;
}

export default function Dashboard({
  generateChallenge,
  history,
  itemRatings,
  activeList,
  onPracticeSubject
}: DashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load subject data with reference counts (bulk optimized)
  useEffect(() => {
    const loadSubjectData = async () => {
      if (!activeList) {
        console.log('👤 No activeList provided');
        setLoading(false);
        return;
      }

      // Wait for auth to complete before loading user data
      if (authLoading) {
        console.log('⏳ Waiting for auth to complete...');
        return;
      }

      if (!user) {
        console.log('👤 No user - cannot load images');
        setLoading(false);
        return;
      }

      console.log('📚 Loading subject data for list:', activeList.name, 'with', Object.keys(activeList.categories).length, 'categories');
      setLoading(true);
      const subjects: SubjectData[] = [];

      try {
        // 🚀 BULK LOAD: Get all user images at once
        const allUserImages = await SimpleImageService.getAllUserImages(user.id);
        console.log('📸 Bulk loaded images for', Object.keys(allUserImages).length, 'subjects');

        // Flatten all subjects from the active list
        for (const [category, items] of Object.entries(activeList.categories)) {
          for (const item of items) {
            // Get images for this subject from bulk data (no database call!)
            const images = allUserImages[item] || [];

            // Calculate memory strength from ratings (0-5 scale)
            const rating = itemRatings[item];
            const memoryStrength = rating === 'easy' ? 5 :
                                 rating === 'got-it' ? 3 :
                                 rating === 'struggled' ? 2 :
                                 rating === 'failed' ? 1 : 0;

            // Get recent image URLs (first 3 for preview)
            const recentImages = images.slice(0, 3).map(img => img.image_url);

            // Find last practice date (use current history at time of execution)
            const lastSession = history.find(h => h.item === item);
            const lastPracticed = lastSession ? new Date(lastSession.date) : undefined;

            subjects.push({
              name: item,
              category,
              referenceCount: images.length,
              memoryStrength,
              recentImages,
              lastPracticed
            });
          }
        }

        console.log('✅ Subject data loaded:', subjects.length, 'subjects from bulk data');
      } catch (error) {
        console.error('💥 Error in bulk loading subject data:', error);
        // Fallback: create subjects with default values
        for (const [category, items] of Object.entries(activeList.categories)) {
          for (const item of items) {
            const rating = itemRatings[item];
            const memoryStrength = rating === 'easy' ? 5 :
                                 rating === 'got-it' ? 3 :
                                 rating === 'struggled' ? 2 :
                                 rating === 'failed' ? 1 : 0;

            const lastSession = history.find(h => h.item === item);
            const lastPracticed = lastSession ? new Date(lastSession.date) : undefined;

            subjects.push({
              name: item,
              category,
              referenceCount: 0,
              memoryStrength,
              recentImages: [],
              lastPracticed
            });
          }
        }
      }

      setSubjectData(subjects);
      setLoading(false);
    };

    loadSubjectData();
  }, [authLoading, user?.id, activeList?.name, itemRatings]); // Include authLoading to wait for auth completion

  // Filter subjects based on search and category
  const filteredSubjects = subjectData.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate library stats
  const totalSubjects = subjectData.length;
  const totalReferences = subjectData.reduce((sum, s) => sum + s.referenceCount, 0);
  const masteredSubjects = subjectData.filter(s => s.memoryStrength >= 4).length;
  const categories = Object.keys(activeList?.categories || {});


  return (
    <div className="space-y-6">
      {/* Hero Header - Visual Memory Palace */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold text-white animate-fade-in">
                {activeList.name}
              </h1>
              <p className="text-orange-400 font-medium">The art of seeing twice</p>
            </div>
            <p className="text-slate-300 max-w-2xl">
              Browse your growing collection, then <strong className="text-orange-400">trust your mind's eye first</strong>.
              Each reference validates what your memory already knows.
            </p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-white">{totalSubjects}</span>
                <span className="text-slate-300">subjects</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-white">{totalReferences}</span>
                <span className="text-slate-300">references</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-white">{masteredSubjects}</span>
                <span className="text-slate-300">mastered</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <button
              onClick={generateChallenge}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 inline-flex items-center gap-3 relative"
            >
              <div className="text-lg">
                Start Drawing
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your visual library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          {filteredSubjects.length} of {totalSubjects} subjects
        </div>
      </div>

      {/* Visual Library Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-sm animate-pulse">
              <div className="w-full h-32 bg-slate-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No subjects found</h3>
          <p className="text-slate-300 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Your visual library is waiting to be built'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <button
              onClick={generateChallenge}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/25"
            >
              <Eye className="w-5 h-5" />
              Start Building Your Library
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.name}
              subject={subject}
              onPractice={() => {
                if (onPracticeSubject) {
                  onPracticeSubject(subject.name, subject.category)
                } else {
                  generateChallenge()
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Philosophy Footer */}
      <div className="text-center py-8 border-t border-orange-500/20">
        <p className="text-slate-300 max-w-2xl mx-auto">
          <strong className="text-orange-400">Remember:</strong> Your mind already knows more than you realize.
          Draw from memory first, then let your references validate and enrich what you've conjured.
          <br />
          <span className="text-sm italic text-orange-400">The art of seeing twice</span>
        </p>
      </div>
    </div>
  );
}

// Subject Card Component
function SubjectCard({ subject, onPractice }: { subject: SubjectData; onPractice: () => void }) {
  const getMemoryStrengthColor = (strength: number) => {
    if (strength >= 4) return 'bg-green-500';
    if (strength >= 3) return 'bg-yellow-500';
    if (strength >= 1) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const getMemoryStrengthText = (strength: number) => {
    if (strength >= 4) return 'Strong Memory';
    if (strength >= 3) return 'Growing Memory';
    if (strength >= 1) return 'Weak Memory';
    return 'Untested';
  };

  const getReferenceStrengthInfo = (count: number) => {
    if (count === 0) return { text: 'No References', color: 'text-slate-400 bg-slate-700 border-slate-600' };
    if (count < 3) return { text: `${count} Reference${count === 1 ? '' : 's'}`, color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
    if (count < 5) return { text: `${count} References`, color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
    return { text: `${count} References`, color: 'text-green-400 bg-green-500/20 border-green-500/30' };
  };

  const referenceInfo = getReferenceStrengthInfo(subject.referenceCount);

  return (
    <div className="bg-slate-800 border border-orange-500/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 group">
      {/* Reference Preview Area */}
      <div className="aspect-square bg-slate-700 relative overflow-hidden">
        {subject.recentImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 p-2 h-full">
            {subject.recentImages.slice(0, 4).map((url, idx) => (
              <div key={idx} className="bg-slate-600 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {subject.recentImages.length < 4 && [...Array(4 - subject.recentImages.length)].map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300">No references yet</p>
            </div>
          </div>
        )}

        {/* Memory Strength Indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${getMemoryStrengthColor(subject.memoryStrength)}`}></div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white mb-1">{subject.name}</h3>
          <p className="text-xs text-slate-400">{subject.category}</p>
        </div>

        <div className="space-y-2">
          {/* Reference Count */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${referenceInfo.color}`}>
            {referenceInfo.text}
          </div>

          {/* Memory Strength */}
          <div className="text-xs text-slate-300">
            Memory: {getMemoryStrengthText(subject.memoryStrength)}
          </div>
        </div>

        {/* Practice Button */}
        <button
          onClick={onPractice}
          className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium py-2 px-4 rounded-lg transition-all transform group-hover:scale-105 flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:shadow-orange-500/25 relative"
        >
          <Eye className="w-4 h-4" />
          Draw Blind First
        </button>
      </div>
    </div>
  );
}