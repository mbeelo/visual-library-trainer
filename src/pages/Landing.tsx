import { useState, useEffect } from 'react'
import { ArrowRight, Play, Sparkles, Brain, Eye, Target, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Landing() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const testimonials = [
    {
      text: "AfterImage transformed how I see and remember. My drawing confidence skyrocketed in weeks.",
      author: "Sarah Chen",
      role: "Digital Artist"
    },
    {
      text: "The visual memory training is incredible. I can recall details I never noticed before.",
      author: "Marcus Williams",
      role: "Art Student"
    },
    {
      text: "This isn't just practice - it's rewiring how your brain processes visual information.",
      author: "Dr. Elena Rodriguez",
      role: "Art Educator"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              AfterImage
            </span>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="bg-gradient-to-r from-orange-400 to-amber-500 text-slate-900 px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Start Training
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Train Your Visual Mind</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              The Art of
              <span className="block bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 bg-clip-text text-transparent animate-pulse">
                Seeing Twice
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Master the art of visual memory. Draw from imagination.
              Build an <span className="text-orange-400 font-semibold">unshakeable visual library</span> that transforms your artistic ability forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="group bg-gradient-to-r from-orange-400 to-amber-500 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <span className="text-slate-400 text-sm">Free • No signup required</span>
            </div>

            {/* Floating Elements */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-3xl transform scale-150 animate-pulse"></div>
              <div className="relative bg-slate-800/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-orange-400">100+</div>
                    <div className="text-slate-400 text-sm">Drawing Subjects</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400">∞</div>
                    <div className="text-slate-400 text-sm">Practice Sessions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-400">24/7</div>
                    <div className="text-slate-400 text-sm">Brain Training</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-orange-400" />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-orange-400">How</span> It Works
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Simple. Powerful. Scientifically designed to build lasting visual memory.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-400">1. Challenge</h3>
              <p className="text-slate-300 leading-relaxed">
                Draw a random subject from memory. No references, just your mind's eye and imagination.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-400">2. Study</h3>
              <p className="text-slate-300 leading-relaxed">
                Compare with curated references. See what you missed, what you nailed, and what to focus on.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-400">3. Evolve</h3>
              <p className="text-slate-300 leading-relaxed">
                Rate your performance. Our algorithm adapts, ensuring you practice what challenges you most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">
            What <span className="text-orange-400">Artists</span> Are Saying
          </h2>

          <div className="relative h-48 flex items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentTestimonial
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <blockquote className="text-2xl md:text-3xl font-light text-slate-200 mb-8 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="text-orange-400 font-semibold">
                  {testimonial.author}
                </div>
                <div className="text-slate-400 text-sm">
                  {testimonial.role}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-orange-400'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to See
            <span className="block text-orange-400">Differently?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands of artists building unbreakable visual memory.
            Start your transformation today - completely free.
          </p>

          <button
            onClick={() => navigate('/app/dashboard')}
            className="group bg-gradient-to-r from-orange-400 to-amber-500 text-slate-900 px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            <span>Begin Training Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-slate-400 text-sm mt-6">
            Progress lives in what you almost got right.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              AfterImage
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2024 AfterImage. The art of seeing twice.
          </p>
        </div>
      </footer>
    </div>
  )
}