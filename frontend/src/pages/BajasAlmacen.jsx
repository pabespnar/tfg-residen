import { useEffect, useState } from 'react'
import axios from 'axios'
import './BajasAlmacen.css'
import { useNavigate } from 'react-router-dom'
import { FaSearch } from 'react-icons/fa'

function BajasAlmacen() {

    const [bajas, setBajas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [bajaSeleccionada, setBajaSeleccionada] = useState(null)

    const [paginaBajas, setPaginaBajas] = useState(1)
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('fecha_desc')

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

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const bajasFiltradas = bajas.filter((baja) => {

        const texto = normalizarTexto(terminoBusqueda)

        const nombreSuministro = normalizarTexto(
            baja.suministro_nombre || ''
        )

        return (
            texto === '' ||
            nombreSuministro.includes(texto)
        )
    })

    const bajasOrdenadas = [...bajasFiltradas].sort((a, b) => {

        const nombreA = normalizarTexto(
            a.suministro_nombre || ''
        )

        const nombreB = normalizarTexto(
            b.suministro_nombre || ''
        )

        const cantidadA = Number(a.cantidad || 0)
        const cantidadB = Number(b.cantidad || 0)

        const fechaA = new Date(a.fecha || 0).getTime()
        const fechaB = new Date(b.fecha || 0).getTime()

        if (orden === 'fecha_asc') {
            return fechaA - fechaB
        }

        if (orden === 'fecha_desc') {
            return fechaB - fechaA
        }

        if (orden === 'suministro_asc') {
            return nombreA.localeCompare(nombreB)
        }

        if (orden === 'suministro_desc') {
            return nombreB.localeCompare(nombreA)
        }

        if (orden === 'cantidad_asc') {
            return cantidadA - cantidadB
        }

        if (orden === 'cantidad_desc') {
            return cantidadB - cantidadA
        }

        return 0
    })

    useEffect(() => {
        setPaginaBajas(1)
    }, [terminoBusqueda, orden])

    const bajasPorPagina = 5

    const indiceUltimaBaja =
        paginaBajas * bajasPorPagina

    const indicePrimeraBaja =
        indiceUltimaBaja - bajasPorPagina

    const bajasActuales = bajasOrdenadas.slice(
        indicePrimeraBaja,
        indiceUltimaBaja
    )

    const totalPaginasBajas = Math.ceil(
        bajasOrdenadas.length / bajasPorPagina
    )

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

                <>

                    <div className="bajas-controles">

                        <div className="bajas-buscador">

                            <div className="bajas-buscador-input">

                                <FaSearch className="bajas-buscador-icono" />

                                <input
                                    type="text"
                                    placeholder="Buscar por suministro..."
                                    value={terminoBusqueda}
                                    onChange={(evento) =>
                                        setTerminoBusqueda(
                                            evento.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>

                        <div className="bajas-ordenacion">

                            <label htmlFor="orden-bajas">
                                Ordenar por:
                            </label>

                            <select
                                id="orden-bajas"
                                value={orden}
                                onChange={(evento) =>
                                    setOrden(evento.target.value)
                                }
                            >
                                <option value="fecha_desc">
                                    Fecha: más reciente
                                </option>

                                <option value="fecha_asc">
                                    Fecha: más antigua
                                </option>

                                <option value="suministro_asc">
                                    Suministro A-Z
                                </option>

                                <option value="suministro_desc">
                                    Suministro Z-A
                                </option>

                                <option value="cantidad_asc">
                                    Cantidad: menor a mayor
                                </option>

                                <option value="cantidad_desc">
                                    Cantidad: mayor a menor
                                </option>
                            </select>

                        </div>

                    </div>

                    {bajasFiltradas.length === 0 ? (

                        <div className="bajas-vacio">
                            <p>
                                No se han encontrado bajas que coincidan con la búsqueda.
                            </p>
                        </div>

                    ) : (

                        <>

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

                                        {bajasActuales.map((baja) => (

                                            <tr
                                                key={baja.id}
                                                onClick={() => {
                                                    setBajaSeleccionada(baja)
                                                }}
                                                style={{
                                                    cursor: 'pointer'
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
                                                        : 'Servicio'}
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

                            {totalPaginasBajas > 1 && (
                                <div className="bajas-paginacion">

                                    <button
                                        type="button"
                                        disabled={paginaBajas === 1}
                                        onClick={() =>
                                            setPaginaBajas(
                                                (paginaActual) => paginaActual - 1
                                            )
                                        }
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {paginaBajas} de{" "}
                                        {totalPaginasBajas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            paginaBajas === totalPaginasBajas
                                        }
                                        onClick={() =>
                                            setPaginaBajas(
                                                (paginaActual) => paginaActual + 1
                                            )
                                        }
                                    >
                                        Siguiente
                                    </button>

                                </div>
                            )}

                        </>

                    )}

                </>

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