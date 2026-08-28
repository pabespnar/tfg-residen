import { useState } from 'react'
import axios from 'axios'
import './RestablecerContrasena.css'
import { useNavigate, useParams } from 'react-router-dom'

function RestablecerContrasena() {
    const [nuevaContrasena, setNuevaContrasena] = useState('')
    const [repetirContrasena, setRepetirContrasena] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [mostrarContrasena, setMostrarContrasena] = useState(false)
    const [mostrarRepetir, setMostrarRepetir] = useState(false)

    const navigate = useNavigate()
    const { uid, token } = useParams()

    const handleSubmit = (e) => {
        e.preventDefault()

        setError('')
        setMensaje('')

        if (!nuevaContrasena) {
            setError('La nueva contraseña es obligatoria.')
            return
        }

        if (nuevaContrasena.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.')
            return
        }

        if (nuevaContrasena !== repetirContrasena) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setEnviando(true)

        axios.post(
            `http://127.0.0.1:8000/api/usuarios/restablecercontrasena/${uid}/${token}/`,
            {
                nueva_contrasena: nuevaContrasena,
            }
        )
        .then(() => {
            setMensaje('Contraseña actualizada correctamente.')

            setTimeout(() => {
                navigate('/login')
            }, 1500)
        })
        .catch((error) => {
            console.error('Error al restablecer la contraseña:', error)

            if (error.response?.data?.error) {
                setError(error.response.data.error)
            } else if (error.response?.data?.nueva_contrasena) {
                setError(error.response.data.nueva_contrasena)
            } else {
                setError('No se ha podido restablecer la contraseña.')
            }
        })
        .finally(() => {
            setEnviando(false)
        })
    }

    return (
        <div className="restablecer-container">

            <div className="restablecer-card">

                <h1>Restablecer contraseña</h1>

                <p className="restablecer-descripcion">
                    Introduce tu nueva contraseña para recuperar el acceso a tu cuenta.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="restablecer-field">

                        <label htmlFor="nueva_contrasena">
                            Nueva contraseña
                        </label>

                        <div className="restablecer-input">

                            <input
                                id="nueva_contrasena"
                                name="nueva_contrasena"
                                type={mostrarContrasena ? 'text' : 'password'}
                                value={nuevaContrasena}
                                onChange={(e) => {
                                    setNuevaContrasena(e.target.value)
                                    setError('')
                                    setMensaje('')
                                }}
                            />

                            <button
                                type="button"
                                className="restablecer-ojo"
                                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                            >
                                {mostrarContrasena ? 'Ocultar' : 'Ver'}
                            </button>

                        </div>

                    </div>

                    <div className="restablecer-field">

                        <label htmlFor="repetir_contrasena">
                            Repetir contraseña
                        </label>

                        <div className="restablecer-input">

                            <input
                                id="repetir_contrasena"
                                name="repetir_contrasena"
                                type={mostrarRepetir ? 'text' : 'password'}
                                value={repetirContrasena}
                                onChange={(e) => {
                                    setRepetirContrasena(e.target.value)
                                    setError('')
                                    setMensaje('')
                                }}
                            />

                            <button
                                type="button"
                                className="restablecer-ojo"
                                onClick={() => setMostrarRepetir(!mostrarRepetir)}
                            >
                                {mostrarRepetir ? 'Ocultar' : 'Ver'}
                            </button>

                        </div>

                    </div>

                    {error && (
                        <p className="restablecer-error">
                            {error}
                        </p>
                    )}

                    {mensaje && (
                        <p className="restablecer-mensaje">
                            {mensaje}
                        </p>
                    )}

                    <div className="restablecer-botones">


                        <button
                            type="submit"
                            className="restablecer-confirmar"
                            disabled={enviando}
                        >
                            {enviando ? 'Guardando...' : 'Confirmar contraseña'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default RestablecerContrasena