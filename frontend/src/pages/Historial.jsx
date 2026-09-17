import { useEffect, useState } from 'react'
import axios from 'axios'
import './Historial.css'

const Historial = () => {
    const [historial, setHistorial] = useState([])
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
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

    useEffect(() => {
        setCurrentPage(1)
    }, [terminoBusqueda])

    const historialFiltrado = historial.filter((evento) => {
        const termino = normalizarTexto(terminoBusqueda)

        const autor = normalizarTexto(
            `${evento.usuario_nombre || ''} ${evento.usuario_apellido || ''}`
        )

        return (
            normalizarTexto(evento.tipo).includes(termino) ||
            normalizarTexto(evento.descripcion).includes(termino) ||
            autor.includes(termino)
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
                <input
                    type="text"
                    placeholder="Buscar en el historial..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                />
            </div>

            {historialPaginado.length === 0 ? (
                <div className="historial-vacio">
                    {terminoBusqueda
                        ? 'No se han encontrado resultados.'
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