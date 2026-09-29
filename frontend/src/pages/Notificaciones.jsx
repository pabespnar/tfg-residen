import './Notificaciones.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaSearch, FaFilter } from 'react-icons/fa'

function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [tipoFiltro, setTipoFiltro] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)

    const notificacionesPorPagina = 4

    const token = localStorage.getItem('access')

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const cargarNotificaciones = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await axios.get(
                '/api/evento/notificaciones/',
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

    const tiposFiltro = [...new Set(
        notificaciones
            .map((notificacion) => notificacion.tipo)
            .filter((tipo) => tipo)
    )].sort((a, b) =>
        normalizarTexto(a).localeCompare(
            normalizarTexto(b)
        )
    )

    useEffect(() => {
        setCurrentPage(1)
    }, [
        terminoBusqueda,
        tipoFiltro,
        estadoFiltro
    ])

    const notificacionesFiltradas = notificaciones.filter(
        (notificacion) => {
            const termino = normalizarTexto(
                terminoBusqueda
            )

            const tipo = normalizarTexto(
                notificacion.tipo || ''
            )

            const descripcion = normalizarTexto(
                notificacion.descripcion || ''
            )

            const coincideBusqueda =
                termino === '' ||
                tipo.includes(termino) ||
                descripcion.includes(termino)

            const coincideTipo =
                tipoFiltro === '' ||
                notificacion.tipo === tipoFiltro

            let coincideEstado = true

            if (estadoFiltro === 'leida') {
                coincideEstado =
                    notificacion.leida === true
            }

            if (estadoFiltro === 'no_leida') {
                coincideEstado =
                    notificacion.leida === false
            }

            return (
                coincideBusqueda &&
                coincideTipo &&
                coincideEstado
            )
        }
    )

    const totalPaginas = Math.ceil(
        notificacionesFiltradas.length /
        notificacionesPorPagina
    )

    const indiceInicial =
        (currentPage - 1) *
        notificacionesPorPagina

    const notificacionesPaginadas =
        notificacionesFiltradas.slice(
            indiceInicial,
            indiceInicial + notificacionesPorPagina
        )

    const restablecerFiltros = () => {
        setTipoFiltro('')
        setEstadoFiltro('')
    }

    const marcarComoLeida = async (id) => {
        try {
            const response = await axios.post(
                `/api/evento/notificaciones/${id}/leida/`,
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
            setError(
                'No se ha podido marcar la notificación como leída'
            )
        }
    }

    return (
        <div className="notificaciones-container">

            <div className="notificaciones-header">
                <h1>Alertas</h1>
            </div>

            {loading && (
                <p className="notificaciones-estado">
                    Cargando alertas...
                </p>
            )}

            {!loading && error && (
                <p className="notificaciones-error">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {notificaciones.length > 0 && (
                        <div className="notificaciones-controles">

                            <div className="notificaciones-controles-principales">

                                <div className="notificaciones-buscador">
                                    <FaSearch className="notificaciones-buscador-icono" />

                                    <input
                                        type="text"
                                        placeholder="Buscar en las notificaciones..."
                                        value={terminoBusqueda}
                                        onChange={(e) =>
                                            setTerminoBusqueda(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="notificaciones-boton-filtros"
                                    onClick={() =>
                                        setMostrarFiltros(
                                            (estadoAnterior) =>
                                                !estadoAnterior
                                        )
                                    }
                                >
                                    <FaFilter />

                                    {mostrarFiltros
                                        ? 'Ocultar filtros'
                                        : 'Mostrar filtros'}
                                </button>

                            </div>

                            {mostrarFiltros && (
                                <div className="notificaciones-panel-filtros">

                                    <div className="notificaciones-filtro">

                                        <label htmlFor="notificaciones-tipo">
                                            Tipo
                                        </label>

                                        <select
                                            id="notificaciones-tipo"
                                            value={tipoFiltro}
                                            onChange={(e) =>
                                                setTipoFiltro(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Todos
                                            </option>

                                            {tiposFiltro.map(
                                                (tipo) => (
                                                    <option
                                                        key={tipo}
                                                        value={tipo}
                                                    >
                                                        {tipo}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                    </div>

                                    <div className="notificaciones-filtro">

                                        <label htmlFor="notificaciones-estado">
                                            Estado
                                        </label>

                                        <select
                                            id="notificaciones-estado"
                                            value={estadoFiltro}
                                            onChange={(e) =>
                                                setEstadoFiltro(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Todas
                                            </option>

                                            <option value="no_leida">
                                                No leídas
                                            </option>

                                            <option value="leida">
                                                Leídas
                                            </option>
                                        </select>

                                    </div>

                                    <button
                                        type="button"
                                        className="notificaciones-restablecer-filtros"
                                        onClick={
                                            restablecerFiltros
                                        }
                                    >
                                        Restablecer filtros
                                    </button>

                                </div>
                            )}

                        </div>
                    )}

                    {notificaciones.length === 0 ? (
                        <p className="notificaciones-estado">
                            No tienes alertas.
                        </p>
                    ) : notificacionesPaginadas.length === 0 ? (
                        <div className="notificaciones-estado">
                            No se han encontrado alertas que coincidan con los filtros seleccionados.
                        </div>
                    ) : (
                        <div className="notificaciones-lista">

                            {notificacionesPaginadas.map(
                                (notificacion) => (
                                    <div
                                        key={
                                            notificacion.id
                                        }
                                        className={`notificacion ${
                                            !notificacion.leida
                                                ? 'notificacion-no-leida'
                                                : ''
                                        }`}
                                    >

                                        <div className="notificacion-contenido">

                                            <div className="notificacion-tipo">
                                                {
                                                    notificacion.tipo
                                                }
                                            </div>

                                            <div className="notificacion-descripcion">
                                                {
                                                    notificacion.descripcion
                                                }
                                            </div>

                                            <div className="notificacion-fecha">
                                                {new Date(
                                                    notificacion.fecha
                                                ).toLocaleString(
                                                    'es-ES'
                                                )}
                                            </div>

                                        </div>

                                        {!notificacion.leida && (
                                            <button
                                                className="notificacion-leida"
                                                onClick={() =>
                                                    marcarComoLeida(
                                                        notificacion.id
                                                    )
                                                }
                                            >
                                                Marcar como leída
                                            </button>
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

                    {totalPaginas > 1 && (
                        <div className="notificaciones-paginacion">

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        (pagina) =>
                                            Math.max(
                                                pagina - 1,
                                                1
                                            )
                                    )
                                }
                                disabled={
                                    currentPage === 1
                                }
                            >
                                Anterior
                            </button>

                            <span>
                                Página {currentPage} de {totalPaginas}
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        (pagina) =>
                                            Math.min(
                                                pagina + 1,
                                                totalPaginas
                                            )
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    totalPaginas
                                }
                            >
                                Siguiente
                            </button>

                        </div>
                    )}

                </>
            )}

        </div>
    )
}

export default Notificaciones