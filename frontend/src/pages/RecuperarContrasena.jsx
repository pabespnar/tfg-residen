import { useState } from 'react'
import axios from 'axios'
import './RecuperarContrasena.css'
import { useNavigate } from 'react-router-dom'

function RecuperarContrasena() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        setMensaje('')

        if (!email.trim()) {
            setError('El correo electrónico no puede estar vacío.')
            return
        }

        if (email.length > 254) {
            setError('El correo electrónico es demasiado largo.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Introduce un correo electrónico válido.')
            return
        }

        setEnviando(true)

        axios.post(
            'http://127.0.0.1:8000/api/usuarios/recuperarcontrasena/',
            { email }
        )
        .then(() => {
            setMensaje('Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.')
            setEmail('')
        })
        .catch((error) => {
            console.error('Error al recuperar la contraseña:', error)

            if (error.response) {
                console.error('Respuesta del backend:', error.response.data)
                console.error('Código de error:', error.response.status)
            }

            setError('No se ha podido procesar la solicitud. Inténtalo de nuevo.')
        })
        .finally(() => {
            setEnviando(false)
        })
    }

    return (
        <div className="recuperar-container">
            <div className="recuperar-card">
                <h1>Recuperar contraseña</h1>

                <p className="recuperar-descripcion">
                    Introduce tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="recuperar-field">
                        <label htmlFor="email">
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            maxLength={254}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                setError('')
                                setMensaje('')
                            }}
                        />

                        {error && (
                            <span className="recuperar-error">
                                {error}
                            </span>
                        )}
                    </div>

                    {mensaje && (
                        <p className="recuperar-mensaje">
                            {mensaje}
                        </p>
                    )}

                    <div className="recuperar-botones">
                        <button
                            type="button"
                            className="recuperar-cancelar"
                            onClick={() => navigate('/login')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="recuperar-confirmar"
                            disabled={enviando}
                        >
                            {enviando ? 'Enviando...' : 'Recuperar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RecuperarContrasena