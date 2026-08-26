import { useEffect, useState } from 'react'
import axios from 'axios'
import './EditarPerfil.css'
import { useNavigate } from 'react-router-dom'

function EditarPerfil() {
    const [usuario, setUsuario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        dni: '',
    })
    const navigate = useNavigate()

    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            'http://127.0.0.1:8000/api/usuarios/datosperfil/',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setUsuario({
                nombre: response.data.nombre || '',
                apellido: response.data.apellido || '',
                email: response.data.email || '',
                telefono: response.data.telefono || '',
                dni: response.data.dni || '',
            })
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos del usuario:',
                error
            )
        })
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setUsuario({
            ...usuario,
            [name]: value,
        })

        setErrores({
            ...errores,
            [name]: '',
        })

        setMensaje('')
    }

    const validarFormulario = () => {
        const nuevosErrores = {}

        if (!usuario.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre no puede estar vacío.'
        } else if (usuario.nombre.length > 100) {
            nuevosErrores.nombre =
                'El nombre no puede superar los 100 caracteres.'
        }

        if (!usuario.apellido.trim()) {
            nuevosErrores.apellido =
                'El apellido no puede estar vacío.'
        } else if (usuario.apellido.length > 100) {
            nuevosErrores.apellido =
                'El apellido no puede superar los 100 caracteres.'
        }

        if (!usuario.email.trim()) {
            nuevosErrores.email =
                'El correo electrónico no puede estar vacío.'
        } else if (usuario.email.length > 254) {
            nuevosErrores.email =
                'El correo electrónico es demasiado largo.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
            nuevosErrores.email =
                'Introduce un correo electrónico válido.'
        }

        if (!usuario.telefono.trim()) {
            nuevosErrores.telefono =
                'El teléfono no puede estar vacío.'
        } else if (!/^\d{9}$/.test(usuario.telefono)) {
            nuevosErrores.telefono =
                'El teléfono debe tener 9 dígitos numéricos.'
        }

        if (!usuario.dni.trim()) {
            nuevosErrores.dni = 'El DNI no puede estar vacío.'
        } else if (!/^\d{8}[A-Za-z]$/.test(usuario.dni)) {
            nuevosErrores.dni =
                'El DNI debe tener 8 dígitos y una letra.'
        }

        setErrores(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        setMensaje('')

        if (!validarFormulario()) {
            return
        }

        const token = localStorage.getItem('access')

        setGuardando(true)

        axios.patch(
            'http://127.0.0.1:8000/api/usuarios/actualizarperfil/',
            usuario,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setUsuario({
                nombre: response.data.nombre || '',
                apellido: response.data.apellido || '',
                email: response.data.email || '',
                telefono: response.data.telefono || '',
                dni: response.data.dni || '',
            })

            setErrores({})
            setMensaje('Datos actualizados correctamente.')

            setTimeout(() => {
                navigate('/perfil')
            }, 1500)
        })
        .catch((error) => {
            console.error(
                'Error al actualizar el perfil:',
                error
            )

            if (error.response) {
                console.error(
                    'Respuesta del backend:',
                    error.response.data
                )

                console.error(
                    'Código de error:',
                    error.response.status
                )

                setMensaje(
                    'No se han podido actualizar los datos.'
                )
            } else {
                console.error(
                    'Error al conectar con el servidor.'
                )

                setMensaje(
                    'Error al conectar con el servidor.'
                )
            }
            setGuardando(false)
        })
    }

    return (
        <div className="editar-container">

            <div className="editar-header">

                <div className="editar-avatar">
                    <span>
                        {usuario.nombre?.charAt(0)}
                        {usuario.apellido?.charAt(0)}
                    </span>
                </div>

                <div className="editar-header-info">

                    <h1>
                        Editar datos de usuario
                    </h1>

                    <span className="editar-rol">
                        Gestor de usuario
                    </span>

                </div>

            </div>

            <div className="editar-card">

                <h2>Información personal</h2>

                <form onSubmit={handleSubmit}>

                    <div className="editar-grid">

                        <div className="editar-field">

                            <label htmlFor="nombre">
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                maxLength={100}
                                value={usuario.nombre}
                                onChange={handleChange}
                            />

                            {errores.nombre && (
                                <span className="editar-error">
                                    {errores.nombre}
                                </span>
                            )}

                        </div>

                        <div className="editar-field">

                            <label htmlFor="apellido">
                                Apellido
                            </label>

                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                maxLength={100}
                                value={usuario.apellido}
                                onChange={handleChange}
                            />

                            {errores.apellido && (
                                <span className="editar-error">
                                    {errores.apellido}
                                </span>
                            )}

                        </div>

                        <div className="editar-field">

                            <label htmlFor="email">
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                maxLength={254}
                                value={usuario.email}
                                onChange={handleChange}
                            />

                            {errores.email && (
                                <span className="editar-error">
                                    {errores.email}
                                </span>
                            )}

                        </div>

                        <div className="editar-field">

                            <label htmlFor="telefono">
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                name="telefono"
                                type="text"
                                maxLength={9}
                                value={usuario.telefono}
                                onChange={handleChange}
                            />

                            {errores.telefono && (
                                <span className="editar-error">
                                    {errores.telefono}
                                </span>
                            )}

                        </div>

                        <div className="editar-field">

                            <label htmlFor="dni">
                                DNI
                            </label>

                            <input
                                id="dni"
                                name="dni"
                                type="text"
                                maxLength={9}
                                value={usuario.dni}
                                onChange={handleChange}
                            />

                            {errores.dni && (
                                <span className="editar-error">
                                    {errores.dni}
                                </span>
                            )}

                        </div>

                    </div>

                    {mensaje && (
                        <p className="editar-mensaje">
                            {mensaje}
                        </p>
                    )}
                {!guardando && (
                    <button
                        type="submit"
                        className="editar-boton"
                    >
                        Confirmar cambios
                    </button>
                )}
                </form>

            </div>

        </div>
    )
}

export default EditarPerfil