import { useEffect, useState } from 'react'
import axios from 'axios'
import './Perfil.css'
import { FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function Perfil() {
    const [usuario, setUsuario] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get('/api/usuarios/datosperfil/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            setUsuario(response.data)
        })
        .catch((error) => {
            console.error('Error al obtener el perfil:', error)
        })
    }, [])

    if (!usuario) {
        return (
            <div className="perfil-loading">
                <h1>Cargando perfil...</h1>
            </div>
        )
    }

    return (
        <div className="perfil-container">

            <div className="perfil-header">
                <div className="perfil-avatar">
                    {usuario.imagen_perfil ? (
                        <img
                            src={usuario.imagen_perfil}
                            alt="Foto de perfil"
                        />
                    ) : (
                        <span>
                            {usuario.nombre?.charAt(0)}
                            {usuario.apellido?.charAt(0)}
                        </span>
                    )}
                </div>

                <div className="perfil-header-info">
                    <h1>
                        {usuario.nombre} {usuario.apellido}

                        <button
                            className="perfil-editar-icono"
                            onClick={() => navigate('/editar-perfil')}
                            title="Editar perfil"
                        >
                            <FiEdit2 />
                        </button>
                    </h1>

                    <span className="perfil-rol">
                        Gestor de {usuario.rol}
                    </span>
                </div>
            </div>

            <div className="perfil-card">
                <h2>Información personal</h2>

                <div className="perfil-grid">

                    <div className="perfil-field">
                        <span className="perfil-label">Nombre</span>
                        <span className="perfil-value">
                            {usuario.nombre}
                        </span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-label">Apellido</span>
                        <span className="perfil-value">
                            {usuario.apellido}
                        </span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-label">Correo electrónico</span>
                        <span className="perfil-value">
                            {usuario.email}
                        </span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-label">Teléfono</span>
                        <span className="perfil-value">
                            {usuario.telefono || 'No especificado'}
                        </span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-label">DNI</span>
                        <span className="perfil-value">
                            {usuario.dni}
                        </span>
                    </div>

                    <div className="perfil-field">
                        <span className="perfil-label">Rol</span>
                        <span className="perfil-value">
                            Gestor de {usuario.rol}
                        </span>
                    </div>

                </div>
            </div>

            <div className="perfil-seguridad">
                <button
                    className="perfil-cambiar-contrasena"
                    onClick={() => navigate('/cambiar-contrasena')}
                >
                    Cambiar contraseña
                </button>
            </div>

        </div>
    )
}

export default Perfil