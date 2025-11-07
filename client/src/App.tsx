import { useEffect, useState } from 'react'
import { api } from './services/api'

function App() {
  const [serverStatus, setServerStatus] = useState<string>('Checking...')

  useEffect(() => {
    api.health()
      .then(data => setServerStatus(`✓ ${data.message}`))
      .catch(() => setServerStatus('✗ Server not responding'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sprint Manager
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Sprint Velocity Predictor
          </p>
          <div className="inline-block px-4 py-2 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-700">
              Server: <span className="font-semibold">{serverStatus}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
