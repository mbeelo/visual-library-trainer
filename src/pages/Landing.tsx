import { useNavigate } from 'react-router-dom'
import Welcome from '../components/Welcome'

export function Landing() {
  const navigate = useNavigate()

  const handleStartPractice = () => {
    navigate('/dashboard')
  }

  return <Welcome onStartPractice={handleStartPractice} />
}