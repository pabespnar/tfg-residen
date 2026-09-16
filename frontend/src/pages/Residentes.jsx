import { useEffect, useState } from 'react'
import axios from 'axios'
import './Residentes.css'
import { FaPencilAlt, FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function Residentes() {

    const [residentes, setResidentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [terminoBusqueda, setTerminoBusqueda] = useState('')

    const [currentPage, setCurrentPage] = useState(1)

    const navigate = useNavigate()

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

        const dniNie = normalizarTexto(
            residente.dni_nie || ''
        )

        return (
            texto === '' ||
            nombreCompleto.includes(texto) ||
            dniNie.includes(texto)
        )
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage

    const residentesActuales = residentesFiltrados.slice(
        indexOfFirstItem,
        indexOfLastItem
    )

    const totalPages = Math.ceil(
        residentesFiltrados.length / itemsPerPage
    )

    useEffect(() => {

        const obtenerResidentes = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/residentes/listaresidentes/',
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

        obtenerResidentes()

    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [terminoBusqueda])

    if (loading) {
        return (
            <div className="residentes-container">
                <p>Cargando residentes...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="residentes-container">
                <p className="residentes-error">
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className="residentes-container">

            <div className="residentes-header">

                <div>
                    <h1>Residentes</h1>

                    <p>
                        Gestión de los residentes activos del centro
                    </p>
                </div>

                <button
                    type="button"
                    className="residentes-anadir"
                    onClick={() => navigate('/residentes/nuevo')}
                >
                    +
                </button>

            </div>

            {residentes.length === 0 ? (

                <div className="residentes-vacio">
                    <p>
                        No hay residentes activos registrados.
                    </p>
                </div>

            ) : (

                <>
                    <div className="residentes-buscador">
                        <div className="residentes-buscador-input">
                            <FaSearch className="residentes-buscador-icono" />

                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o DNI/NIE..."
                                value={terminoBusqueda}
                                onChange={(e) =>
                                    setTerminoBusqueda(e.target.value)
                                }
                            />
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
                                        <th>Residente</th>
                                        <th>DNI/NIE</th>
                                        <th>País</th>
                                        <th>Habitación</th>
                                        <th>Fecha de alta</th>
                                        <th>Acciones</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {residentesActuales.map((residente) => (

                                        <tr
                                            key={residente.id}
                                            onClick={() =>
                                                navigate(`/residentes/${residente.id}`)
                                            }
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
                                                {residente.dni_nie}
                                            </td>

                                            <td>
                                                {residente.pais}
                                            </td>

                                            <td>
                                                {residente.habitacion_nombre
                                                    ? residente.habitacion_nombre
                                                    : 'Sin habitación'}
                                            </td>

                                            <td>
                                                {residente.f_alta}
                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="residentes-editar-icono"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(
                                                            `/residentes/${residente.id}/editar`
                                                        )
                                                    }}
                                                    title="Editar residente"
                                                >
                                                    <FaPencilAlt />
                                                </button>

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

export default Residentes