import { useState } from 'react'
import { MessageCircle, Bug, Mail, Send, CheckCircle, Lightbulb } from 'lucide-react'

export function ContactPage() {
  const [formType, setFormType] = useState<'support' | 'bug' | 'feature'>('support')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create mailto link
    const mailtoLink = `mailto:support@afterimage.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `From: ${email}\n\nType: ${formType === 'support' ? 'Support Request' : formType === 'bug' ? 'Bug Report' : 'Feature Request'}\n\n${message}`
    )}`

    window.location.href = mailtoLink
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Message Sent!</h1>
          <p className="text-slate-300">Your email client should have opened. Send the email to reach our team.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-400 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Contact & Support</h1>
            <p className="text-slate-300">Get help or report issues</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">What can we help you with?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormType('support')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  formType === 'support'
                    ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <MessageCircle className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Support Request</div>
                <div className="text-xs opacity-75">Get help using AfterImage</div>
              </button>
              <button
                type="button"
                onClick={() => setFormType('bug')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  formType === 'bug'
                    ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Bug className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Bug Report</div>
                <div className="text-xs opacity-75">Report a problem or issue</div>
              </button>
              <button
                type="button"
                onClick={() => setFormType('feature')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  formType === 'feature'
                    ? 'border-orange-400 bg-orange-400/10 text-orange-400'
                    : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Lightbulb className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Suggest a Feature</div>
                <div className="text-xs opacity-75">Share your ideas with us</div>
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={formType === 'support' ? 'How can we help you?' : formType === 'bug' ? 'Describe the bug briefly' : 'What feature would you like to see?'}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {formType === 'support' ? 'How can we help?' : formType === 'bug' ? 'Bug Details' : 'Feature Details'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                formType === 'support'
                  ? 'Describe what you need help with...'
                  : formType === 'bug'
                  ? 'What happened? What did you expect to happen? What steps led to this issue?'
                  : 'Describe the feature you\'d like to see. How would it improve your experience?'
              }
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </form>
      </div>

      {/* Quick Contact Info */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Direct Contact</h3>
        </div>
        <p className="text-slate-300 text-sm">
          You can also email us directly at{' '}
          <a
            href="mailto:support@afterimage.app"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            support@afterimage.app
          </a>
        </p>
      </div>
    </div>
  )
}