import { useEffect, useState } from 'react'
import axios from 'axios'
import './SuministrosResidentes.css'
import { FaSearch } from 'react-icons/fa'

function SuministrosResidentes() {

    const [packs, setPacks] = useState([])
    const [residentes, setResidentes] = useState([])
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('nombre_asc')
    const [paginaPacks, setPaginaPacks] = useState(1)

    const [packSeleccionado, setPackSeleccionado] = useState(null)
    const [residentesEntrega, setResidentesEntrega] = useState([])
    const [error, setError] = useState('')

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const obtenerPacks = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/suministros/packs/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setPacks(response.data)
        } catch (error) {
            console.error('Error al obtener los packs:', error)
            setError('No se han podido cargar los packs.')
        }
    }

    const obtenerResidentes = async () => {
        const token = localStorage.getItem('access')

        try {
            const [residentesActivos, residentesHistorico] =
                await Promise.all([
                    axios.get(
                        'http://127.0.0.1:8000/api/residentes/listaresidentes/',
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    ),
                    axios.get(
                        'http://127.0.0.1:8000/api/residentes/historicoresidentes/',
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )
                ])

            setResidentes([
                ...residentesActivos.data,
                ...residentesHistorico.data
            ])
        } catch (error) {
            console.error('Error al obtener los residentes:', error)
            setError('No se han podido cargar los residentes.')
        }
    }

    useEffect(() => {
        obtenerPacks()
        obtenerResidentes()
    }, [])

    const obtenerPorcentajeEntregas = (pack) => {
        if (residentes.length === 0) {
            return 0
        }

        const entregas = residentes.filter((residente) =>
            (residente.packs_recibidos || []).some(
                (packRecibido) =>
                    String(packRecibido.id) === String(pack.id)
            )
        ).length

        return (entregas / residentes.length) * 100
    }

    const packsEntregados = packs.filter(
        (pack) => Number(pack.residentes_recibidos || 0) > 0
    )

    const packsFiltrados = packsEntregados.filter((pack) => {
        const texto = normalizarTexto(terminoBusqueda)

        const nombrePack = normalizarTexto(
            pack.nombre || ''
        )

        const descripcionPack = normalizarTexto(
            pack.descripcion || ''
        )

        const coincideSuministro = (
            pack.contenido || []
        ).some((contenido) => {
            const nombreSuministro = normalizarTexto(
                contenido.suministro_nombre || ''
            )

            return nombreSuministro.includes(texto)
        })

        return (
            texto === '' ||
            nombrePack.includes(texto) ||
            descripcionPack.includes(texto) ||
            coincideSuministro
        )
    })

    const packsOrdenados = [...packsFiltrados].sort((a, b) => {
        const nombreA = normalizarTexto(a.nombre || '')
        const nombreB = normalizarTexto(b.nombre || '')

        const suministrosA = (a.contenido || []).length
        const suministrosB = (b.contenido || []).length

        const porcentajeA = obtenerPorcentajeEntregas(a)
        const porcentajeB = obtenerPorcentajeEntregas(b)

        if (orden === 'nombre_asc') {
            return nombreA.localeCompare(nombreB)
        }

        if (orden === 'nombre_desc') {
            return nombreB.localeCompare(nombreA)
        }

        if (orden === 'suministros_asc') {
            return suministrosA - suministrosB
        }

        if (orden === 'suministros_desc') {
            return suministrosB - suministrosA
        }

        if (orden === 'porcentaje_asc') {
            return porcentajeA - porcentajeB
        }

        if (orden === 'porcentaje_desc') {
            return porcentajeB - porcentajeA
        }

        return 0
    })

    useEffect(() => {
        setPaginaPacks(1)
    }, [terminoBusqueda, orden])

    const abrirDetallePack = (pack) => {
        const entregas = []

        residentes.forEach((residente) => {
            const packsRecibidos = residente.packs_recibidos || []

            packsRecibidos.forEach((packRecibido) => {
                if (String(packRecibido.id) === String(pack.id)) {
                    entregas.push({
                        id: residente.id,
                        nombre: residente.nombre,
                        apellido: residente.apellido,
                        dni_nie: residente.dni_nie,
                        fecha_entrega: packRecibido.fecha_entrega
                    })
                }
            })
        })

        entregas.sort((a, b) => {
            return new Date(b.fecha_entrega) - new Date(a.fecha_entrega)
        })

        setResidentesEntrega(entregas)
        setPackSeleccionado(pack)
    }

    const cerrarDetallePack = () => {
        setPackSeleccionado(null)
        setResidentesEntrega([])
    }

    const packsPorPagina = 9

    const indiceUltimoPack =
        paginaPacks * packsPorPagina

    const indicePrimerPack =
        indiceUltimoPack - packsPorPagina

    const packsActuales = packsOrdenados.slice(
        indicePrimerPack,
        indiceUltimoPack
    )

    const totalPaginasPacks = Math.ceil(
        packsOrdenados.length / packsPorPagina
    )

    return (
        <div className="suministros-residentes-container">
            <div className="suministros-residentes-titulo">
                <div>
                    <h1>Suministros</h1>
                    <p>
                        Consulta los packs de suministros entregados a los residentes
                    </p>
                </div>
            </div>

            {error && (
                <p className="suministros-residentes-error">
                    {error}
                </p>
            )}

            <div className="suministros-residentes-controles">
                <div className="suministros-residentes-buscador">
                    <div className="suministros-residentes-buscador-input">
                        <FaSearch className="suministros-residentes-buscador-icono" />
                        <input
                            type="text"
                            placeholder="Buscar pack..."
                            value={terminoBusqueda}
                            onChange={(e) => {
                                setTerminoBusqueda(e.target.value)
                                setPaginaPacks(1)
                            }}
                        />
                    </div>
                </div>

                <div className="suministros-residentes-ordenacion">
                    <label>Ordenar por:</label>
                    <select
                        value={orden}
                        onChange={(e) => {
                            setOrden(e.target.value)
                            setPaginaPacks(1)
                        }}
                    >
                        <option value="nombre_asc">
                            Nombre (A-Z)
                        </option>
                        <option value="nombre_desc">
                            Nombre (Z-A)
                        </option>
                        <option value="suministros_asc">
                            Menos suministros
                        </option>
                        <option value="suministros_desc">
                            Más suministros
                        </option>
                        <option value="porcentaje_asc">
                            Menor porcentaje de residentes
                        </option>
                        <option value="porcentaje_desc">
                            Mayor porcentaje de residentes
                        </option>
                    </select>
                </div>
            </div>

            {packsActuales.length === 0 ? (
                <div className="suministros-residentes-vacio">
                    No hay packs entregados.
                </div>
            ) : (
                <div className="suministros-residentes-listado">
                    {packsActuales.map((pack) => (
                        <button
                            key={pack.id}
                            className="suministro-residente-card"
                            onClick={() => abrirDetallePack(pack)}
                        >
                            <strong>{pack.nombre}</strong>
                            <span>
                                {(pack.contenido || []).length} suministros
                                {' · '}
                                {pack.residentes_recibidos || 0} entregas
                                {' · '}
                                {obtenerPorcentajeEntregas(pack).toFixed(1)}% de residentes
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {totalPaginasPacks > 1 && (
                <div className="suministros-residentes-paginacion">
                    <button
                        onClick={() =>
                            setPaginaPacks((pagina) => pagina - 1)
                        }
                        disabled={paginaPacks === 1}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaPacks} de {totalPaginasPacks}
                    </span>

                    <button
                        onClick={() =>
                            setPaginaPacks((pagina) => pagina + 1)
                        }
                        disabled={paginaPacks === totalPaginasPacks}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {packSeleccionado && (
                <div
                    className="suministros-residentes-detalle-overlay"
                    onClick={cerrarDetallePack}
                >
                    <div
                        className="suministros-residentes-detalle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="suministros-residentes-detalle-cerrar"
                            onClick={cerrarDetallePack}
                        >
                            ×
                        </button>

                            <h2>{packSeleccionado.nombre}</h2>

                            <div className="suministros-residentes-resumen">
                                <span>
                                    {residentesEntrega.length} entregas
                                </span>
                                <span>
                                    {obtenerPorcentajeEntregas(packSeleccionado).toFixed(1)}% de los residentes
                                </span>
                            </div>

                            <div className="suministros-residentes-descripcion">
                            <h3>Descripción</h3>
                            <p>
                                {packSeleccionado.descripcion ||
                                    'Sin descripción.'}
                            </p>
                        </div>

                        <div className="suministros-residentes-contenido">
                            <h3>Suministros</h3>

                            {(packSeleccionado.contenido || []).map(
                                (contenido) => (
                                    <div
                                        key={contenido.id}
                                        className="suministros-residentes-suministro"
                                    >
                                        <span>
                                            {contenido.suministro_nombre}
                                        </span>
                                        <span>
                                            {contenido.cantidad}{' '}
                                            {contenido.suministro_unidad || ''}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="suministros-residentes-entregas">
                            <h3>
                                Residentes que han recibido el pack
                            </h3>

                            {residentesEntrega.length === 0 ? (
                                <div className="suministros-residentes-sin-entregas">
                                    No hay información sobre las entregas.
                                </div>
                            ) : (
                                <div className="suministros-residentes-tabla">
                                    <div className="suministros-residentes-tabla-cabecera">
                                        <span>Residente</span>
                                        <span>DNI/NIE</span>
                                        <span>Fecha de entrega</span>
                                    </div>

                                    {residentesEntrega.map((residente, index) => (
                                        <div
                                            key={`${residente.id}-${index}`}
                                            className="suministros-residentes-tabla-fila"
                                        >
                                            <span>
                                                {residente.nombre}{' '}
                                                {residente.apellido}
                                            </span>
                                            <span>
                                                {residente.dni_nie}
                                            </span>
                                            <span>
                                                {residente.fecha_entrega}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SuministrosResidentes