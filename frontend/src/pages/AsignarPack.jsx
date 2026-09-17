import { useEffect, useState } from 'react'
import axios from 'axios'
import './AsignarPack.css'
import { FaSearch } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

function AsignarPack() {

    const { packId } = useParams()
    const navigate = useNavigate()

    const [residentes, setResidentes] = useState([])
    const [residentesSeleccionados, setResidentesSeleccionados] = useState([])
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('nombre_asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const itemsPerPage = 5

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const residentesFiltrados = residentes.filter((residente) => {

        const texto = normalizarTexto(terminoBusqueda)

        const nombreCompleto = normalizarTexto(
            `${residente.nombre} ${residente.apellido}`
        )

        return (
            texto === '' ||
            nombreCompleto.includes(texto)
        )
    })

    const residentesOrdenados = [...residentesFiltrados].sort((a, b) => {

        let valorA = ''
        let valorB = ''

        switch (orden) {

            case 'nombre_asc':
            case 'nombre_desc':
                valorA = normalizarTexto(a.nombre || '')
                valorB = normalizarTexto(b.nombre || '')
                break

            case 'apellido_asc':
            case 'apellido_desc':
                valorA = normalizarTexto(a.apellido || '')
                valorB = normalizarTexto(b.apellido || '')
                break

            case 'pack_asc':
            case 'pack_desc':
                valorA = a.pack_recibido ? 1 : 0
                valorB = b.pack_recibido ? 1 : 0
                break

            default:
                return 0
        }

        if (valorA < valorB) {
            return orden.endsWith('_asc') ? -1 : 1
        }

        if (valorA > valorB) {
            return orden.endsWith('_asc') ? 1 : -1
        }

        return 0
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage

    const residentesActuales = residentesOrdenados.slice(
        indexOfFirstItem,
        indexOfLastItem
    )

    const totalPages = Math.ceil(
        residentesOrdenados.length / itemsPerPage
    )

    useEffect(() => {

        const cargarResidentes = async () => {

            setLoading(true)

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    `http://127.0.0.1:8000/api/residentes/listaresidentes/?pack_id=${packId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setResidentes(response.data)

            } catch (error) {

                console.error(
                    'Error al obtener los residentes:',
                    error
                )

                setError(
                    'No se han podido cargar los residentes.'
                )

            } finally {

                setLoading(false)

            }
        }

        cargarResidentes()

    }, [packId])

    useEffect(() => {
        setCurrentPage(1)
    }, [terminoBusqueda, orden])

    const cambiarSeleccionResidente = (id) => {

        setResidentesSeleccionados((seleccionados) => {

            if (seleccionados.includes(id)) {

                return seleccionados.filter(
                    (residenteId) => residenteId !== id
                )

            }

            return [
                ...seleccionados,
                id
            ]

        })
    }

    const asignarPack = async () => {

        const token = localStorage.getItem('access')

        try {

            await axios.post(
                `http://127.0.0.1:8000/api/suministros/packs/${packId}/crearentrega/`,
                {
                    residentes: residentesSeleccionados,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            navigate('/packs', {
                state: {
                    mensaje: 'Pack asignado correctamente.'
                }
            })

        } catch (error) {

            console.error(
                'Error al asignar el pack:',
                error.response?.data
            )

            setError(
                'Ha ocurrido un error al asignar el pack.'
            )

        }

    }

    if (loading) {

        return (
            <div className="residentes-container">

                <p>
                    Cargando residentes...
                </p>

            </div>
        )

    }

    return (
        <div className="residentes-container">

            <div className="residentes-header">

                <div>

                    <h1>
                        Asignar pack
                    </h1>

                    <p>
                        Selecciona los residentes a los que se asignará el pack
                    </p>

                </div>

                <button
                    type="button"
                    className="asignar-pack-boton"
                    onClick={asignarPack}
                    disabled={residentesSeleccionados.length === 0}
                >
                    Asignar pack
                </button>

            </div>

            {error && (
                <p className="residentes-error">
                    {error}
                </p>
            )}

            {residentes.length === 0 ? (

                <div className="residentes-vacio">

                    <p>
                        No hay residentes activos registrados.
                    </p>

                </div>

            ) : (

                <>

                    <div className="residentes-controles">

                        <div className="residentes-buscador">

                            <div className="residentes-buscador-input">

                                <FaSearch className="residentes-buscador-icono" />

                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o apellido..."
                                    value={terminoBusqueda}
                                    onChange={(e) =>
                                        setTerminoBusqueda(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                        <div className="residentes-ordenacion">

                            <label htmlFor="orden-residentes">
                                Ordenar por:
                            </label>

                            <select
                                id="orden-residentes"
                                value={orden}
                                onChange={(e) =>
                                    setOrden(e.target.value)
                                }
                            >
                                <option value="nombre_asc">
                                    Nombre A-Z
                                </option>

                                <option value="nombre_desc">
                                    Nombre Z-A
                                </option>

                                <option value="apellido_asc">
                                    Apellidos A-Z
                                </option>

                                <option value="apellido_desc">
                                    Apellidos Z-A
                                </option>

                                <option value="pack_asc">
                                    No recibido primero
                                </option>

                                <option value="pack_desc">
                                    Ya recibido primero
                                </option>
                            </select>

                        </div>

                    </div>

                    {residentesFiltrados.length === 0 ? (

                        <div className="residentes-vacio">

                            <p>
                                No se han encontrado residentes que coincidan con la búsqueda.
                            </p>

                        </div>

                    ) : (

                        <div className="tabla-residentes-container">

                            <table className="tabla-residentes">

                                <thead>

                                    <tr>

                                        <th>
                                            Residente
                                        </th>

                                        <th>
                                            Seleccionar
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {residentesActuales.map((residente) => (

                                        <tr
                                            key={residente.id}
                                        >

                                            <td>

                                                <div className="residente-nombre">

                                                    <strong>
                                                        {residente.nombre}{' '}
                                                        {residente.apellido}
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>

                                                {residente.pack_recibido ? (

                                                    <span className="asignar-pack-recibido">
                                                        Ya recibido
                                                    </span>

                                                ) : (

                                                    <input
                                                        type="checkbox"
                                                        className="asignar-pack-checkbox"
                                                        checked={residentesSeleccionados.includes(
                                                            residente.id
                                                        )}
                                                        onChange={() =>
                                                            cambiarSeleccionResidente(
                                                                residente.id
                                                            )
                                                        }
                                                    />

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            {totalPages > 1 && (

                                <div className="residentes-paginacion">

                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage(prev => prev - 1)
                                        }
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {currentPage} de {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage(prev => prev + 1)
                                        }
                                    >
                                        Siguiente
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </>

            )}

        </div>
    )
}

export default AsignarPack