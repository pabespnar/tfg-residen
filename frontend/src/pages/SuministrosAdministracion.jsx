import { useEffect, useState } from 'react'
import axios from 'axios'
import { FaTrash } from 'react-icons/fa'
import './SuministrosAdministracion.css'

function SuministrosAdministracion() {

    const [suministros, setSuministros] = useState([])
    const [suministrosAbiertos, setSuministrosAbiertos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [modalCrearSuministroAbierto, setModalCrearSuministroAbierto] =
        useState(false)
    const [nombreCrearSuministro, setNombreCrearSuministro] = useState('')
    const [unidadCrearSuministro, setUnidadCrearSuministro] = useState('')
    const [errorCrearSuministro, setErrorCrearSuministro] = useState('')
    const [creandoSuministro, setCreandoSuministro] = useState(false)

    const [modalEliminarSuministroAbierto, setModalEliminarSuministroAbierto] =
        useState(false)
    const [suministroEliminar, setSuministroEliminar] = useState(null)
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

            {!cargando && !error && (

                <div className="suministros-administracion-lista">

                    {suministros.map((suministro) => {

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