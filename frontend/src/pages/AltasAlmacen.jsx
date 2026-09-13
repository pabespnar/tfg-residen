import { useEffect, useState } from 'react'
import axios from 'axios'
import './AltasAlmacen.css'
import { useNavigate } from 'react-router-dom'

function AltasAlmacen() {

    const [altas, setAltas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [altaSeleccionada, setAltaSeleccionada] = useState(null)
    const [mostrarAlbaran, setMostrarAlbaran] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {

        const obtenerAltas = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/almacen/listaltas/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setAltas(response.data)

            } catch (error) {

                console.error(
                    'Error al obtener las altas:',
                    error
                )

                setError(
                    'No se han podido cargar las altas.'
                )

            } finally {

                setLoading(false)

            }
        }

        obtenerAltas()

    }, [])

    const cerrarModal = () => {
        setAltaSeleccionada(null)
        setMostrarAlbaran(false)
    }

    const obtenerUrlAlbaran = () => {

        if (!altaSeleccionada?.factura_albaran) {
            return ''
        }

        return altaSeleccionada.factura_albaran.startsWith('http')
            ? altaSeleccionada.factura_albaran
            : `http://127.0.0.1:8000${altaSeleccionada.factura_albaran}`
    }

    if (loading) {
        return (
            <div className="altas-container">
                <p>Cargando altas...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="altas-container">
                <p className="altas-error">
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className="altas-container">

            <div className="altas-header">
                <div>
                    <h1>Altas de almacén</h1>
                    <p>
                        Consulta de las entradas registradas en el almacén
                    </p>
                </div>
            </div>

            {altas.length === 0 ? (
                <div className="altas-vacio">
                    <p>
                        No hay altas de almacén registradas.
                    </p>
                </div>
            ) : (
                <div className="tabla-altas-container">
                    <table className="tabla-altas">
                        <thead>
                            <tr>
                                <th>Suministro</th>
                                <th>Cantidad</th>
                                <th>Stock tras alta</th>
                                <th>Precio unidad</th>
                                <th>Pedido</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {altas.map((alta) => (
                                <tr
                                    key={alta.id}
                                    onClick={() => {
                                        setAltaSeleccionada(alta)
                                        setMostrarAlbaran(false)
                                    }}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                >
                                    <td>{alta.suministro_nombre}</td>

                                    <td>
                                        +{alta.cantidad} {alta.suministro_unidad}
                                    </td>

                                    <td>
                                        {alta.stock_tras_alta} {alta.suministro_unidad}
                                    </td>

                                    <td>
                                        {alta.precio_unidad} €
                                    </td>

                                    <td>
                                        {alta.pedido_nombre}
                                    </td>

                                    <td>
                                        {alta.pedido_tipo === 'EXPEDIENTE'
                                            ? 'Con expediente'
                                            : 'Gasto general'}
                                    </td>

                                    <td>
                                        {alta.fecha}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="altas-botones">
                <button
                    type="button"
                    className="altas-volver"
                    onClick={() => navigate('/almacen')}
                >
                    Volver
                </button>
            </div>

            {altaSeleccionada && (
                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>Observaciones</h2>

                        <div className="crear-modulo-campo">

                            <label>
                                Observaciones
                            </label>

                            <textarea
                                value={
                                    altaSeleccionada.observaciones || ''
                                }
                                readOnly
                                rows="5"
                            />

                        </div>

                        {altaSeleccionada.factura_albaran && (

                            <div className="crear-modulo-campo">

                                <button
                                    type="button"
                                    className="albaran-boton"
                                    onClick={() => {
                                        setMostrarAlbaran(
                                            !mostrarAlbaran
                                        )
                                    }}
                                >
                                    {mostrarAlbaran
                                        ? 'Ocultar albarán'
                                        : 'Ver albarán'}
                                </button>

                                {mostrarAlbaran && (

                                    <img
                                        src={obtenerUrlAlbaran()}
                                        alt="Albarán"
                                        className="albaran-imagen"
                                    />

                                )}

                            </div>

                        )}

                        <div className="crear-modulo-botones">

                            <button
                                type="button"
                                onClick={cerrarModal}
                            >
                                Cerrar
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default AltasAlmacen
