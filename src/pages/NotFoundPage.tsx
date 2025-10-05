import { useNavigate } from 'react-router-dom'
import { NotFoundError } from '../components/ErrorState'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <NotFoundError
        onGoBack={() => navigate(-1)}
        onGoHome={() => navigate('/app/dashboard')}
      />
    </div>
  )
}