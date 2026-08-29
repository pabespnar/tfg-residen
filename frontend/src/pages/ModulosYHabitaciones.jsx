import { useEffect, useState } from 'react'
import axios from 'axios'
import './ModulosYHabitaciones.css'

function ModulosYHabitaciones() {

    const [modulos, setModulos] = useState([])
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(true)

    useEffect(() => {

        const obtenerModulos = async () => {

            try {

                const token = localStorage.getItem('access')

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/modulos/listadomodulos/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                console.log('Respuesta módulos:', respuesta.data)

                if (Array.isArray(respuesta.data)) {
                    setModulos(respuesta.data)
                } else {
                    setError(
                        'La respuesta del servidor no tiene un formato válido.'
                    )
                }

            } catch (error) {

                console.error('Error al obtener los módulos:', error)

                if (error.response) {
                    console.error(
                        'Respuesta del backend:',
                        error.response.data
                    )

                    console.error(
                        'Código de error:',
                        error.response.status
                    )
                }

                setError('No se han podido cargar los módulos.')

            } finally {

                setCargando(false)

            }
        }

        obtenerModulos()

    }, [])

    return (

        <div className="modulos-container">

            <div className="modulos-card">

                <h1>Módulos y habitaciones</h1>

                {cargando && (
                    <p className="modulos-cargando">
                        Cargando módulos...
                    </p>
                )}

                {error && (
                    <p className="modulos-error">
                        {error}
                    </p>
                )}

                {!cargando && !error && (

                    <div className="modulos-lista">

                        {modulos.length === 0 ? (

                            <p className="modulos-vacio">
                                No hay módulos registrados.
                            </p>

                        ) : (

                            modulos.map((modulo) => (

                                <div
                                    className="modulo-item"
                                    key={modulo.id}
                                >

                                    <h2>{modulo.nombre}</h2>

                                    <p>
                                        {modulo.descripcion || 'Sin descripción'}
                                    </p>

                                    <p>
                                        Habitaciones máximas:{' '}
                                        {modulo.num_habitaciones_max}
                                    </p>

                                </div>

                            ))

                        )}

                    </div>

                )}

            </div>

        </div>

    )
}

export default ModulosYHabitaciones