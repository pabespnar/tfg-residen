import { useState } from 'react'
import './CambiarContrasena.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function CambiarContrasena() {

    const [contrasenaActual, setContrasenaActual] = useState('')
    const [nuevaContrasena, setNuevaContrasena] = useState('')
    const [confirmarContrasena, setConfirmarContrasena] = useState('')

    const [mostrarActual, setMostrarActual] = useState(false)
    const [mostrarNueva, setMostrarNueva] = useState(false)
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

    const navigate = useNavigate()

    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [actualizado, setActualizado] = useState(false)

    const handleSubmit = (e) => {

        e.preventDefault()

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

        else if (contrasenaActual === nuevaContrasena) {
            nuevosErrores.nuevaContrasena =
                'La nueva contraseña no puede ser igual a la contraseña actual.'
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
            '/api/usuarios/cambiarcontrasena/',
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

            setGuardando(false)
            setActualizado(true)

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

                        <div className="cambiar-contrasena-input">

                            <input
                                id="contrasenaActual"
                                type={mostrarActual ? 'text' : 'password'}
                                value={contrasenaActual}
                                onChange={(e) =>
                                    setContrasenaActual(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="cambiar-contrasena-ojo"
                                onClick={() =>
                                    setMostrarActual(!mostrarActual)
                                }
                                aria-label={
                                    mostrarActual
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                            >
                                {mostrarActual
                                    ? <FaEyeSlash />
                                    : <FaEye />
                                }
                            </button>

                        </div>

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

                        <div className="cambiar-contrasena-input">

                            <input
                                id="nuevaContrasena"
                                type={mostrarNueva ? 'text' : 'password'}
                                value={nuevaContrasena}
                                onChange={(e) =>
                                    setNuevaContrasena(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="cambiar-contrasena-ojo"
                                onClick={() =>
                                    setMostrarNueva(!mostrarNueva)
                                }
                                aria-label={
                                    mostrarNueva
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                            >
                                {mostrarNueva
                                    ? <FaEyeSlash />
                                    : <FaEye />
                                }
                            </button>

                        </div>

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

                        <div className="cambiar-contrasena-input">

                            <input
                                id="confirmarContrasena"
                                type={
                                    mostrarConfirmar
                                        ? 'text'
                                        : 'password'
                                }
                                value={confirmarContrasena}
                                onChange={(e) =>
                                    setConfirmarContrasena(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="cambiar-contrasena-ojo"
                                onClick={() =>
                                    setMostrarConfirmar(!mostrarConfirmar)
                                }
                                aria-label={
                                    mostrarConfirmar
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                            >
                                {mostrarConfirmar
                                    ? <FaEyeSlash />
                                    : <FaEye />
                                }
                            </button>

                        </div>

                        {errores.confirmarContrasena && (
                            <span className="cambiar-contrasena-error">
                                {errores.confirmarContrasena}
                            </span>
                        )}

                    </div>

                    {mensaje && (
                        <p className="cambiar-contrasena-mensaje">
                            {mensaje}
                        </p>
                    )}

                    {!actualizado && (
                        <div className="cambiar-contrasena-botones">

                            <button
                                type="button"
                                className="cambiar-contrasena-cancelar"
                                onClick={() => navigate('/perfil')}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="cambiar-contrasena-confirmar"
                                disabled={guardando}
                            >
                                {guardando
                                    ? 'Guardando...'
                                    : 'Cambiar contraseña'}
                            </button>

                        </div>
                    )}

                </form>

            </div>

        </div>
    )
}

export default CambiarContrasena