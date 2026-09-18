import { useEffect, useState } from 'react'
import axios from 'axios'
import './AltasAlmacen.css'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaFilter } from 'react-icons/fa'

function AltasAlmacen() {

    const [altas, setAltas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [altaSeleccionada, setAltaSeleccionada] = useState(null)
    const [mostrarAlbaran, setMostrarAlbaran] = useState(false)
    const [paginaAltas, setPaginaAltas] = useState(1)
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('fecha_desc')
    const [tipo, setTipo] = useState('')
    const [expediente, setExpediente] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

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

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const expedientes = altas
        .filter(
            (alta) =>
                alta.pedido_tipo === 'EXPEDIENTE' &&
                alta.expediente_id &&
                alta.expediente_nombre
        )
        .reduce((acumulado, alta) => {

            if (
                !acumulado.some(
                    (item) => item.id === alta.expediente_id
                )
            ) {
                acumulado.push({
                    id: alta.expediente_id,
                    nombre: alta.expediente_nombre
                })
            }

            return acumulado

        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        )

    const altasFiltradas = altas.filter((alta) => {

        const texto = normalizarTexto(terminoBusqueda)

        const nombreSuministro = normalizarTexto(
            alta.suministro_nombre || ''
        )

        const coincideBusqueda =
            texto === '' ||
            nombreSuministro.includes(texto)

        const coincideTipo =
            tipo === '' ||
            alta.pedido_tipo === tipo

        const coincideExpediente =
            expediente === '' ||
            alta.expediente_id === Number(expediente)

        const coincideFechaDesde =
            fechaDesde === '' ||
            alta.fecha >= fechaDesde

        const coincideFechaHasta =
            fechaHasta === '' ||
            alta.fecha <= fechaHasta

        return (
            coincideBusqueda &&
            coincideTipo &&
            coincideExpediente &&
            coincideFechaDesde &&
            coincideFechaHasta
        )
    })

    const altasOrdenadas = [...altasFiltradas].sort((a, b) => {

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
        setPaginaAltas(1)
    }, [
        terminoBusqueda,
        orden,
        tipo,
        expediente,
        fechaDesde,
        fechaHasta
    ])

    useEffect(() => {

        if (tipo !== 'EXPEDIENTE') {
            setExpediente('')
        }

    }, [tipo])

    const restablecerFiltros = () => {
        setTipo('')
        setExpediente('')
        setFechaDesde('')
        setFechaHasta('')
    }

    const altasPorPagina = 5

    const indiceUltimaAlta =
        paginaAltas * altasPorPagina

    const indicePrimeraAlta =
        indiceUltimaAlta - altasPorPagina

    const altasActuales = altasOrdenadas.slice(
        indicePrimeraAlta,
        indiceUltimaAlta
    )

    const totalPaginasAltas = Math.ceil(
        altasOrdenadas.length / altasPorPagina
    )

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

                <>

                    <div className="altas-controles">

                        <div className="altas-controles-principales">

                            <div className="altas-buscador">

                                <div className="altas-buscador-input">

                                    <FaSearch className="altas-buscador-icono" />

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

                            <button
                                type="button"
                                className={`altas-boton-filtros ${
                                    mostrarFiltros
                                        ? 'altas-boton-filtros-activo'
                                        : ''
                                }`}
                                onClick={() =>
                                    setMostrarFiltros(!mostrarFiltros)
                                }
                            >
                                <FaFilter />
                                Mostrar filtros
                            </button>

                            <div className="altas-ordenacion">

                                <label htmlFor="orden-altas">
                                    Ordenar por:
                                </label>

                                <select
                                    id="orden-altas"
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

                        {mostrarFiltros && (

                            <div className="altas-panel-filtros">

                                <div className="altas-filtro">

                                    <label htmlFor="filtro-tipo">
                                        Tipo de pedido
                                    </label>

                                    <select
                                        id="filtro-tipo"
                                        value={tipo}
                                        onChange={(evento) =>
                                            setTipo(evento.target.value)
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        <option value="EXPEDIENTE">
                                            Con expediente
                                        </option>

                                        <option value="GENERAL">
                                            Gasto general
                                        </option>
                                    </select>

                                </div>

                                <div className="altas-filtro">

                                    <label htmlFor="filtro-expediente">
                                        Expediente
                                    </label>

                                    <select
                                        id="filtro-expediente"
                                        value={expediente}
                                        onChange={(evento) =>
                                            setExpediente(
                                                evento.target.value
                                            )
                                        }
                                        disabled={tipo !== 'EXPEDIENTE'}
                                    >
                                        <option value="">
                                            Todos los expedientes
                                        </option>

                                        {expedientes.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="altas-filtro">

                                    <label htmlFor="fecha-desde">
                                        Fecha desde
                                    </label>

                                    <input
                                        id="fecha-desde"
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(evento) =>
                                            setFechaDesde(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="altas-filtro">

                                    <label htmlFor="fecha-hasta">
                                        Fecha hasta
                                    </label>

                                    <input
                                        id="fecha-hasta"
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(evento) =>
                                            setFechaHasta(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <button
                                    type="button"
                                    className="altas-restablecer-filtros"
                                    onClick={restablecerFiltros}
                                >
                                    Restablecer filtros
                                </button>

                            </div>

                        )}

                    </div>

                    {altasFiltradas.length === 0 ? (

                        <div className="altas-vacio">
                            <p>
                                No se han encontrado altas que coincidan con la búsqueda.
                            </p>
                        </div>

                    ) : (

                        <>

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

                                        {altasActuales.map((alta) => (

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

                                                <td>
                                                    {alta.suministro_nombre}
                                                </td>

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

                            {totalPaginasAltas > 1 && (

                                <div className="altas-paginacion">

                                    <button
                                        type="button"
                                        disabled={paginaAltas === 1}
                                        onClick={() =>
                                            setPaginaAltas(
                                                (paginaActual) => paginaActual - 1
                                            )
                                        }
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {paginaAltas} de {totalPaginasAltas}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            paginaAltas === totalPaginasAltas
                                        }
                                        onClick={() =>
                                            setPaginaAltas(
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