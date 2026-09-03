import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerHabitacion.css'
import { FiEdit2 } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

function VerHabitacion() {
    const [habitacion, setHabitacion] = useState(null)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { moduloId, habitacionId } = useParams()

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            `http://127.0.0.1:8000/api/modulos/${moduloId}/habitaciones/${habitacionId}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setHabitacion(response.data)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos de la habitación:',
                error
            )

            if (error.response?.status === 404) {
                setError('La habitación no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos de la habitación.'
                )
            }
        })
    }, [moduloId, habitacionId])

    if (error) {
        return (
            <div className="ver-habitacion-error">
                <h1>{error}</h1>

                <button
                    onClick={() =>
                        navigate(
                            `/modulos/${moduloId}/habitaciones`
                        )
                    }
                >
                    Volver a habitaciones
                </button>
            </div>
        )
    }

    if (!habitacion) {
        return (
            <div className="ver-habitacion-loading">
                <h1>Cargando habitación...</h1>
            </div>
        )
    }

    return (
        <div className="ver-habitacion-container">

            <div className="ver-habitacion-contenido">

                <div className="ver-habitacion-cabecera">

                    <div className="ver-habitacion-cabecera-info">

                        <h1>
                            {habitacion.nombre}

                            <span className="ver-habitacion-acciones">

                                <button
                                    className="ver-habitacion-editar-icono"
                                    title="Editar habitación"
                                >
                                    <FiEdit2 />
                                </button>

                            </span>
                        </h1>

                        <span className="ver-habitacion-modulo">
                            Módulo: {habitacion.modulo_nombre}
                        </span>

                    </div>

                    <div className="ver-habitacion-ocupacion">

                        <span className="ver-habitacion-ocupacion-label">
                            Ocupación
                        </span>

                        <span className="ver-habitacion-ocupacion-valor">
                            {habitacion.residentes_actuales} / {habitacion.capacidad}
                        </span>

                    </div>

                </div>

                <div className="ver-habitacion-card">

                    <h2>Información de la habitación</h2>

                    <div className="ver-habitacion-grid">

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Nombre
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.nombre}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Módulo
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.modulo_nombre}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Capacidad
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.capacidad}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Residentes actuales
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.residentes_actuales}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Fecha de alta
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.f_alta}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo ver-habitacion-campo-completo">
                            <span className="ver-habitacion-label">
                                Información
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.info || 'No especificada'}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-habitacion-residentes">

                    <h2>Residentes</h2>

                    <div className="ver-habitacion-residentes-lista">

                        {habitacion.residentes?.length > 0 ? (
                            habitacion.residentes.map((residente) => (
                                <div
                                    key={residente.id}
                                    className="ver-habitacion-residente-card"
                                    onClick={() =>
                                        navigate(`/residentes/${residente.id}`)
                                    }
                                >
                                    <div className="ver-habitacion-residente-foto">

                                        {residente.foto ? (
                                            <img
                                                src={residente.foto}
                                                alt={`Foto de ${residente.nombre}`}
                                            />
                                        ) : (
                                            <span>
                                                {residente.nombre?.charAt(0)}
                                                {residente.apellido?.charAt(0)}
                                            </span>
                                        )}

                                    </div>

                                    <div className="ver-habitacion-residente-info">
                                        <span className="ver-habitacion-residente-nombre">
                                            {residente.nombre} {residente.apellido}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="ver-habitacion-sin-residentes">
                                No hay residentes en esta habitación.
                            </p>
                        )}

                    </div>

                </div>

                <div className="ver-habitacion-botones">

                    <button
                        className="ver-habitacion-volver"
                        onClick={() =>
                            navigate(
                                `/modulos/${moduloId}/habitaciones`
                            )
                        }
                    >
                        Volver
                    </button>

                </div>

            </div>

        </div>
    )
}

export default VerHabitacion