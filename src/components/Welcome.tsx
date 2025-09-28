import { useState } from 'react';
import { Brain, Pencil, Eye, CheckCircle, Zap, Users, ArrowRight, Play, Target } from 'lucide-react';

interface WelcomeProps {
  onStartPractice: () => void;
}

export default function Welcome({ onStartPractice }: WelcomeProps) {
  const [onboardingStep, setOnboardingStep] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto pt-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Visual Library Trainer</h1>
          <p className="text-xl text-gray-600 mb-8">Build muscle memory. Draw anything from recall.</p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Trusted by artists</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Memory-based training</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Proven method</span>
            </div>
          </div>
        </div>

        {onboardingStep === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">The Problem</h2>
              </div>
              <p className="text-gray-700 text-lg mb-6">
                Most artists struggle to draw things from imagination because they haven't built a strong visual library.
                You can copy references perfectly, but when you close your eyes... nothing.
              </p>
            </div>

            <div className="p-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Professional Secret</h3>
                    <p className="text-blue-800">
                      Master artists can draw hundreds of subjects from memory because they've systematically trained their visual recall through deliberate practice.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOnboardingStep(1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
              >
                <span className="text-lg">Learn the Method</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {onboardingStep === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">The Method (3 Steps)</h2>
              </div>
              <p className="text-gray-600">A systematic approach to building visual memory</p>
            </div>

            <div className="p-8">
              <div className="space-y-8 mb-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Draw from Memory</h3>
                    <p className="text-gray-600">Get a random subject. Close all references. Draw it entirely from recall. Struggle is part of the process.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Study References</h3>
                    <p className="text-gray-600">Compare your drawing with high-quality references. Notice what you missed, got wrong, or remembered correctly.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Build Your Library</h3>
                    <p className="text-gray-600">Rate your performance. The algorithm will show you struggling subjects more often until they stick.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOnboardingStep(0)}
                  className="py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <span>See Features</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="space-y-6">
            {/* Features Grid */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Powerful Features</h2>
                </div>
                <p className="text-gray-600">Everything you need to build a strong visual library</p>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Smart Algorithm</h3>
                        <p className="text-sm text-gray-600">Adapts to show you subjects you struggle with more frequently</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Progress Tracking</h3>
                        <p className="text-sm text-gray-600">See your improvement over time with detailed statistics</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Timer & Focus</h3>
                        <p className="text-sm text-gray-600">Configurable timers to build speed and focus</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Reference Integration</h3>
                        <p className="text-sm text-gray-600">Direct links to Pinterest, ArtStation, and Google Images</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Community Lists</h3>
                        <p className="text-sm text-gray-600">Curated subject lists from the art community</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Custom Lists</h3>
                        <p className="text-sm text-gray-600">Create your own practice lists for specific goals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Build Your Visual Library?</h3>
                <p className="text-gray-600 mb-8 text-lg">Join thousands of artists improving their memory drawing skills</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Method
                  </button>
                  <button
                    onClick={onStartPractice}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    <span className="text-lg">Start Training Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}