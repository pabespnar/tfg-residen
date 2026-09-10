import { useEffect, useState } from 'react'
import axios from 'axios'
import './BajasAlmacen.css'
import { useNavigate } from 'react-router-dom'

function BajasAlmacen() {

    const [bajas, setBajas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [bajaSeleccionada, setBajaSeleccionada] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {

        const obtenerBajas = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/almacen/listabajas/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setBajas(response.data)

            } catch (error) {

                console.error(
                    'Error al obtener las bajas:',
                    error
                )

                setError(
                    'No se han podido cargar las bajas.'
                )

            } finally {

                setLoading(false)

            }
        }

        obtenerBajas()

    }, [])

    const cerrarModal = () => {
        setBajaSeleccionada(null)
    }

    if (loading) {
        return (
            <div className="bajas-container">

                <p>Cargando bajas...</p>

            </div>
        )
    }

    if (error) {
        return (
            <div className="bajas-container">

                <p className="bajas-error">
                    {error}
                </p>

            </div>
        )
    }

    return (
        <div className="bajas-container">

            <div className="bajas-header">

                <div>
                    <h1>Bajas de almacén</h1>

                    <p>
                        Consulta de las salidas registradas en el almacén
                    </p>
                </div>

            </div>

            {bajas.length === 0 ? (

                <div className="bajas-vacio">
                    <p>
                        No hay bajas de almacén registradas.
                    </p>
                </div>

            ) : (

                <div className="tabla-bajas-container">

                    <table className="tabla-bajas">

                        <thead>

                            <tr>
                                <th>Suministro</th>
                                <th>Cantidad</th>
                                <th>Stock tras baja</th>
                                <th>Tipo</th>
                                <th>Servicio</th>
                                <th>Fecha</th>
                            </tr>

                        </thead>

                        <tbody>

                            {bajas.map((baja) => (

                                <tr
                                    key={baja.id}
                                    onClick={() => {
                                        if (baja.tipo === 'EXTRAORDINARIA') {
                                            setBajaSeleccionada(baja)
                                        }
                                    }}
                                    style={{
                                        cursor:
                                            baja.tipo === 'EXTRAORDINARIA'
                                                ? 'pointer'
                                                : 'default'
                                    }}
                                >

                                    <td>
                                        {baja.suministro_nombre}
                                    </td>

                                    <td>
                                        −{baja.cantidad} {baja.suministro_unidad}
                                    </td>

                                    <td>
                                        {baja.stock_tras_baja} {baja.suministro_unidad}
                                    </td>

                                    <td>
                                        {baja.tipo === 'PACK'
                                            ? 'Pack'
                                            : 'Extraordinaria'}
                                    </td>

                                    <td>
                                        {baja.servicio
                                            ? baja.servicio
                                            : '—'}
                                    </td>

                                    <td>
                                        {baja.fecha}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

            <div className="bajas-botones">

                <button
                    type="button"
                    className="bajas-volver"
                    onClick={() => navigate('/almacen')}
                >
                    Volver
                </button>

            </div>

            {bajaSeleccionada && (
                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>Observaciones</h2>

                        <div className="crear-modulo-campo">

                            <label>Observaciones</label>

                            <textarea
                                value={
                                    bajaSeleccionada.observaciones || ''
                                }
                                readOnly
                                rows="5"
                            />

                        </div>

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

export default BajasAlmacen