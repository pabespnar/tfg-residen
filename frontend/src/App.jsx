import { useState } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const testConnection = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/token/',
        {
          email: 'avexpinosa@gmail.com',
          password: 'abcd',
        }
      )

      setMessage('¡Conexión con Django funcionando!')
      setError('')

      console.log('Access token:', response.data.access)
      console.log('Refresh token:', response.data.refresh)
    } catch (error) {
      setError('No se ha podido conectar con el backend')
      setMessage('')
      console.error(error)
    }
  }

return (
    <div>
        <Navbar />

        <div className="main-container">
            <Sidebar />

            <main>
                <h1>Prueba de conexión</h1>

                <button onClick={testConnection}>
                    Conectar con Django
                </button>

                {message && <p>{message}</p>}
                {error && <p>{error}</p>}
            </main>
        </div>
    </div>
)
}

export default App