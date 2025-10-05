import { Target, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="bg-slate-900 text-white">

      {/* HERO - Above the Fold */}
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">

          {/* Brand */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-4xl font-bold text-orange-400">AfterImage</span>
          </div>

          {/* Core Value Prop */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
            Stop copying.
            <span className="block text-orange-400 animate-pulse [animation-duration:3s]">Start remembering.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Draw from memory first, then study curated references and build your personal visual library.
            Train your brain to recall details instead of just copying what you see.
          </p>

          {/* Main CTA */}
          <div className="mb-16">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 mx-auto shadow-2xl hover:shadow-orange-500/25 mb-4"
            >
              Start Drawing
            </button>
            <p className="text-slate-400 text-lg">
              Free • No signup • Start immediately
            </p>
          </div>

        </div>
      </div>

      {/* BELOW THE FOLD - Details for those who need more */}
      <div className="border-t border-slate-800">

        {/* Approach Transition */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center mb-32">
            <h2 className="text-4xl font-bold mb-6">The <span className="text-orange-400">AfterImage</span> Approach</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Traditional art study has you copying while looking at references.
              We flip that — draw from memory first, then study what you missed.
            </p>
          </div>

          {/* SaaS Feature Showcase */}
          <div className="max-w-7xl mx-auto space-y-32">

            {/* Feature 1: Create/Select Lists - Text Left, Screenshot Right */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6"><span className="text-orange-400">Create</span> or select a training list</h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Choose from curated collections like "Visual Basics" with 30+ subjects,
                  or create custom lists for exactly what you want to master. Track your progress
                  as you build visual memory for each category.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">100+ curated drawing subjects</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Create unlimited custom lists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Progress tracking for every subject</span>
                  </div>
                </div>
              </div>

              {/* Mock List Card Screenshot */}
              <div className="bg-slate-800 border border-orange-500/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-orange-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-xl text-white mb-2">Visual Basics</h3>
                      <p className="text-sm text-slate-300">Master the fundamentals of visual memory</p>
                    </div>
                    <span className="bg-orange-400 text-slate-900 px-2 py-1 rounded-lg text-xs font-medium">Curated</span>
                  </div>
                  <div className="text-xs text-slate-400">Created by AfterImage</div>
                </div>

                <div className="p-6 bg-slate-700/30">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">30</div>
                      <div className="text-xs text-slate-300">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">23</div>
                      <div className="text-xs text-slate-300">Mastered</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2 mb-4">
                    <div className="bg-orange-400 h-2 rounded-full w-1/4"></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Target className="w-3 h-3" />
                    <span>7 subjects need practice</span>
                  </div>
                </div>

                <div className="p-6 bg-slate-800">
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 border border-orange-400 text-orange-400 rounded-lg font-medium">
                      Explore
                    </button>
                    <button className="flex-1 bg-orange-400 text-slate-900 font-semibold py-3 px-4 rounded-lg">
                      Draw
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Drawing Phase - Text Right, Screenshot Left */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Mock Drawing Phase Screenshot */}
              <div className="bg-slate-800 border border-orange-500/20 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-orange-400 text-orange-400 bg-transparent mb-4">
                      Animals
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Draw <span className="text-orange-400">bicycle</span></h2>
                    <p className="text-slate-300">From memory only - no googling!</p>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="bg-slate-700 rounded-lg px-4 py-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <span className="text-white font-mono">05:23</span>
                    </div>
                  </div>


                  <div className="flex gap-3">
                    <button className="flex-1 bg-slate-700 text-white py-3 px-4 rounded-lg">Done Drawing</button>
                    <button className="px-4 py-3 border border-slate-600 text-slate-400 rounded-lg">Skip</button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-bold mb-6"><span className="text-orange-400">Draw</span> from memory first</h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  No cheating, no googling, no references. Just you and a blank canvas with a simple prompt.
                  You'll quickly discover what you actually remember vs. what you think you know.
                  The timer is optional - draw at your own pace.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Random prompts keep you challenged</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Optional timer for focused practice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">No pressure - draw at your own pace</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Reference Phase - Text Left, Screenshot Right */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6"><span className="text-orange-400">Study</span> references and <span className="text-orange-400">build</span> your visual library</h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Now see what you missed. Study curated references and save any images you find
                  to your personal collection. Rate how your drawing went so the app knows
                  which subjects to show you more often.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Curated reference sources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">Save images to personal boards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm font-bold">✓</span>
                    </div>
                    <span className="text-slate-300">App learns what you need to practice</span>
                  </div>
                </div>
              </div>

              {/* Mock Reference Phase Screenshot */}
              <div className="bg-slate-800/60 border border-slate-600/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                      <span className="text-slate-300">📚</span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-slate-200">Your Reference Library</h3>
                      <p className="text-xs text-slate-400">5 references saved for bicycle</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src="https://i.pinimg.com/736x/4b/d5/dc/4bd5dccf05f33ca56c324a7d25aadbdb.jpg"
                        alt="Bicycle reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src="https://i.pinimg.com/1200x/a3/26/7b/a3267bb2a82c9cdf89810954da4a280e.jpg"
                        alt="Bicycle reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
                      <span className="text-slate-500 text-sm">Add +</span>
                    </div>
                  </div>

                  <div className="bg-orange-400 border-2 border-orange-300 rounded-xl p-6">
                    <h4 className="text-slate-900 font-bold mb-4 text-center">How did your drawing turn out?</h4>
                    <div className="flex gap-2 justify-center">
                      <button className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">😊 Easy</button>
                      <button className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">👍 Good</button>
                      <button className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">😅 Struggled</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Final CTA with Social Proof */}
        <section className="py-24 px-6 bg-slate-800/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Stop depending on references</h2>
            <p className="text-xl text-slate-300 mb-12">
              Build the visual memory that lets you draw confidently from imagination.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-400 mb-2">Before</div>
                <p className="text-slate-300">"I can only draw what I'm looking at"</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-400 mb-2">After</div>
                <p className="text-slate-300">"I can draw anything I've studied from memory"</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-400 mb-2">Plus</div>
                <p className="text-slate-300">"I have a personal reference library for everything"</p>
              </div>
            </div>


            <button
              onClick={() => navigate('/app/dashboard')}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 mx-auto"
            >
              Start Drawing
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 text-center border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                AfterImage
              </span>
            </div>
            <div className="text-orange-400 text-sm mb-4">
              The art of seeing twice
            </div>
            <div className="flex items-center justify-center gap-6 text-slate-400 text-xs">
              <a href="/app/contact" className="hover:text-orange-400 transition-colors">
                Contact & Support
              </a>
              <a href="/terms" className="hover:text-orange-400 transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}