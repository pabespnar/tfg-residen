import './Notificaciones.css'
import { useEffect, useState } from 'react'
import axios from 'axios'

function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const token = localStorage.getItem('access')

    const cargarNotificaciones = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/evento/notificaciones/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setNotificaciones(response.data)
        } catch (error) {
            setError('No se han podido cargar las notificaciones')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarNotificaciones()
    }, [])

    const marcarComoLeida = async (id) => {
        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/evento/notificaciones/${id}/leida/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setNotificaciones((actuales) =>
                actuales.map((notificacion) =>
                    notificacion.id === id
                        ? response.data
                        : notificacion
                )
            )
        } catch (error) {
            setError('No se ha podido marcar la notificación como leída')
        }
    }

    return (
        <div className="notificaciones-container">

            <div className="notificaciones-header">
                <h1>Notificaciones</h1>
            </div>

            {loading && (
                <p className="notificaciones-estado">
                    Cargando notificaciones...
                </p>
            )}

            {!loading && error && (
                <p className="notificaciones-error">
                    {error}
                </p>
            )}

            {!loading && !error && notificaciones.length === 0 && (
                <p className="notificaciones-estado">
                    No tienes notificaciones.
                </p>
            )}

            {!loading && !error && notificaciones.length > 0 && (
                <div className="notificaciones-lista">
                    {notificaciones.map((notificacion) => (
                        <div
                            key={notificacion.id}
                            className={`notificacion ${!notificacion.leida ? 'notificacion-no-leida' : ''}`}
                        >
                            <div className="notificacion-contenido">
                                <div className="notificacion-tipo">
                                    {notificacion.tipo}
                                </div>

                                <div className="notificacion-descripcion">
                                    {notificacion.descripcion}
                                </div>

                                <div className="notificacion-fecha">
                                    {new Date(notificacion.fecha).toLocaleString('es-ES')}
                                </div>
                            </div>

                            {!notificacion.leida && (
                                <button
                                    className="notificacion-leida"
                                    onClick={() => marcarComoLeida(notificacion.id)}
                                >
                                    Marcar como leída
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default Notificaciones