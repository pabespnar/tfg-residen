import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaSearch, FaFilter } from 'react-icons/fa'
import './Historial.css'

const Historial = () => {
    const [historial, setHistorial] = useState([])
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [tipoFiltro, setTipoFiltro] = useState('')
    const [usuarioFiltro, setUsuarioFiltro] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const elementosPorPagina = 4

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                const token = localStorage.getItem('access')

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/evento/historial/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setHistorial(response.data)
            } catch (error) {
                setError('No se ha podido cargar el historial.')
            } finally {
                setCargando(false)
            }
        }

        obtenerHistorial()
    }, [])

    const tiposFiltro = [...new Set(
        historial
            .map((evento) => evento.tipo)
            .filter((tipo) => tipo)
    )].sort((a, b) =>
        normalizarTexto(a).localeCompare(normalizarTexto(b))
    )

    const usuariosFiltro = [...new Map(
        historial
            .filter((evento) => evento.usuario)
            .map((evento) => [
                evento.usuario,
                {
                    id: evento.usuario,
                    nombre: evento.usuario_nombre || '',
                    apellido: evento.usuario_apellido || '',
                    email: evento.usuario_email || ''
                }
            ])
    ).values()].sort((a, b) => {
        const nombreA = normalizarTexto(
            `${a.nombre} ${a.apellido}`
        )

        const nombreB = normalizarTexto(
            `${b.nombre} ${b.apellido}`
        )

        return nombreA.localeCompare(nombreB)
    })

    useEffect(() => {
        setCurrentPage(1)
    }, [
        terminoBusqueda,
        tipoFiltro,
        usuarioFiltro
    ])

    const historialFiltrado = historial.filter((evento) => {
        const termino = normalizarTexto(terminoBusqueda)

        const tipo = normalizarTexto(
            evento.tipo || ''
        )

        const descripcion = normalizarTexto(
            evento.descripcion || ''
        )

        const autor = normalizarTexto(
            `${evento.usuario_nombre || ''} ${evento.usuario_apellido || ''}`
        )

        const coincideBusqueda =
            termino === '' ||
            tipo.includes(termino) ||
            descripcion.includes(termino) ||
            autor.includes(termino)

        const coincideTipo =
            tipoFiltro === '' ||
            evento.tipo === tipoFiltro

        const coincideUsuario =
            usuarioFiltro === '' ||
            String(evento.usuario) === usuarioFiltro

        return (
            coincideBusqueda &&
            coincideTipo &&
            coincideUsuario
        )
    })

    const totalPaginas = Math.ceil(
        historialFiltrado.length / elementosPorPagina
    )

    const indiceInicial =
        (currentPage - 1) * elementosPorPagina

    const historialPaginado = historialFiltrado.slice(
        indiceInicial,
        indiceInicial + elementosPorPagina
    )

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const restablecerFiltros = () => {
        setTipoFiltro('')
        setUsuarioFiltro('')
    }

    if (cargando) {
        return (
            <div className="historial-container">
                <div className="historial-cargando">
                    Cargando historial...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="historial-container">
                <div className="historial-error">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="historial-container">
            <div className="historial-header">
                <div>
                    <h1>Historial</h1>
                    <p>Registro de acciones realizadas en el centro</p>
                </div>
            </div>

            <div className="historial-controles">
                <div className="historial-controles-principales">
                    <div className="historial-buscador">
                        <FaSearch className="historial-buscador-icono" />
                        <input
                            type="text"
                            placeholder="Buscar en el historial..."
                            value={terminoBusqueda}
                            onChange={(e) =>
                                setTerminoBusqueda(e.target.value)
                            }
                        />
                    </div>

                    <button
                        type="button"
                        className="historial-boton-filtros"
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
                    <div className="historial-panel-filtros">
                        <div className="historial-filtro">
                            <label htmlFor="historial-tipo">
                                Tipo
                            </label>

                            <select
                                id="historial-tipo"
                                value={tipoFiltro}
                                onChange={(e) =>
                                    setTipoFiltro(e.target.value)
                                }
                            >
                                <option value="">
                                    Todos
                                </option>

                                {tiposFiltro.map((tipo) => (
                                    <option
                                        key={tipo}
                                        value={tipo}
                                    >
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="historial-filtro">
                            <label htmlFor="historial-usuario">
                                Usuario
                            </label>

                            <select
                                id="historial-usuario"
                                value={usuarioFiltro}
                                onChange={(e) =>
                                    setUsuarioFiltro(e.target.value)
                                }
                            >
                                <option value="">
                                    Todos
                                </option>

                                {usuariosFiltro.map((usuario) => (
                                    <option
                                        key={usuario.id}
                                        value={usuario.id}
                                    >
                                        {usuario.nombre} {usuario.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            className="historial-restablecer-filtros"
                            onClick={restablecerFiltros}
                        >
                            Restablecer filtros
                        </button>
                    </div>
                )}
            </div>

            {historialPaginado.length === 0 ? (
                <div className="historial-vacio">
                    {terminoBusqueda ||
                    tipoFiltro ||
                    usuarioFiltro
                        ? 'No se han encontrado resultados que coincidan con los filtros seleccionados.'
                        : 'No hay eventos registrados.'}
                </div>
            ) : (
                <div className="historial-lista">
                    {historialPaginado.map((evento) => (
                        <div
                            className="historial-tarjeta"
                            key={evento.id}
                        >
                            <div className="historial-autor">
                                {evento.usuario_imagen ? (
                                    <img
                                        src={evento.usuario_imagen}
                                        alt={`${evento.usuario_nombre} ${evento.usuario_apellido}`}
                                        className="historial-autor-imagen"
                                    />
                                ) : (
                                    <div className="historial-autor-sin-imagen">
                                        {evento.usuario_nombre?.charAt(0)}
                                        {evento.usuario_apellido?.charAt(0)}
                                    </div>
                                )}

                                <div className="historial-autor-nombre">
                                    <span>
                                        {evento.usuario_nombre}
                                    </span>
                                    <span>
                                        {evento.usuario_apellido}
                                    </span>
                                </div>
                            </div>

                            <div className="historial-tarjeta-contenido">
                                <div className="historial-tarjeta-cabecera">
                                    <h2>{evento.tipo}</h2>
                                    <span>
                                        {formatearFecha(evento.fecha)}
                                    </span>
                                </div>

                                <div className="historial-tarjeta-descripcion">
                                    {evento.descripcion}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPaginas > 1 && (
                <div className="historial-paginacion">
                    <button
                        onClick={() =>
                            setCurrentPage((pagina) =>
                                Math.max(pagina - 1, 1)
                            )
                        }
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    <span>
                        Página {currentPage} de {totalPaginas}
                    </span>

                    <button
                        onClick={() =>
                            setCurrentPage((pagina) =>
                                Math.min(
                                    pagina + 1,
                                    totalPaginas
                                )
                            )
                        }
                        disabled={currentPage === totalPaginas}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    )
}

export default Historial