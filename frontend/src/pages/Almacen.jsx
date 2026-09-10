import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Almacen.css'

function Almacen() {

    const navigate = useNavigate()

    const [mostrarNuevaBaja, setMostrarNuevaBaja] = useState(false)

    const [suministros, setSuministros] = useState([])
    const [categorias, setCategorias] = useState([])

    const [categoria, setCategoria] = useState('')
    const [suministro, setSuministro] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [servicio, setServicio] = useState('')
    const [observaciones, setObservaciones] = useState('')

    const [erroresBaja, setErroresBaja] = useState({})
    const [creandoBaja, setCreandoBaja] = useState(false)

    const abrirNuevaBaja = async () => {

        setMostrarNuevaBaja(true)
        setErroresBaja({})

        try {

            const token = localStorage.getItem('access')

            const responseSuministros = await axios.get(
                'http://127.0.0.1:8000/api/suministros/suministros',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log(
                'SUMINISTROS:',
                responseSuministros.data
            )

            const responseCategorias = await axios.get(
                'http://127.0.0.1:8000/api/suministros/categorias/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log(
                'CATEGORIAS:',
                responseCategorias.data
            )

            setSuministros(responseSuministros.data)
            setCategorias(responseCategorias.data)

        } catch (error) {

            console.error(
                'ERROR:',
                error
            )

            console.error(
                'RESPUESTA:',
                error.response?.data
            )

            console.error(
                'STATUS:',
                error.response?.status
            )

            setErroresBaja({
                general: 'No se han podido cargar los suministros.'
            })
        }
    }

    const cerrarNuevaBaja = () => {

        setMostrarNuevaBaja(false)

        setCategoria('')
        setSuministro('')
        setCantidad('')
        setServicio('')
        setObservaciones('')

        setErroresBaja({})
        setCreandoBaja(false)
    }

    const cambiarCategoria = (valor) => {

        setCategoria(valor)
        setSuministro('')

        setErroresBaja((erroresActuales) => ({
            ...erroresActuales,
            suministro: ''
        }))
    }

    const obtenerSuministrosCategoria = (categoriaId) => {

        if (!categoriaId) {
            return suministros
        }

        const categoriaSeleccionada = categorias.find(
            (categoria) =>
                String(categoria.id) === String(categoriaId)
        )

        if (!categoriaSeleccionada) {
            return []
        }

        return categoriaSeleccionada.suministros || []
    }

    const crearBaja = async (e) => {

        e.preventDefault()

        setErroresBaja({})

        const nuevosErrores = {}

        if (!suministro) {
            nuevosErrores.suministro = 'Debes seleccionar un suministro.'
        }

        if (!cantidad || Number(cantidad) <= 0) {
            nuevosErrores.cantidad = 'La cantidad debe ser mayor que 0.'
        }

        if (!servicio) {
            nuevosErrores.servicio = 'Debes seleccionar un servicio.'
        }

        if (!observaciones.trim()) {
            nuevosErrores.observaciones =
                'Las bajas extraordinarias requieren observaciones.'
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErroresBaja(nuevosErrores)
            return
        }

        try {

            setCreandoBaja(true)

            const token = localStorage.getItem('access')

            await axios.post(
                'http://127.0.0.1:8000/api/almacen/crearbajaextraordinaria/',
                {
                    suministro: Number(suministro),
                    cantidad: Number(cantidad),
                    servicio: servicio,
                    observaciones: observaciones.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            cerrarNuevaBaja()

        } catch (error) {

            if (error.response?.data) {

                const erroresServidor = error.response.data

                if (erroresServidor.error) {
                    setErroresBaja({
                        general: erroresServidor.error
                    })
                } else {
                    setErroresBaja(erroresServidor)
                }

            } else {

                setErroresBaja({
                    general: 'No se ha podido registrar la baja.'
                })
            }

        } finally {

            setCreandoBaja(false)
        }
    }

    return (
        <div className="almacen-container">

            <h1>Gestión de almacén</h1>

            <div className="almacen-seccion">

                <h2>Gestionar movimientos</h2>

                <div className="almacen-botones">

                    <button
                        className="almacen-boton"
                        onClick={abrirNuevaBaja}
                    >
                        <span className="almacen-boton-titulo">
                            Nueva baja
                        </span>

                        <span className="almacen-boton-descripcion">
                            Registrar una salida extraordinaria de almacén
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/nueva-alta')}
                    >
                        <span className="almacen-boton-titulo">
                            Nueva alta
                        </span>

                        <span className="almacen-boton-descripcion">
                            Registrar una entrada de suministros
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/bajas')}
                    >
                        <span className="almacen-boton-titulo">
                            Ver bajas
                        </span>

                        <span className="almacen-boton-descripcion">
                            Consultar las salidas registradas en el almacén
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/altas')}
                    >
                        <span className="almacen-boton-titulo">
                            Ver altas
                        </span>

                        <span className="almacen-boton-descripcion">
                            Consultar las entradas registradas en el almacén
                        </span>
                    </button>

                </div>

            </div>

            {mostrarNuevaBaja && (

                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>Nueva baja</h2>

                        <form onSubmit={crearBaja}>

                            <div className="crear-modulo-campo">

                                <label>
                                    Categoría
                                </label>

                                <select
                                    value={categoria}
                                    onChange={(e) =>
                                        cambiarCategoria(e.target.value)
                                    }
                                >
                                    <option value="">
                                        Todas las categorías
                                    </option>

                                    {categorias.map((categoriaItem) => (
                                        <option
                                            key={categoriaItem.id}
                                            value={categoriaItem.id}
                                        >
                                            {categoriaItem.nombre}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div className="crear-modulo-campo">

                                <label>
                                    Suministro
                                </label>

                                <select
                                    value={suministro}
                                    onChange={(e) => {
                                        setSuministro(e.target.value)
                                        setErroresBaja({
                                            ...erroresBaja,
                                            suministro: ''
                                        })
                                    }}
                                >
                                    <option value="">
                                        Selecciona un suministro
                                    </option>

                                    {obtenerSuministrosCategoria(
                                        categoria
                                    ).map((suministroItem) => (
                                        <option
                                            key={suministroItem.id}
                                            value={suministroItem.id}
                                        >
                                            {suministroItem.nombre}
                                        </option>
                                    ))}

                                </select>

                                {erroresBaja.suministro && (
                                    <span className="crear-modulo-error">
                                        {erroresBaja.suministro}
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>
                                    Cantidad
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={cantidad}
                                    onChange={(e) =>
                                        setCantidad(e.target.value)
                                    }
                                />

                                {erroresBaja.cantidad && (
                                    <span className="crear-modulo-error">
                                        {erroresBaja.cantidad}
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>
                                    Servicio
                                </label>

                                <select
                                    value={servicio}
                                    onChange={(e) =>
                                        setServicio(e.target.value)
                                    }
                                >
                                    <option value="">
                                        Selecciona un servicio
                                    </option>

                                    <option value="LIMPIEZA">
                                        Limpieza
                                    </option>

                                    <option value="COMIDA">
                                        Comida
                                    </option>

                                    <option value="SANITARIO">
                                        Sanitario
                                    </option>

                                    <option value="MANTENIMIENTO">
                                        Mantenimiento
                                    </option>

                                    <option value="LAVANDERIA">
                                        Lavandería
                                    </option>

                                    <option value="ADMINISTRACION">
                                        Administración
                                    </option>

                                    <option value="ATENCION_RESIDENTES">
                                        Atención a residentes
                                    </option>

                                    <option value="OTROS">
                                        Otros
                                    </option>

                                </select>

                                {erroresBaja.servicio && (
                                    <span className="crear-modulo-error">
                                        {erroresBaja.servicio}
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>
                                    Observaciones
                                </label>

                                <textarea
                                    value={observaciones}
                                    onChange={(e) =>
                                        setObservaciones(e.target.value)
                                    }
                                    rows="4"
                                />

                                {erroresBaja.observaciones && (
                                    <span className="crear-modulo-error">
                                        {erroresBaja.observaciones}
                                    </span>
                                )}

                            </div>

                            {erroresBaja.general && (
                                <div className="crear-modulo-error">
                                    {erroresBaja.general}
                                </div>
                            )}

                            <div className="crear-modulo-botones">

                                <button
                                    type="submit"
                                    disabled={creandoBaja}
                                >
                                    {creandoBaja
                                        ? 'Registrando...'
                                        : 'Registrar baja'}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarNuevaBaja}
                                    disabled={creandoBaja}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Almacen