import { useEffect, useState } from 'react'
import axios from 'axios'
import './EditarPerfil.css'

function EditarPerfil() {
    const [usuario, setUsuario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        dni: '',
    })

    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')
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
            console.error('Error al obtener los datos del usuario:', error)
            setError('No se han podido cargar los datos del usuario.')
        })
    }, [])

    const handleChange = (e) => {
        setUsuario({
            ...usuario,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const token = localStorage.getItem('access')

        setGuardando(true)
        setMensaje('')
        setError('')

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

            setMensaje('Datos actualizados correctamente.')
        })
        .catch((error) => {
            console.error('Error al actualizar el perfil:', error)

            if (error.response?.data) {
                setError('No se han podido actualizar los datos.')
            } else {
                setError('Error al conectar con el servidor.')
            }
        })
        .finally(() => {
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
                    <h1>Editar datos de usuario</h1>

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
                                value={usuario.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="editar-field">
                            <label htmlFor="apellido">
                                Apellido
                            </label>

                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                value={usuario.apellido}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="editar-field">
                            <label htmlFor="email">
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={usuario.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="editar-field">
                            <label htmlFor="telefono">
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                name="telefono"
                                type="text"
                                value={usuario.telefono}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="editar-field">
                            <label htmlFor="dni">
                                DNI
                            </label>

                            <input
                                id="dni"
                                name="dni"
                                type="text"
                                value={usuario.dni}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {mensaje && (
                        <p className="editar-mensaje">
                            {mensaje}
                        </p>
                    )}

                    {error && (
                        <p className="editar-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="editar-boton"
                        disabled={guardando}
                    >
                        {guardando
                            ? 'Guardando...'
                            : 'Confirmar cambios'}
                    </button>

                </form>

            </div>

        </div>
    )
}

export default EditarPerfil