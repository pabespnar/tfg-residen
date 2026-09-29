import { useEffect, useState } from 'react'
import axios from 'axios'
import './HistoricoResidentes.css'
import { FaSearch, FaFilter } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'

function HistoricoResidentes() {
    const [residentes, setResidentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [pais, setPais] = useState('')
    const [genero, setGenero] = useState('')
    const [edadMinima, setEdadMinima] = useState('')
    const [edadMaxima, setEdadMaxima] = useState('')
    const [estanciaMinima, setEstanciaMinima] = useState('')
    const [estanciaMaxima, setEstanciaMaxima] = useState('')
    const [fechaAltaDesde, setFechaAltaDesde] = useState('')
    const [fechaAltaHasta, setFechaAltaHasta] = useState('')
    const [fechaBajaDesde, setFechaBajaDesde] = useState('')
    const [fechaBajaHasta, setFechaBajaHasta] = useState('')
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

    const calcularEstanciaDias = (fechaAlta, fechaBaja) => {
        if (!fechaAlta || !fechaBaja) {
            return null
        }

        const alta = new Date(`${fechaAlta}T00:00:00`)
        const baja = new Date(`${fechaBaja}T00:00:00`)

        const diferencia = baja.getTime() - alta.getTime()

        return Math.round(
            diferencia / (1000 * 60 * 60 * 24)
        )
    }

    const formatearEstancia = (dias) => {
        if (dias === null) {
            return 'Sin datos'
        }

        if (dias < 30) {
            return `${dias} días`
        }

        const meses = Math.floor(dias / 30)

        if (meses < 12) {
            return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
        }

        const años = Math.floor(meses / 12)
        const mesesRestantes = meses % 12

        if (mesesRestantes === 0) {
            return `${años} ${años === 1 ? 'año' : 'años'}`
        }

        return `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${
            mesesRestantes === 1 ? 'mes' : 'meses'
        }`
    }

    const estancias = residentes
        .map((residente) =>
            calcularEstanciaDias(
                residente.f_alta,
                residente.f_baja
            )
        )
        .filter((estancia) => estancia !== null)

    const estanciaMedia =
        estancias.length > 0
            ? Math.round(
                estancias.reduce(
                    (total, estancia) => total + estancia,
                    0
                ) / estancias.length
            )
            : null

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

        const estancia = calcularEstanciaDias(
            residente.f_alta,
            residente.f_baja
        )

        const coincideEstanciaMinima =
            estanciaMinima === '' ||
            (estancia !== null && estancia >= Number(estanciaMinima))

        const coincideEstanciaMaxima =
            estanciaMaxima === '' ||
            (estancia !== null && estancia <= Number(estanciaMaxima))

        const coincidePais =
            pais === '' ||
            residente.pais === pais

        const coincideGenero =
            genero === '' ||
            residente.genero === genero

        const coincideFechaAltaDesde =
            fechaAltaDesde === '' ||
            residente.f_alta >= fechaAltaDesde

        const coincideFechaAltaHasta =
            fechaAltaHasta === '' ||
            residente.f_alta <= fechaAltaHasta

        const coincideFechaBajaDesde =
            fechaBajaDesde === '' ||
            residente.f_baja >= fechaBajaDesde

        const coincideFechaBajaHasta =
            fechaBajaHasta === '' ||
            residente.f_baja <= fechaBajaHasta

        return (
            coincideBusqueda &&
            coincideEdadMinima &&
            coincideEdadMaxima &&
            coincideEstanciaMinima &&
            coincideEstanciaMaxima &&
            coincidePais &&
            coincideGenero &&
            coincideFechaAltaDesde &&
            coincideFechaAltaHasta &&
            coincideFechaBajaDesde &&
            coincideFechaBajaHasta
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

            case 'edad_asc':
            case 'edad_desc':
                valorA = calcularEdad(a.f_nacimiento)
                valorB = calcularEdad(b.f_nacimiento)

                if (valorA === null) valorA = -1
                if (valorB === null) valorB = -1
                break

            case 'estancia_asc':
            case 'estancia_desc':
                valorA = calcularEstanciaDias(
                    a.f_alta,
                    a.f_baja
                )

                valorB = calcularEstanciaDias(
                    b.f_alta,
                    b.f_baja
                )

                if (valorA === null) valorA = -1
                if (valorB === null) valorB = -1
                break

            case 'alta_asc':
            case 'alta_desc':
                valorA = a.f_alta || ''
                valorB = b.f_alta || ''
                break

            case 'baja_asc':
            case 'baja_desc':
                valorA = a.f_baja || ''
                valorB = b.f_baja || ''
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
                    'http://127.0.0.1:8000/api/residentes/historicoresidentes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setResidentes(response.data)
            } catch (error) {
                console.error(
                    'Error al obtener el histórico de residentes:',
                    error
                )

                setError(
                    'No se ha podido cargar el histórico de residentes.'
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

        if (filtros.edad !== undefined) {
            const partesEdad = filtros.edad.split('-')

            if (partesEdad.length === 2) {
                setEdadMinima(partesEdad[0])
                setEdadMaxima(partesEdad[1])
            }
        }

        if (filtros.estancia !== undefined) {
            switch (filtros.estancia) {
                case 'Menos de 1 mes':
                    setEstanciaMinima('0')
                    setEstanciaMaxima('29')
                    break

                case '1-3 meses':
                    setEstanciaMinima('30')
                    setEstanciaMaxima('89')
                    break

                case '3-6 meses':
                    setEstanciaMinima('90')
                    setEstanciaMaxima('179')
                    break

                case '6-12 meses':
                    setEstanciaMinima('180')
                    setEstanciaMaxima('364')
                    break

                case '12 meses o más':
                    setEstanciaMinima('365')
                    setEstanciaMaxima('')
                    break

                default:
                    break
            }
        }

        if (filtros.fechaBajaDesde !== undefined) {
            setFechaBajaDesde(filtros.fechaBajaDesde)
        }

        if (filtros.fechaBajaHasta !== undefined) {
            setFechaBajaHasta(filtros.fechaBajaHasta)
        }

        if (
            filtros.edad !== undefined ||
            filtros.estancia !== undefined ||
            filtros.fechaBajaDesde !== undefined ||
            filtros.fechaBajaHasta !== undefined
        ) {
            setMostrarFiltros(true)
        }

        navigate(location.pathname, {
            replace: true,
            state: null
        })
    }, [location, navigate])

    useEffect(() => {
        setCurrentPage(1)
    }, [
        terminoBusqueda,
        pais,
        genero,
        edadMinima,
        edadMaxima,
        estanciaMinima,
        estanciaMaxima,
        fechaAltaDesde,
        fechaAltaHasta,
        fechaBajaDesde,
        fechaBajaHasta,
        orden
    ])

    const obtenerGenero = (genero) => {
        if (genero === 'M') {
            return 'Masculino'
        }

        if (genero === 'F') {
            return 'Femenino'
        }

        if (genero === 'O') {
            return 'Otro'
        }

        return 'Sin especificar'
    }

    if (loading) {
        return (
            <div className="residentes-container">
                <p>Cargando histórico de residentes...</p>
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
                    <h1>Histórico de residentes</h1>
                    <p>
                        Consulta de los residentes dados de baja del centro
                    </p>

                    {estanciaMedia !== null && (
                        <p className="residentes-estancia-media">
                            <span className="residentes-estancia-media-label">Estancia media por residente de</span>
                            <span className="residentes-estancia-media-valor">
                                {formatearEstancia(estanciaMedia)}
                            </span>
                        </p>
                    )}
                </div>
            </div>

            {residentes.length === 0 ? (
                <div className="residentes-vacio">
                    <p>
                        No hay residentes dados de baja registrados.
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
                                    <option value="edad_asc">
                                        Edad menor a mayor
                                    </option>
                                    <option value="edad_desc">
                                        Edad mayor a menor
                                    </option>
                                    <option value="estancia_asc">
                                        Estancia más corta
                                    </option>
                                    <option value="estancia_desc">
                                        Estancia más larga
                                    </option>
                                    <option value="alta_asc">
                                        Fecha de alta más antigua
                                    </option>
                                    <option value="alta_desc">
                                        Fecha de alta más reciente
                                    </option>
                                    <option value="baja_asc">
                                        Fecha de baja más antigua
                                    </option>
                                    <option value="baja_desc">
                                        Fecha de baja más reciente
                                    </option>
                                </select>
                            </div>
                        </div>

                        {mostrarFiltros && (
                            <div className="residentes-panel-filtros">
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
                                    <label htmlFor="estancia-minima">
                                        Estancia mínima (días)
                                    </label>

                                    <input
                                        id="estancia-minima"
                                        type="number"
                                        min="0"
                                        value={estanciaMinima}
                                        onChange={(e) =>
                                            setEstanciaMinima(e.target.value)
                                        }
                                        placeholder="Sin mínimo"
                                    />
                                </div>

                                <div className="residentes-filtro">
                                    <label htmlFor="estancia-maxima">
                                        Estancia máxima (días)
                                    </label>

                                    <input
                                        id="estancia-maxima"
                                        type="number"
                                        min="0"
                                        value={estanciaMaxima}
                                        onChange={(e) =>
                                            setEstanciaMaxima(e.target.value)
                                        }
                                        placeholder="Sin máximo"
                                    />
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-alta-desde">
                                        Fecha de alta desde
                                    </label>

                                    <input
                                        id="fecha-alta-desde"
                                        type="date"
                                        value={fechaAltaDesde}
                                        onChange={(e) =>
                                            setFechaAltaDesde(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-alta-hasta">
                                        Fecha de alta hasta
                                    </label>

                                    <input
                                        id="fecha-alta-hasta"
                                        type="date"
                                        value={fechaAltaHasta}
                                        onChange={(e) =>
                                            setFechaAltaHasta(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-baja-desde">
                                        Fecha de baja desde
                                    </label>

                                    <input
                                        id="fecha-baja-desde"
                                        type="date"
                                        value={fechaBajaDesde}
                                        onChange={(e) =>
                                            setFechaBajaDesde(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="residentes-filtro residentes-filtro-fecha">
                                    <label htmlFor="fecha-baja-hasta">
                                        Fecha de baja hasta
                                    </label>

                                    <input
                                        id="fecha-baja-hasta"
                                        type="date"
                                        value={fechaBajaHasta}
                                        onChange={(e) =>
                                            setFechaBajaHasta(e.target.value)
                                        }
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="residentes-restablecer-filtros"
                                    onClick={() => {
                                        setPais('')
                                        setGenero('')
                                        setEdadMinima('')
                                        setEdadMaxima('')
                                        setEstanciaMinima('')
                                        setEstanciaMaxima('')
                                        setFechaAltaDesde('')
                                        setFechaAltaHasta('')
                                        setFechaBajaDesde('')
                                        setFechaBajaHasta('')
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
                                        <th>Género</th>
                                        <th>Fecha de alta</th>
                                        <th>Fecha de baja</th>
                                        <th>Estancia</th>
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
                                                {obtenerGenero(
                                                    residente.genero
                                                )}
                                            </td>

                                            <td>
                                                {residente.f_alta}
                                            </td>

                                            <td>
                                                {residente.f_baja}
                                            </td>

                                            <td>
                                                {formatearEstancia(
                                                    calcularEstanciaDias(
                                                        residente.f_alta,
                                                        residente.f_baja
                                                    )
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

export default HistoricoResidentes