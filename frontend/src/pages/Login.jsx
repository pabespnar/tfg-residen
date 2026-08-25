import './Login.css'
import logoapp from '../assets/logo_app.png'
import { useState } from 'react'
import axios from 'axios'

function Login({ setAutenticado }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')  
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const iniciarSesion = async (e) => {
        e.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/token/',
                {
                    email: email,
                    password: password,
                }
            )

            localStorage.setItem('access', response.data.access)
            localStorage.setItem('refresh', response.data.refresh)

            setAutenticado(true)

        } catch (error) {

            if (error.response?.status === 401) {
                setError('El correo electrónico o la contraseña no son correctos')
            } else {
                setError('No se ha podido conectar con el servidor')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">

            <div className="login-card">

                <img
                    src={logoapp}
                    alt="Logo App"
                    className="logo-app"
                />

                <p className="aditional-info">
                    Por favor, introduzca sus credenciales. Si no posee una cuenta
                    de inicio de sesión, contacte con el administrador del sistema.
                </p>

                <form onSubmit={iniciarSesion}>

                    <div className="login-field">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && 
                    <p className="login-error">
                        {error}
                    </p>
                    }

                    <button type="submit" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>

                </form>

            </div>

        </div>
    )
}

export default Login