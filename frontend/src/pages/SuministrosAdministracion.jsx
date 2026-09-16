import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaTrash, FaSearch } from 'react-icons/fa'
import './SuministrosAdministracion.css'

function SuministrosAdministracion() {

    const [suministros, setSuministros] = useState([])
    const [suministrosAbiertos, setSuministrosAbiertos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [paginaSuministros, setPaginaSuministros] = useState(1)
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('nombre_asc')

    const suministrosPorPagina = 9

    const indiceUltimoSuministro =
        paginaSuministros * suministrosPorPagina

    const indicePrimerSuministro =
        indiceUltimoSuministro - suministrosPorPagina

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const suministrosFiltrados = suministros.filter((suministro) => {

        const texto = normalizarTexto(terminoBusqueda)

        const nombreSuministro = normalizarTexto(
            suministro.nombre || ''
        )

        return (
            texto === '' ||
            nombreSuministro.includes(texto)
        )
    })

    const suministrosOrdenados = [...suministrosFiltrados].sort((a, b) => {

        const nombreA = normalizarTexto(a.nombre || '')
        const nombreB = normalizarTexto(b.nombre || '')

        const unidadA = normalizarTexto(a.unidad || '')
        const unidadB = normalizarTexto(b.unidad || '')

        const expedientesA = (a.expedientes || []).length
        const expedientesB = (b.expedientes || []).length

        if (orden === 'nombre_asc') {
            return nombreA.localeCompare(nombreB)
        }

        if (orden === 'nombre_desc') {
            return nombreB.localeCompare(nombreA)
        }

        if (orden === 'unidad_asc') {
            return unidadA.localeCompare(unidadB)
        }

        if (orden === 'unidad_desc') {
            return unidadB.localeCompare(unidadA)
        }

        if (orden === 'expedientes_asc') {
            return expedientesA - expedientesB
        }

        if (orden === 'expedientes_desc') {
            return expedientesB - expedientesA
        }

        return 0
    })

    useEffect(() => {
        setPaginaSuministros(1)
    }, [terminoBusqueda, orden])

    const suministrosActuales = suministrosOrdenados.slice(
        indicePrimerSuministro,
        indiceUltimoSuministro
    )

    const totalPaginasSuministros = Math.ceil(
        suministrosOrdenados.length / suministrosPorPagina
    )

    const [modalCrearSuministroAbierto, setModalCrearSuministroAbierto] =
        useState(false)

    const [nombreCrearSuministro, setNombreCrearSuministro] =
        useState('')

    const [unidadCrearSuministro, setUnidadCrearSuministro] =
        useState('')

    const [errorCrearSuministro, setErrorCrearSuministro] =
        useState('')

    const [creandoSuministro, setCreandoSuministro] =
        useState(false)

    const [modalEliminarSuministroAbierto, setModalEliminarSuministroAbierto] =
        useState(false)

    const [suministroEliminar, setSuministroEliminar] =
        useState(null)

    const [errorEliminarSuministro, setErrorEliminarSuministro] =
        useState('')

    const [eliminandoSuministro, setEliminandoSuministro] =
        useState(false)

    useEffect(() => {
        obtenerSuministros()
    }, [])

    const obtenerSuministros = async () => {

        try {

            const token = localStorage.getItem('access')

            const respuesta = await axios.get(
                'http://127.0.0.1:8000/api/suministros/suministros/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setSuministros(respuesta.data)

        } catch (error) {

            console.error(error)
            setError('No se han podido cargar los suministros.')

        } finally {

            setCargando(false)
        }
    }

    const alternarSuministro = (suministroId) => {

        setSuministrosAbiertos((estadoAnterior) => ({
            ...estadoAnterior,
            [suministroId]: !estadoAnterior[suministroId],
        }))
    }

    const crearSuministro = async () => {

        setErrorCrearSuministro('')

        if (!nombreCrearSuministro.trim()) {
            setErrorCrearSuministro(
                'El nombre no puede estar vacío.'
            )
            return
        }

        if (!unidadCrearSuministro.trim()) {
            setErrorCrearSuministro(
                'La unidad no puede estar vacía.'
            )
            return
        }

        try {

            setCreandoSuministro(true)

            const token = localStorage.getItem('access')

            await axios.post(
                'http://127.0.0.1:8000/api/suministros/crearsuministro/',
                {
                    nombre: nombreCrearSuministro,
                    unidad: unidadCrearSuministro,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setModalCrearSuministroAbierto(false)
            setNombreCrearSuministro('')
            setUnidadCrearSuministro('')
            setErrorCrearSuministro('')

            await obtenerSuministros()

        } catch (error) {

            console.error(error)

            if (error.response?.data) {

                const errores = error.response.data

                if (errores.nombre) {
                    setErrorCrearSuministro(
                        errores.nombre[0]
                    )
                } else if (errores.unidad) {
                    setErrorCrearSuministro(
                        errores.unidad[0]
                    )
                } else {
                    setErrorCrearSuministro(
                        'No se ha podido crear el suministro.'
                    )
                }

            } else {

                setErrorCrearSuministro(
                    'No se ha podido crear el suministro.'
                )
            }

        } finally {

            setCreandoSuministro(false)
        }
    }

    const abrirModalEliminarSuministro = (suministro) => {

        setSuministroEliminar(suministro)
        setErrorEliminarSuministro('')
        setModalEliminarSuministroAbierto(true)
    }

    const cerrarModalEliminarSuministro = () => {

        setSuministroEliminar(null)
        setErrorEliminarSuministro('')
        setModalEliminarSuministroAbierto(false)
    }

    const eliminarSuministro = async () => {

        setErrorEliminarSuministro('')

        try {

            setEliminandoSuministro(true)

            const token = localStorage.getItem('access')

            await axios.delete(
                `http://127.0.0.1:8000/api/suministros/${suministroEliminar.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setModalEliminarSuministroAbierto(false)
            setSuministroEliminar(null)

            await obtenerSuministros()

        } catch (error) {

            console.error(error)

            if (error.response?.data?.error) {

                setErrorEliminarSuministro(
                    error.response.data.error
                )

            } else {

                setErrorEliminarSuministro(
                    'No se ha podido eliminar el suministro.'
                )
            }

        } finally {

            setEliminandoSuministro(false)
        }
    }

    return (
        <div className="suministros-administracion-container">

            <div className="suministros-administracion-titulo">

                <div>

                    <h1>Suministros</h1>

                    <p>
                        Consulta los suministros y los expedientes asociados.
                    </p>

                </div>

                <button
                    type="button"
                    className="suministros-administracion-boton-anadir"
                    onClick={() => {
                        setNombreCrearSuministro('')
                        setUnidadCrearSuministro('')
                        setErrorCrearSuministro('')
                        setModalCrearSuministroAbierto(true)
                    }}
                >
                    +
                </button>

            </div>

            {cargando && (
                <p className="suministros-administracion-mensaje">
                    Cargando suministros...
                </p>
            )}

            {error && (
                <p className="suministros-administracion-error">
                    {error}
                </p>
            )}

            {!cargando && !error && suministros.length > 0 && (

                <div className="suministros-administracion-controles">

                    <div className="suministros-administracion-buscador">

                        <div className="suministros-administracion-buscador-input">

                            <FaSearch className="suministros-administracion-buscador-icono" />

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

                    <div className="suministros-administracion-ordenacion">

                        <label htmlFor="orden-suministros-administracion">
                            Ordenar por:
                        </label>

                        <select
                            id="orden-suministros-administracion"
                            value={orden}
                            onChange={(evento) =>
                                setOrden(evento.target.value)
                            }
                        >
                            <option value="nombre_asc">
                                Suministro A-Z
                            </option>

                            <option value="nombre_desc">
                                Suministro Z-A
                            </option>

                            <option value="unidad_asc">
                                Unidad A-Z
                            </option>

                            <option value="unidad_desc">
                                Unidad Z-A
                            </option>

                            <option value="expedientes_asc">
                                Número de expedientes: menor a mayor
                            </option>

                            <option value="expedientes_desc">
                                Número de expedientes: mayor a menor
                            </option>
                        </select>

                    </div>

                </div>

            )}

            {!cargando && !error && (

                suministros.length === 0 ? (

                    <div className="suministros-administracion-vacio">
                        No hay suministros registrados.
                    </div>

                ) : suministrosActuales.length === 0 ? (

                    <div className="suministros-administracion-vacio">
                        No se han encontrado suministros que coincidan con la búsqueda.
                    </div>

                ) : (

                    <div className="suministros-administracion-lista">

                        {suministrosActuales.map((suministro) => {

                            const abierto =
                                suministrosAbiertos[suministro.id] || false

                            return (

                                <div
                                    key={suministro.id}
                                    className={
                                        abierto
                                            ? 'suministro-administracion-card suministro-administracion-card-abierto'
                                            : 'suministro-administracion-card'
                                    }
                                >

                                    <div className="suministro-administracion-cabecera">

                                        <button
                                            type="button"
                                            className="suministro-administracion-cabecera-boton"
                                            onClick={() =>
                                                alternarSuministro(
                                                    suministro.id
                                                )
                                            }
                                        >

                                            <div className="suministro-administracion-informacion">

                                                <h2>
                                                    {suministro.nombre}
                                                </h2>

                                                <p>
                                                    Unidad: {suministro.unidad}
                                                </p>

                                            </div>

                                            <span className="suministro-administracion-flecha">
                                                {abierto
                                                    ? '⌄'
                                                    : '›'}
                                            </span>

                                        </button>

                                        <button
                                            type="button"
                                            className="suministro-administracion-boton-eliminar"
                                            onClick={() =>
                                                abrirModalEliminarSuministro(
                                                    suministro
                                                )
                                            }
                                        >
                                            <FaTrash />
                                        </button>

                                    </div>

                                    {abierto && (

                                        <div className="suministro-administracion-expedientes">

                                            <h3>
                                                Expedientes
                                            </h3>

                                            {suministro.expedientes.length === 0 ? (

                                                <p className="suministro-administracion-sin-expedientes">
                                                    Este suministro no tiene expedientes asociados.
                                                </p>

                                            ) : (

                                                <div className="suministro-administracion-expedientes-lista">

                                                    {suministro.expedientes.map(
                                                        (expediente) => (

                                                            <div
                                                                key={expediente.id}
                                                                className="suministro-administracion-expediente"
                                                            >

                                                                <div>

                                                                    <h4>
                                                                        {expediente.nombre}
                                                                    </h4>

                                                                    <p>
                                                                        {expediente.proveedor_nombre}
                                                                        {' '}
                                                                        {expediente.precio_unidad} €/{suministro.unidad}
                                                                    </p>

                                                                </div>

                                                                <span
                                                                    className={
                                                                        expediente.activo
                                                                            ? 'suministro-administracion-estado activo'
                                                                            : 'suministro-administracion-estado finalizado'
                                                                    }
                                                                >
                                                                    {expediente.activo
                                                                        ? 'Activo'
                                                                        : 'Inactivo'}
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    )}

                                </div>

                            )
                        })}

                    </div>

                )

            )}

            {totalPaginasSuministros > 1 && (
                <div className="suministros-administracion-paginacion">

                    <button
                        type="button"
                        disabled={paginaSuministros === 1}
                        onClick={() =>
                            setPaginaSuministros(
                                (paginaActual) => paginaActual - 1
                            )
                        }
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaSuministros} de {totalPaginasSuministros}
                    </span>

                    <button
                        type="button"
                        disabled={
                            paginaSuministros === totalPaginasSuministros
                        }
                        onClick={() =>
                            setPaginaSuministros(
                                (paginaActual) => paginaActual + 1
                            )
                        }
                    >
                        Siguiente
                    </button>

                </div>
            )}

            {modalCrearSuministroAbierto && (

                <div className="suministros-administracion-modal-crear-fondo">

                    <div className="suministros-administracion-modal-crear">

                        <h2>
                            Crear suministro
                        </h2>

                        <div className="suministros-administracion-modal-crear-campo">

                            <label>
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={nombreCrearSuministro}
                                onChange={(e) =>
                                    setNombreCrearSuministro(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="suministros-administracion-modal-crear-campo">

                            <label>
                                Unidad
                            </label>

                            <input
                                type="text"
                                value={unidadCrearSuministro}
                                onChange={(e) =>
                                    setUnidadCrearSuministro(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {errorCrearSuministro && (
                            <p className="suministros-administracion-modal-crear-error">
                                {errorCrearSuministro}
                            </p>
                        )}

                        <div className="suministros-administracion-modal-crear-botones">

                            <button
                                type="button"
                                className="suministros-administracion-modal-crear-cancelar"
                                onClick={() =>
                                    setModalCrearSuministroAbierto(false)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="suministros-administracion-modal-crear-confirmar"
                                onClick={crearSuministro}
                                disabled={creandoSuministro}
                            >
                                {creandoSuministro
                                    ? 'Creando...'
                                    : 'Crear'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {modalEliminarSuministroAbierto && (

                <div className="eliminar-suministro-overlay">

                    <div className="eliminar-suministro-confirmacion">

                        <h2>
                            ¿Seguro?
                        </h2>

                        <p>
                            ¿Quieres eliminar el suministro{' '}
                            <strong>
                                {suministroEliminar?.nombre}
                            </strong>?
                        </p>

                        {errorEliminarSuministro && (
                            <p className="eliminar-suministro-error">
                                {errorEliminarSuministro}
                            </p>
                        )}

                        <div className="eliminar-suministro-botones">

                            <button
                                type="button"
                                onClick={cerrarModalEliminarSuministro}
                                disabled={eliminandoSuministro}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={eliminarSuministro}
                                disabled={eliminandoSuministro}
                            >
                                {eliminandoSuministro
                                    ? 'Eliminando...'
                                    : 'Eliminar'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default SuministrosAdministracion