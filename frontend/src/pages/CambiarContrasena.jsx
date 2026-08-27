import { useState } from 'react'
import './CambiarContrasena.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function CambiarContrasena() {
    const [contrasenaActual, setContrasenaActual] = useState('')
    const [nuevaContrasena, setNuevaContrasena] = useState('')
    const [confirmarContrasena, setConfirmarContrasena] = useState('')

    const navigate = useNavigate()
    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')
    const [guardando, setGuardando] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('handleSubmit funciona')
        setErrores({})
        setMensaje('')

        const nuevosErrores = {}

        if (!contrasenaActual) {
            nuevosErrores.contrasenaActual =
                'La contraseña actual es obligatoria.'
        }

        if (!nuevaContrasena) {
            nuevosErrores.nuevaContrasena =
                'La nueva contraseña es obligatoria.'
        } else if (nuevaContrasena.length < 8) {
            nuevosErrores.nuevaContrasena =
                'La nueva contraseña debe tener al menos 8 caracteres.'
        }

        if (!confirmarContrasena) {
            nuevosErrores.confirmarContrasena =
                'Debes confirmar la nueva contraseña.'
        } else if (nuevaContrasena !== confirmarContrasena) {
            nuevosErrores.confirmarContrasena =
                'Las contraseñas no coinciden.'
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores)
            return
        }

        const token = localStorage.getItem('access')

        setGuardando(true)

        axios.patch(
            'http://127.0.0.1:8000/api/usuarios/cambiarcontrasena/',
            {
                contrasena_actual: contrasenaActual,
                nueva_contrasena: nuevaContrasena,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then(() => {
            setErrores({})
            setMensaje('Contraseña actualizada correctamente.')

            setContrasenaActual('')
            setNuevaContrasena('')
            setConfirmarContrasena('')

            setTimeout(() => {
                navigate('/perfil')
            }, 1500)
        })
        .catch((error) => {
            console.error(
                'Error al cambiar la contraseña:',
                error
            )

            if (error.response) {
                console.error(
                    'Respuesta del backend:',
                    error.response.data
                )

                const erroresBackend = error.response.data

                const nuevosErrores = {}

                if (erroresBackend.contrasena_actual) {
                    nuevosErrores.contrasenaActual =
                        erroresBackend.contrasena_actual
                }

                if (erroresBackend.nueva_contrasena) {
                    nuevosErrores.nuevaContrasena =
                        erroresBackend.nueva_contrasena
                }

                setErrores(nuevosErrores)
            } else {
                setMensaje(
                    'Error al conectar con el servidor.'
                )
            }

            setGuardando(false)
        })
    }

    return (
        <div className="cambiar-contrasena-container">
            <div className="cambiar-contrasena-card">

                <h1>Cambiar contraseña</h1>

                <p className="cambiar-contrasena-descripcion">
                    Introduce tu contraseña actual y establece una nueva.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="cambiar-contrasena-field">
                        <label htmlFor="contrasenaActual">
                            Contraseña actual
                        </label>

                        <input
                            id="contrasenaActual"
                            type="password"
                            value={contrasenaActual}
                            onChange={(e) =>
                                setContrasenaActual(e.target.value)
                            }
                        />

                        {errores.contrasenaActual && (
                            <span className="cambiar-contrasena-error">
                                {errores.contrasenaActual}
                            </span>
                        )}
                    </div>

                    <div className="cambiar-contrasena-field">
                        <label htmlFor="nuevaContrasena">
                            Nueva contraseña
                        </label>

                        <input
                            id="nuevaContrasena"
                            type="password"
                            value={nuevaContrasena}
                            onChange={(e) =>
                                setNuevaContrasena(e.target.value)
                            }
                        />
                        {errores.nuevaContrasena && (
                            <span className="cambiar-contrasena-error">
                                {errores.nuevaContrasena}
                            </span>
                        )}
                    </div>

                    <div className="cambiar-contrasena-field">
                        <label htmlFor="confirmarContrasena">
                            Confirmar nueva contraseña
                        </label>

                        <input
                            id="confirmarContrasena"
                            type="password"
                            value={confirmarContrasena}
                            onChange={(e) =>
                                setConfirmarContrasena(e.target.value)
                            }
                        />
                        {errores.confirmarContrasena && (
                            <span className="cambiar-contrasena-error">
                                {errores.confirmarContrasena}
                            </span>
                        )}
                    </div>

                    <div className="cambiar-contrasena-botones">

                        <button
                            type="button"
                            className="cambiar-contrasena-cancelar"
                            onClick={() => navigate('/perfil')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="cambiar-contrasena-confirmar"
                        >
                            Cambiar contraseña
                        </button>

                    </div>

                </form>

            </div>
        </div>
    )
}

export default CambiarContrasena