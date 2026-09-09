import { useEffect, useState } from 'react'
import axios from 'axios'
import './Packs.css'
import { useNavigate, useLocation } from 'react-router-dom'

function Packs() {

    const navigate = useNavigate()
    const location = useLocation()

    const [packs, setPacks] = useState([])
    const [suministros, setSuministros] = useState([])
    const [categorias, setCategorias] = useState([])

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

    useEffect(() => {
        obtenerPacks()
        obtenerSuministros()
        obtenerCategorias()

        if (location.state?.mensaje) {
            setMensaje(location.state.mensaje)

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            )
        }
    }, [])

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

    const obtenerSuministros = async () => {
        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/suministros/suministros/',
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
                'http://127.0.0.1:8000/api/suministros/categorias/',
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
                'http://127.0.0.1:8000/api/suministros/crearpack/',
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

            for (const contenido of contenidoPack) {
                await axios.post(
                    'http://127.0.0.1:8000/api/suministros/crearcontenidopack/',
                    {
                        pack: packCreado.id,
                        suministro: contenido.suministro,
                        cantidad: Number(contenido.cantidad)
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
            } else {
                setError('Ha ocurrido un error al crear el pack.')
            }
        }
    }

    const eliminarPack = async () => {
        const token = localStorage.getItem('access')

        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/suministros/packs/${packSeleccionado.id}/eliminar/`,
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

    return (
        <div className="packs-container">

            <div className="packs-titulo">
                <div>
                    <h1>Packs</h1>
                    <p>
                        Gestiona los packs de suministros disponibles
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

            {packs.length === 0 ? (
                <div className="packs-sin-elementos">
                    <p>
                        No hay packs registrados.
                    </p>
                </div>
            ) : (
                <div className="packs-listado">
                    {packs.map((pack) => (
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
                            </span>
                        </button>
                    ))}
                </div>
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

                                <div className="pack-detalle-informacion">

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