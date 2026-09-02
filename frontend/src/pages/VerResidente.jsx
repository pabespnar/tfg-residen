import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import './VerResidente.css'

function VerResidente() {
    const [residente, setResidente] = useState(null)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            `http://127.0.0.1:8000/api/residentes/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            console.log(response.data.foto)
            setResidente(response.data)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos del residente:',
                error
            )

            if (error.response?.status === 404) {
                setError('El residente no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos del residente.'
                )
            }
        })
    }, [id])

    if (error) {
        return (
            <div className="ver-residente-error">
                <h1>{error}</h1>

                <button
                    onClick={() => navigate('/residentes')}
                >
                    Volver a residentes
                </button>
            </div>
        )
    }

    if (!residente) {
        return (
            <div className="ver-residente-loading">
                <h1>Cargando residente...</h1>
            </div>
        )
    }

    return (
        <div className="ver-residente-container">

            <div className="ver-residente-contenido">

                <div className="ver-residente-cabecera">

                    <div className="ver-residente-avatar">
                        {residente.foto ? (
                            <img
                                src={residente.foto}
                                alt="Foto del residente"
                            />
                        ) : (
                            <span>
                                {residente.nombre?.charAt(0)}
                                {residente.apellido?.charAt(0)}
                            </span>
                        )}
                    </div>

                    <div className="ver-residente-cabecera-info">

                        <h1>
                            {residente.nombre} {residente.apellido}
                        </h1>

                        <span
                            className={
                                residente.activo
                                    ? 'ver-residente-estado activo'
                                    : 'ver-residente-estado inactivo'
                            }
                        >
                            {residente.activo
                                ? 'Activo'
                                : 'Inactivo'}
                        </span>

                    </div>

                </div>

                <div className="ver-residente-card">

                    <h2>Datos personales</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Nombre
                            </span>

                            <span className="ver-residente-valor">
                                {residente.nombre}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Apellido
                            </span>

                            <span className="ver-residente-valor">
                                {residente.apellido}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                DNI/NIE
                            </span>

                            <span className="ver-residente-valor">
                                {residente.dni_nie}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Género
                            </span>

                            <span className="ver-residente-valor">
                                {residente.genero === 'M'
                                    ? 'Masculino'
                                    : residente.genero === 'F'
                                        ? 'Femenino'
                                        : 'Otro'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Fecha de nacimiento
                            </span>

                            <span className="ver-residente-valor">
                                {residente.f_nacimiento}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                País
                            </span>

                            <span className="ver-residente-valor">
                                {residente.pais}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-residente-card">

                    <h2>Datos de contacto</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Teléfono
                            </span>

                            <span className="ver-residente-valor">
                                {residente.telefono ||
                                    'No especificado'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Correo electrónico
                            </span>

                            <span className="ver-residente-valor">
                                {residente.email ||
                                    'No especificado'}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-residente-card">

                    <h2>Información adicional</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo ver-residente-campo-completo">
                            <span className="ver-residente-label">
                                Información
                            </span>

                            <span className="ver-residente-valor">
                                {residente.info ||
                                    'No especificada'}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-residente-card">

                    <h2>Estancia</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Habitación
                            </span>

                            <span className="ver-residente-valor">
                                {residente.habitacion_nombre ||
                                    'Sin habitación'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Fecha de alta
                            </span>

                            <span className="ver-residente-valor">
                                {residente.f_alta}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Fecha de baja
                            </span>

                            <span className="ver-residente-valor">
                                {residente.f_baja ||
                                    'No tiene fecha de baja'}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-residente-botones">

                    <button
                        className="ver-residente-volver"
                        onClick={() => navigate('/residentes')}
                    >
                        Volver
                    </button>

                </div>

            </div>

        </div>
    )
}

export default VerResidente
