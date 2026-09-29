import { useEffect, useState } from 'react'
import axios from 'axios'
import './Residentes.css'
import { FaPencilAlt, FaSearch, FaFilter } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'

function Residentes() {
    const [residentes, setResidentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [modulo, setModulo] = useState('')
    const [habitacion, setHabitacion] = useState('')
    const [pais, setPais] = useState('')
    const [genero, setGenero] = useState('')
    const [edadMinima, setEdadMinima] = useState('')
    const [edadMaxima, setEdadMaxima] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [readmision, setReadmision] = useState('')
    const [orden, setOrden] = useState('nombre_asc')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)

    const navigate = useNavigate()
    const location = useLocation()

    const itemsPerPage = 5

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) {
            return null
        }

        const hoy = new Date()
        const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)

        let edad = hoy.getFullYear() - nacimiento.getFullYear()
        const diferenciaMes = hoy.getMonth() - nacimiento.getMonth()

        if (
            diferenciaMes < 0 ||
            (
                diferenciaMes === 0 &&
                hoy.getDate() < nacimiento.getDate()
            )
        ) {
            edad--
        }

        return edad
    }

    const modulos = [
        ...new Set(
            residentes
                .map((residente) => residente.habitacion_modulo_nombre)
                .filter(Boolean)
        )
    ].sort((a, b) =>
        normalizarTexto(a).localeCompare(normalizarTexto(b))
    )

    const habitaciones = [
        ...new Set(
            residentes
                .filter(
                    (residente) =>
                        modulo === '' ||
                        residente.habitacion_modulo_nombre === modulo
                )
                .map((residente) => residente.habitacion_nombre)
                .filter(Boolean)
        )
    ].sort((a, b) =>
        normalizarTexto(a).localeCompare(normalizarTexto(b))
    )

    const paises = [
        ...new Set(
            residentes
                .map((residente) => residente.pais)
                .filter(Boolean)
        )
    ].sort((a, b) =>
        normalizarTexto(a).localeCompare(normalizarTexto(b))
    )

    const generos = [
        ...new Set(
            residentes
                .map((residente) => residente.genero)
                .filter(Boolean)
        )
    ]

    const nombresGenero = {
        M: 'Masculino',
        F: 'Femenino',
        O: 'Otro'
    }

    const residentesFiltrados = residentes.filter((residente) => {
        const texto = normalizarTexto(terminoBusqueda)

        const nombreCompleto = normalizarTexto(
            `${residente.nombre} ${residente.apellido}`
        )

        const dniNie = normalizarTexto(
            residente.dni_nie || ''
        )

        const coincideBusqueda =
            texto === '' ||
            nombreCompleto.includes(texto) ||
            dniNie.includes(texto)

        const edad = calcularEdad(residente.f_nacimiento)

        const coincideEdadMinima =
            edadMinima === '' ||
            (edad !== null && edad >= Number(edadMinima))

        const coincideEdadMaxima =
            edadMaxima === '' ||
            (edad !== null && edad <= Number(edadMaxima))

        const coincideModulo =
            modulo === '' ||
            residente.habitacion_modulo_nombre === modulo

        const coincideHabitacion =
            habitacion === '' ||
            residente.habitacion_nombre === habitacion

        const coincidePais =
            pais === '' ||
            residente.pais === pais

        const coincideGenero =
            genero === '' ||
            residente.genero === genero

        const coincideFechaDesde =
            fechaDesde === '' ||
            residente.f_alta >= fechaDesde

        const coincideFechaHasta =
            fechaHasta === '' ||
            residente.f_alta <= fechaHasta

        const coincideReadmision =
            readmision === '' ||
            (readmision === 'si' && residente.f_baja) ||
            (readmision === 'no' && !residente.f_baja)

        return (
            coincideBusqueda &&
            coincideEdadMinima &&
            coincideEdadMaxima &&
            coincideModulo &&
            coincideHabitacion &&
            coincidePais &&
            coincideGenero &&
            coincideFechaDesde &&
            coincideFechaHasta &&
            coincideReadmision
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
            case 'dni_asc':
            case 'dni_desc':
                valorA = normalizarTexto(a.dni_nie || '')
                valorB = normalizarTexto(b.dni_nie || '')
                break
            case 'pais_asc':
            case 'pais_desc':
                valorA = normalizarTexto(a.pais || '')
                valorB = normalizarTexto(b.pais || '')
                break
            case 'habitacion_asc':
            case 'habitacion_desc':
                valorA = normalizarTexto(
                    a.habitacion_nombre || 'Sin habitación'
                )
                valorB = normalizarTexto(
                    b.habitacion_nombre || 'Sin habitación'
                )
                break
            case 'edad_asc':
            case 'edad_desc':
                valorA = calcularEdad(a.f_nacimiento)
                valorB = calcularEdad(b.f_nacimiento)

                if (valorA === null) valorA = -1
                if (valorB === null) valorB = -1
                break
            case 'alta_asc':
            case 'alta_desc':
                valorA = a.f_alta || ''
                valorB = b.f_alta || ''
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
        const obtenerResidentes = async () => {
            const token = localStorage.getItem('access')

            try {
                const response = await axios.get(
                    '/api/residentes/listaresidentes/',
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
        const filtros = location.state

        if (!filtros) {
            return
        }

        if (filtros.genero !== undefined) {
            setGenero(filtros.genero)
        }

        if (filtros.pais !== undefined) {
            setPais(filtros.pais)
        }

        if (filtros.edad !== undefined) {
            const partesEdad = filtros.edad.split('-')

            if (partesEdad.length === 2) {
                setEdadMinima(partesEdad[0])
                setEdadMaxima(partesEdad[1])
            }
        }

        if (filtros.fechaDesde !== undefined) {
            setFechaDesde(filtros.fechaDesde)
        }

        if (filtros.fechaHasta !== undefined) {
            setFechaHasta(filtros.fechaHasta)
        }

        if (
            filtros.genero !== undefined ||
            filtros.pais !== undefined ||
            filtros.edad !== undefined ||
            filtros.fechaDesde !== undefined ||
            filtros.fechaHasta !== undefined
        ) {
            setMostrarFiltros(true)
        }

        navigate(location.pathname, {
            replace: true,
            state: null
        })
    }, [location, navigate])

    useEffect(() => {
        setHabitacion('')
    }, [modulo])

    useEffect(() => {
        setCurrentPage(1)
    }, [
        terminoBusqueda,
        modulo,
        habitacion,
        pais,
        genero,
        edadMinima,
        edadMaxima,
        fechaDesde,
        fechaHasta,
        readmision,
        orden
    ])

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
                    <div className="residentes-controles">
                        <div className="residentes-controles-principales">
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

                            <button
                                type="button"
                                className={`residentes-boton-filtros ${
                                    mostrarFiltros
                                        ? 'residentes-boton-filtros-activo'
                                        : ''
                                }`}
                                onClick={() =>
                                    setMostrarFiltros((prev) => !prev)
                                }
                            >
                                <FaFilter />
                                {mostrarFiltros
                                    ? 'Ocultar filtros'
                                    : 'Mostrar filtros'}
                            </button>

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
                                    <option value="dni_asc">
                                        DNI/NIE A-Z
                                    </option>
                                    <option value="dni_desc">
                                        DNI/NIE Z-A
                                    </option>
                                    <option value="pais_asc">
                                        País A-Z
                                    </option>
                                    <option value="pais_desc">
                                        País Z-A
                                    </option>
                                    <option value="habitacion_asc">
                                        Habitación A-Z
                                    </option>
                                    <option value="habitacion_desc">
                                        Habitación Z-A
                                    </option>
                                    <option value="edad_asc">
                                        Edad menor a mayor
                                    </option>
                                    <option value="edad_desc">
                                        Edad mayor a menor
                                    </option>
                                    <option value="alta_asc">
                                        Fecha de alta más antigua
                                    </option>
                                    <option value="alta_desc">
                                        Fecha de alta más reciente
                                    </option>
                                </select>
                            </div>
                        </div>

                        {mostrarFiltros && (
                            <div className="residentes-panel-filtros">
                                <div className="residentes-filtro">
                                    <label htmlFor="filtro-modulo">
                                        Módulo
                                    </label>

                                    <select
                                        id="filtro-modulo"
                                        value={modulo}
                                        onChange={(e) =>
                                            setModulo(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Todos los módulos
                                        </option>

                                        {modulos.map((nombreModulo) => (
                                            <option
                                                key={nombreModulo}
                                                value={nombreModulo}
                                            >
                                                {nombreModulo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div
                                    className={`residentes-filtro ${
                                        modulo === ''
                                            ? 'residentes-filtro-deshabilitado'
                                            : ''
                                    }`}
                                >
                                    <label htmlFor="filtro-habitacion">
                                        Habitación
                                    </label>

                                    <select
                                        id="filtro-habitacion"
                                        value={habitacion}
                                        onChange={(e) =>
                                            setHabitacion(e.target.value)
                                        }
                                        disabled={modulo === ''}
                                    >
                                        <option value="">
                                            Todas las habitaciones
                                        </option>

                                        {habitaciones.map(
                                            (nombreHabitacion) => (
                                                <option
                                                    key={nombreHabitacion}
                                                    value={nombreHabitacion}
                                                >
                                                    {nombreHabitacion}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="filtro-pais">
                                        País
                                    </label>

                                    <select
                                        id="filtro-pais"
                                        value={pais}
                                        onChange={(e) =>
                                            setPais(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Todos los países
                                        </option>

                                        {paises.map((nombrePais) => (
                                            <option
                                                key={nombrePais}
                                                value={nombrePais}
                                            >
                                                {nombrePais}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="filtro-genero">
                                        Género
                                    </label>

                                    <select
                                        id="filtro-genero"
                                        value={genero}
                                        onChange={(e) =>
                                            setGenero(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Todos los géneros
                                        </option>

                                        {generos.map((valorGenero) => (
                                            <option
                                                key={valorGenero}
                                                value={valorGenero}
                                            >
                                                {nombresGenero[valorGenero] ||
                                                    valorGenero}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="edad-minima">
                                        Edad mínima
                                    </label>

                                    <input
                                        id="edad-minima"
                                        type="number"
                                        min="0"
                                        value={edadMinima}
                                        onChange={(e) =>
                                            setEdadMinima(e.target.value)
                                        }
                                        placeholder="Sin mínimo"
                                    />
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="edad-maxima">
                                        Edad máxima
                                    </label>

                                    <input
                                        id="edad-maxima"
                                        type="number"
                                        min="0"
                                        value={edadMaxima}
                                        onChange={(e) =>
                                            setEdadMaxima(e.target.value)
                                        }
                                        placeholder="Sin máximo"
                                    />
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="filtro-readmision">
                                        Readmisión
                                    </label>

                                    <select
                                        id="filtro-readmision"
                                        value={readmision}
                                        onChange={(e) =>
                                            setReadmision(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>
                                        <option value="si">
                                            Readmitidos
                                        </option>
                                        <option value="no">
                                            No readmitidos
                                        </option>
                                    </select>
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-desde">
                                        Fecha de alta desde
                                    </label>

                                    <input
                                        id="fecha-desde"
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) =>
                                            setFechaDesde(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-hasta">
                                        Fecha de alta hasta
                                    </label>

                                    <input
                                        id="fecha-hasta"
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) =>
                                            setFechaHasta(e.target.value)
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="residentes-restablecer-filtros"
                                    onClick={() => {
                                        setModulo('')
                                        setHabitacion('')
                                        setPais('')
                                        setGenero('')
                                        setEdadMinima('')
                                        setEdadMaxima('')
                                        setReadmision('')
                                        setFechaDesde('')
                                        setFechaHasta('')
                                    }}
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        )}
                    </div>

                    {residentesFiltrados.length === 0 ? (
                        <div className="residentes-vacio">
                            <p>
                                No se han encontrado residentes que coincidan con los filtros seleccionados.
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
                                                navigate(
                                                    `/residentes/${residente.id}`
                                                )
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
                                            setCurrentPage(
                                                (prev) => prev - 1
                                            )
                                        }
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {currentPage} de {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (prev) => prev + 1
                                            )
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