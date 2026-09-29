import { useEffect, useState } from 'react'
import axios from 'axios'
import './Packs.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaSearch, FaFilter } from 'react-icons/fa'

function Packs() {

    const navigate = useNavigate()
    const location = useLocation()

    const [packs, setPacks] = useState([])
    const [suministros, setSuministros] = useState([])
    const [categorias, setCategorias] = useState([])
    const [residentes, setResidentes] = useState([])

    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [categoria, setCategoria] = useState('')
    const [suministro, setSuministro] = useState('')
    const [residentesMin, setResidentesMin] = useState('')
    const [residentesMax, setResidentesMax] = useState('')
    const [orden, setOrden] = useState('nombre_asc')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    const [paginaPacks, setPaginaPacks] = useState(1)

    const [packSeleccionado, setPackSeleccionado] = useState(null)
    const [mostrarCrearPack, setMostrarCrearPack] = useState(false)
    const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false)

    const [nombrePack, setNombrePack] = useState('')
    const [descripcionPack, setDescripcionPack] = useState('')
    const [contenidoPack, setContenidoPack] = useState([
        { suministro: '', cantidad: 1, categoria: '' }
    ])

    const [errores, setErrores] = useState({})
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const categoriasDisponibles = [
        ...new Set(
            packs.flatMap((pack) =>
                (pack.contenido || [])
                    .map(
                        (contenido) =>
                            contenido.suministro_categoria_nombre
                    )
                    .filter(Boolean)
            )
        )
    ].sort((a, b) =>
        normalizarTexto(a).localeCompare(normalizarTexto(b))
    )

    const suministrosDisponibles = [
        ...new Map(
            packs
                .flatMap((pack) => pack.contenido || [])
                .filter((contenido) => {
                    if (!contenido.suministro_nombre) {
                        return false
                    }

                    if (
                        categoria !== '' &&
                        contenido.suministro_categoria_nombre !== categoria
                    ) {
                        return false
                    }

                    return true
                })
                .map((contenido) => [
                    contenido.suministro,
                    contenido.suministro_nombre
                ])
        )
    ]
        .map(([id, nombre]) => ({
            id,
            nombre
        }))
        .sort((a, b) =>
            normalizarTexto(a.nombre).localeCompare(
                normalizarTexto(b.nombre)
            )
        )

    const packsFiltrados = packs.filter((pack) => {
        const texto = normalizarTexto(terminoBusqueda)

        const nombrePack = normalizarTexto(
            pack.nombre || ''
        )

        const descripcionPack = normalizarTexto(
            pack.descripcion || ''
        )

        const coincideSuministroBusqueda = (
            pack.contenido || []
        ).some((contenido) => {
            const nombreSuministro = normalizarTexto(
                contenido.suministro_nombre || ''
            )

            return nombreSuministro.includes(texto)
        })

        const coincideBusqueda =
            texto === '' ||
            nombrePack.includes(texto) ||
            descripcionPack.includes(texto) ||
            coincideSuministroBusqueda

        const coincideCategoria =
            categoria === '' ||
            (pack.contenido || []).some(
                (contenido) =>
                    contenido.suministro_categoria_nombre === categoria
            )

        const coincideSuministro =
            suministro === '' ||
            (pack.contenido || []).some(
                (contenido) =>
                    String(contenido.suministro) ===
                    String(suministro)
            )

        const numeroResidentes =
            pack.residentes_recibidos || 0

        let coincideResidentes = true

        if (residentesMin !== '') {
            coincideResidentes =
                coincideResidentes &&
                numeroResidentes >= Number(residentesMin)
        }

        if (residentesMax !== '') {
            coincideResidentes =
                coincideResidentes &&
                numeroResidentes <= Number(residentesMax)
        }

        return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideSuministro &&
            coincideResidentes
        )
    })

    const packsOrdenados = [...packsFiltrados].sort((a, b) => {
        const nombreA = normalizarTexto(a.nombre || '')
        const nombreB = normalizarTexto(b.nombre || '')

        const suministrosA = (a.contenido || []).length
        const suministrosB = (b.contenido || []).length

        const residentesA = a.residentes_recibidos || 0
        const residentesB = b.residentes_recibidos || 0

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

        if (orden === 'residentes_asc') {
            return residentesA - residentesB
        }

        if (orden === 'residentes_desc') {
            return residentesB - residentesA
        }

        return 0
    })

    useEffect(() => {
        setSuministro('')
    }, [categoria])

    useEffect(() => {
        setPaginaPacks(1)
    }, [
        terminoBusqueda,
        categoria,
        suministro,
        residentesMin,
        residentesMax,
        orden
    ])

    useEffect(() => {
        obtenerPacks()
        obtenerSuministros()
        obtenerCategorias()
        obtenerResidentes()

        if (location.state?.mensaje) {
            setMensaje(location.state.mensaje)

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            )
        }
    }, [])

    useEffect(() => {
        const ordenInicial = location.state?.orden

        if (!ordenInicial) {
            return
        }

        setOrden(ordenInicial)
        setPaginaPacks(1)
    }, [location.state])

    const obtenerPacks = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                '/api/suministros/packs/',
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

    const obtenerSuministros = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                '/api/suministros/suministros/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setSuministros(response.data)
        } catch (error) {
            console.error('Error al obtener los suministros:', error)
        }
    }

    const obtenerCategorias = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                '/api/suministros/categorias/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setCategorias(response.data)
        } catch (error) {
            console.error('Error al obtener las categorías:', error)
        }
    }

    const obtenerResidentes = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                '/api/residentes/listaresidentes/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setResidentes(response.data)
        } catch (error) {
            console.error('Error al obtener los residentes:', error)
        }
    }

    const abrirDetallePack = (pack) => {
        setPackSeleccionado(pack)
        setConfirmandoEliminacion(false)
        setError('')
    }

    const cerrarDetallePack = () => {
        setPackSeleccionado(null)
        setConfirmandoEliminacion(false)
    }

    const abrirCrearPack = () => {
        setNombrePack('')
        setDescripcionPack('')
        setContenidoPack([
            { suministro: '', cantidad: 1, categoria: '' }
        ])
        setErrores({})
        setError('')
        setMostrarCrearPack(true)
    }

    const cerrarCrearPack = () => {
        setMostrarCrearPack(false)
        setErrores({})
        setError('')
    }

    const cambiarContenido = (index, campo, valor) => {
        const nuevoContenido = [...contenidoPack]

        nuevoContenido[index] = {
            ...nuevoContenido[index],
            [campo]: valor
        }

        if (campo === 'categoria') {
            nuevoContenido[index].suministro = ''
        }

        setContenidoPack(nuevoContenido)

        setErrores((erroresActuales) => ({
            ...erroresActuales,
            [`suministro_${index}`]: '',
            [`cantidad_${index}`]: ''
        }))
    }

    const añadirSuministro = () => {
        setContenidoPack([
            ...contenidoPack,
            {
                suministro: '',
                cantidad: 1,
                categoria: ''
            }
        ])
    }

    const eliminarSuministro = (index) => {
        if (contenidoPack.length === 1) {
            return
        }

        setContenidoPack(
            contenidoPack.filter((_, i) => i !== index)
        )
    }

    const validarFormulario = () => {
        const nuevosErrores = {}

        if (!nombrePack.trim()) {
            nuevosErrores.nombre = 'El nombre no puede estar vacío.'
        } else if (nombrePack.length > 100) {
            nuevosErrores.nombre =
                'El nombre no puede superar los 100 caracteres.'
        }

        if (descripcionPack && !descripcionPack.trim()) {
            nuevosErrores.descripcion =
                'La descripción no puede estar formada únicamente por espacios.'
        } else if (descripcionPack.length > 500) {
            nuevosErrores.descripcion =
                'La descripción no puede superar los 500 caracteres.'
        }

        const suministrosSeleccionados = []

        contenidoPack.forEach((contenido, index) => {

            if (!contenido.suministro) {
                nuevosErrores[`suministro_${index}`] =
                    'Debes seleccionar un suministro.'
            } else if (
                suministrosSeleccionados.includes(
                    contenido.suministro
                )
            ) {
                nuevosErrores[`suministro_${index}`] =
                    'Este suministro ya está incluido en el pack.'
            } else {
                suministrosSeleccionados.push(
                    contenido.suministro
                )
            }

            if (
                contenido.cantidad === '' ||
                Number(contenido.cantidad) <= 0
            ) {
                nuevosErrores[`cantidad_${index}`] =
                    'La cantidad debe ser un número positivo.'
            }
        })

        setErrores(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const crearPack = async () => {
        setError('')
        setMensaje('')

        if (!validarFormulario()) {
            return
        }

        const token = localStorage.getItem('access')

        try {
            const response = await axios.post(
                '/api/suministros/crearpack/',
                {
                    nombre: nombrePack.trim(),
                    descripcion: descripcionPack.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const packCreado = response.data

            for (let index = 0; index < contenidoPack.length; index++) {
                const contenido = contenidoPack[index]

                await axios.post(
                    '/api/suministros/crearcontenidopack/',
                    {
                        pack: packCreado.id,
                        suministro: contenido.suministro,
                        cantidad: Number(contenido.cantidad),
                        finalizar: index === contenidoPack.length - 1
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
            }

            await obtenerPacks()

            cerrarCrearPack()

            setMensaje('Pack creado correctamente.')
        } catch (error) {
            console.error(
                'Error al crear el pack:',
                error.response?.data
            )

            const datosError = error.response?.data

            if (datosError) {
                const nuevosErrores = {}

                if (datosError.nombre) {
                    nuevosErrores.nombre =
                        Array.isArray(datosError.nombre)
                            ? datosError.nombre[0]
                            : datosError.nombre
                }

                if (datosError.descripcion) {
                    nuevosErrores.descripcion =
                        Array.isArray(datosError.descripcion)
                            ? datosError.descripcion[0]
                            : datosError.descripcion
                }

                setErrores(nuevosErrores)

                if (datosError.error) {
                    setError(datosError.error)
                }
            } else {
                setError('Ha ocurrido un error al crear el pack.')
            }
        }
    }

    const eliminarPack = async () => {
        const token = localStorage.getItem('access')

        try {
            await axios.delete(
                `/api/suministros/packs/${packSeleccionado.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setPackSeleccionado(null)
            setConfirmandoEliminacion(false)

            await obtenerPacks()

            setMensaje('Pack eliminado correctamente.')
        } catch (error) {
            console.error(
                'Error al eliminar el pack:',
                error.response?.data
            )

            setPackSeleccionado(null)
            setConfirmandoEliminacion(false)

            const mensajeError =
                error.response?.data?.error ||
                'Ha ocurrido un error al eliminar el pack.'

            setError(mensajeError)
        }
    }

    const irAAsignarPack = () => {
        navigate(`/packs/asignar/${packSeleccionado.id}`)
    }

    const obtenerSuministrosCategoria = (categoriaId) => {

        if (!categoriaId) {
            return suministros
        }

        const categoria = categorias.find(
            (categoria) =>
                String(categoria.id) === String(categoriaId)
        )

        if (!categoria) {
            return []
        }

        return categoria.suministros || []
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
        <div className="packs-container">

            <div className="packs-titulo">
                <div>
                    <h1>Packs</h1>
                    <p>
                        Gestiona los packs de suministros disponibles para los residentes
                    </p>
                </div>

                <button
                    type="button"
                    className="packs-anadir"
                    onClick={abrirCrearPack}
                >
                    +
                </button>
            </div>

            {mensaje && (
                <p className="packs-mensaje">
                    {mensaje}
                </p>
            )}

            {error && (
                <p className="packs-error">
                    {error}
                </p>
            )}

            {packs.length > 0 && (
                <div className="packs-controles">
                    <div className="packs-controles-principales">
                        <div className="packs-buscador">
                            <div className="packs-buscador-input">
                                <FaSearch className="packs-buscador-icono" />

                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o descripción..."
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
                            className={`packs-boton-filtros ${
                                mostrarFiltros
                                    ? 'packs-boton-filtros-activo'
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

                        <div className="packs-ordenacion">
                            <label htmlFor="orden-packs">
                                Ordenar por:
                            </label>

                            <select
                                id="orden-packs"
                                value={orden}
                                onChange={(evento) =>
                                    setOrden(evento.target.value)
                                }
                            >
                                <option value="nombre_asc">
                                    Nombre A-Z
                                </option>
                                <option value="nombre_desc">
                                    Nombre Z-A
                                </option>
                                <option value="suministros_asc">
                                    Número de suministros: menor a mayor
                                </option>
                                <option value="suministros_desc">
                                    Número de suministros: mayor a menor
                                </option>
                                <option value="residentes_asc">
                                    Residentes con el pack: menor a mayor
                                </option>
                                <option value="residentes_desc">
                                    Residentes con el pack: mayor a menor
                                </option>
                            </select>
                        </div>
                    </div>

                    {mostrarFiltros && (
                        <div className="packs-panel-filtros">
                            <div className="packs-filtro">
                                <label htmlFor="filtro-categoria-packs">
                                    Categoría
                                </label>

                                <select
                                    id="filtro-categoria-packs"
                                    value={categoria}
                                    onChange={(evento) =>
                                        setCategoria(evento.target.value)
                                    }
                                >
                                    <option value="">
                                        Todas las categorías
                                    </option>

                                    {categoriasDisponibles.map(
                                        (nombreCategoria) => (
                                            <option
                                                key={nombreCategoria}
                                                value={nombreCategoria}
                                            >
                                                {nombreCategoria}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="packs-filtro">
                                <label htmlFor="filtro-suministro-packs">
                                    Suministro
                                </label>

                                <select
                                    id="filtro-suministro-packs"
                                    value={suministro}
                                    onChange={(evento) =>
                                        setSuministro(evento.target.value)
                                    }
                                >
                                    <option value="">
                                        Todos los suministros
                                    </option>

                                    {suministrosDisponibles.map(
                                        (suministroDisponible) => (
                                            <option
                                                key={suministroDisponible.id}
                                                value={suministroDisponible.id}
                                            >
                                                {
                                                    suministroDisponible.nombre
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="packs-filtro">
                                <label>
                                    Residentes con el pack
                                </label>

                                <div className="packs-filtro-rango">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Mínimo"
                                        value={residentesMin}
                                        onChange={(evento) =>
                                            setResidentesMin(
                                                evento.target.value
                                            )
                                        }
                                    />

                                    <span>–</span>

                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Máximo"
                                        value={residentesMax}
                                        onChange={(evento) =>
                                            setResidentesMax(
                                                evento.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="packs-restablecer-filtros"
                                onClick={() => {
                                    setCategoria('')
                                    setSuministro('')
                                    setResidentesMin('')
                                    setResidentesMax('')
                                }}
                            >
                                Restablecer filtros
                            </button>
                        </div>
                    )}
                </div>
            )}

            {packs.length === 0 ? (
                <div className="packs-sin-elementos">
                    <p>
                        No hay packs registrados.
                    </p>
                </div>
            ) : packsFiltrados.length === 0 ? (
                <div className="packs-vacio">
                    <p>
                        No se han encontrado packs que coincidan con los filtros seleccionados.
                    </p>
                </div>
            ) : (
                <>
                    <div className="packs-listado">
                        {packsActuales.map((pack) => (
                            <button
                                type="button"
                                className="pack-card"
                                key={pack.id}
                                onClick={() => abrirDetallePack(pack)}
                            >
                                <strong>
                                    {pack.nombre}
                                </strong>

                                <span>
                                    {pack.contenido?.length || 0}{' '}
                                    {pack.contenido?.length === 1
                                        ? 'suministro'
                                        : 'suministros'}
                                    {' · '}
                                    {pack.residentes_recibidos || 0} residentes
                                </span>
                            </button>
                        ))}
                    </div>

                    {totalPaginasPacks > 1 && (
                        <div className="packs-paginacion">
                            <button
                                type="button"
                                disabled={paginaPacks === 1}
                                onClick={() =>
                                    setPaginaPacks(
                                        (paginaActual) => paginaActual - 1
                                    )
                                }
                            >
                                Anterior
                            </button>

                            <span>
                                Página {paginaPacks} de {totalPaginasPacks}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    paginaPacks === totalPaginasPacks
                                }
                                onClick={() =>
                                    setPaginaPacks(
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

            {packSeleccionado && (
                <div className="pack-detalle-overlay">

                    <div className="pack-detalle">

                        {!confirmandoEliminacion ? (
                            <>
                                <button
                                    type="button"
                                    className="pack-detalle-cerrar"
                                    onClick={cerrarDetallePack}
                                >
                                    ×
                                </button>

                                <h2>
                                    {packSeleccionado.nombre}
                                </h2>

                                <div className="pack-detalle-descripcion">
                                    <h3>
                                        Descripción
                                    </h3>

                                    <p>
                                        {packSeleccionado.descripcion ||
                                            'Sin descripción.'}
                                    </p>
                                </div>

                                <div className="pack-residentes-recibidos">
                                    <span>
                                        Residentes con el pack
                                    </span>

                                    <strong>
                                        {packSeleccionado.residentes_recibidos}
                                    </strong>
                                </div>

                                <div className="pack-detalle-contenido">
                                    <h3>
                                        Contenido
                                    </h3>

                                    {packSeleccionado.contenido?.length > 0 ? (
                                        packSeleccionado.contenido.map(
                                            (contenido) => (
                                                <div
                                                    className="pack-suministro"
                                                    key={contenido.id}
                                                >
                                                    <span>
                                                        {contenido.suministro_nombre}
                                                    </span>

                                                    <span>
                                                        {contenido.cantidad}{' '}
                                                        {
                                                            contenido.suministro_unidad
                                                        }
                                                    </span>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <p>
                                            Este pack no contiene suministros.
                                        </p>
                                    )}
                                </div>

                                <div className="pack-detalle-botones">

                                    <button
                                        type="button"
                                        onClick={irAAsignarPack}
                                    >
                                        Asignar pack
                                    </button>

                                    <button
                                        type="button"
                                        className="pack-eliminar"
                                        onClick={() =>
                                            setConfirmandoEliminacion(true)
                                        }
                                    >
                                        Eliminar pack
                                    </button>

                                </div>
                            </>
                        ) : (
                            <div className="pack-confirmar-eliminacion">

                                <h2>
                                    Eliminar pack
                                </h2>

                                <p>
                                    ¿Seguro que quieres eliminar el pack{' '}
                                    <strong>
                                        "{packSeleccionado.nombre}"
                                    </strong>
                                    ?
                                </p>

                                <p>
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="pack-detalle-botones">

                                    <button
                                        type="button"
                                        className="pack-eliminar"
                                        onClick={eliminarPack}
                                    >
                                        Eliminar pack
                                    </button>

                                    <button
                                        type="button"
                                        className="pack-cancelar"
                                        onClick={() =>
                                            setConfirmandoEliminacion(false)
                                        }
                                    >
                                        Cancelar
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            )}

            {mostrarCrearPack && (
                <div className="crear-pack-overlay">

                    <div className="crear-pack-confirmacion">

                        <h2>
                            Crear pack
                        </h2>

                        <div className="crear-pack-campo">
                            <label>
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={nombrePack}
                                onChange={(e) => {
                                    setNombrePack(e.target.value)
                                    setErrores({
                                        ...errores,
                                        nombre: ''
                                    })
                                }}
                            />

                            {errores.nombre && (
                                <p className="crear-pack-error">
                                    {errores.nombre}
                                </p>
                            )}
                        </div>

                        <div className="crear-pack-campo">
                            <label>
                                Descripción
                            </label>

                            <textarea
                                value={descripcionPack}
                                onChange={(e) => {
                                    setDescripcionPack(e.target.value)
                                    setErrores({
                                        ...errores,
                                        descripcion: ''
                                    })
                                }}
                            />

                            {errores.descripcion && (
                                <p className="crear-pack-error">
                                    {errores.descripcion}
                                </p>
                            )}
                        </div>

                        <div className="crear-pack-contenido">

                            <div className="crear-pack-titulo-suministros">
                                <label>
                                    Suministros
                                </label>

                                <button
                                    type="button"
                                    className="crear-pack-anadir-suministro"
                                    onClick={añadirSuministro}
                                >
                                    +
                                </button>
                            </div>

                            {contenidoPack.map(
                                (contenido, index) => {

                                    const suministrosDisponibles =
                                        obtenerSuministrosCategoria(
                                            contenido.categoria
                                        )

                                    return (
                                        <div
                                            className="crear-pack-suministro"
                                            key={index}
                                        >

                                            <select
                                                value={contenido.categoria}
                                                onChange={(e) =>
                                                    cambiarContenido(
                                                        index,
                                                        'categoria',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Todas las categorías
                                                </option>

                                                {categorias.map(
                                                    (categoria) => (
                                                        <option
                                                            key={categoria.id}
                                                            value={categoria.id}
                                                        >
                                                            {categoria.nombre}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <select
                                                value={contenido.suministro}
                                                onChange={(e) =>
                                                    cambiarContenido(
                                                        index,
                                                        'suministro',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Seleccionar suministro
                                                </option>

                                                {suministrosDisponibles.map(
                                                    (suministro) => (
                                                        <option
                                                            key={suministro.id}
                                                            value={suministro.id}
                                                        >
                                                            {suministro.nombre}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <input
                                                type="number"
                                                min="1"
                                                value={contenido.cantidad}
                                                onChange={(e) =>
                                                    cambiarContenido(
                                                        index,
                                                        'cantidad',
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            {contenidoPack.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="crear-pack-eliminar-suministro"
                                                    onClick={() =>
                                                        eliminarSuministro(
                                                            index
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>
                                            )}

                                            {(errores[
                                                `suministro_${index}`
                                            ] ||
                                                errores[
                                                    `cantidad_${index}`
                                                ]) && (
                                                <p className="crear-pack-error">
                                                    {errores[
                                                        `suministro_${index}`
                                                    ] ||
                                                        errores[
                                                            `cantidad_${index}`
                                                        ]}
                                                </p>
                                            )}

                                        </div>
                                    )
                                }
                            )}

                        </div>

                        {error && (
                            <p className="crear-pack-error">
                                {error}
                            </p>
                        )}

                        <div className="crear-pack-botones">

                            <button
                                type="button"
                                onClick={crearPack}
                            >
                                Crear pack
                            </button>

                            <button
                                type="button"
                                onClick={cerrarCrearPack}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default Packs