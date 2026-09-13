import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Almacen.css'

function Almacen() {

    const navigate = useNavigate()

    const [mostrarNuevaBaja, setMostrarNuevaBaja] = useState(false)
    const [mostrarNuevaAlta, setMostrarNuevaAlta] = useState(false)

    const [suministros, setSuministros] = useState([])
    const [categorias, setCategorias] = useState([])

    const [categoria, setCategoria] = useState('')
    const [suministro, setSuministro] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [servicio, setServicio] = useState('')
    const [observaciones, setObservaciones] = useState('')

    const [erroresBaja, setErroresBaja] = useState({})
    const [creandoBaja, setCreandoBaja] = useState(false)

    const [pedidos, setPedidos] = useState([])
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState('')
    const [detallesPedido, setDetallesPedido] = useState([])
    const [cantidadesAlta, setCantidadesAlta] = useState({})
    const [albaranAlta, setAlbaranAlta] = useState(null)
    const [erroresAlta, setErroresAlta] = useState({})
    const [creandoAlta, setCreandoAlta] = useState(false)

    const abrirNuevaBaja = async () => {
        setMostrarNuevaBaja(true)
        setErroresBaja({})

        try {
            const token = localStorage.getItem('access')

            const responseSuministros = await axios.get(
                'http://127.0.0.1:8000/api/suministros/suministros',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            console.log('SUMINISTROS:', responseSuministros.data)

            const responseCategorias = await axios.get(
                'http://127.0.0.1:8000/api/suministros/categorias/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            console.log('CATEGORIAS:', responseCategorias.data)

            setSuministros(responseSuministros.data)
            setCategorias(responseCategorias.data)

        } catch (error) {

            console.error('ERROR:', error)
            console.error('RESPUESTA:', error.response?.data)
            console.error('STATUS:', error.response?.status)

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
            nuevosErrores.suministro =
                'Debes seleccionar un suministro.'
        }

        if (!cantidad || Number(cantidad) <= 0) {
            nuevosErrores.cantidad =
                'La cantidad debe ser mayor que 0.'
        }

        if (!servicio) {
            nuevosErrores.servicio =
                'Debes seleccionar un servicio.'
        }

        if (!observaciones.trim()) {
            nuevosErrores.observaciones =
                'Las bajas de servicio requieren observaciones.'
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErroresBaja(nuevosErrores)
            return
        }

        try {

            setCreandoBaja(true)

            const token = localStorage.getItem('access')

            await axios.post(
                'http://127.0.0.1:8000/api/almacen/crearbajaservicio/',
                {
                    suministro: Number(suministro),
                    cantidad: Number(cantidad),
                    servicio: servicio,
                    observaciones: observaciones.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            cerrarNuevaBaja()

        } catch (error) {

            if (error.response?.data) {

                const erroresServidor =
                    error.response.data

                if (erroresServidor.error) {

                    setErroresBaja({
                        general: erroresServidor.error
                    })

                } else {

                    setErroresBaja(erroresServidor)
                }

            } else {

                setErroresBaja({
                    general:
                        'No se ha podido registrar la baja.'
                })
            }

        } finally {

            setCreandoBaja(false)
        }
    }

    const abrirNuevaAlta = async () => {

        setMostrarNuevaAlta(true)

        setPedidoSeleccionado('')
        setDetallesPedido([])
        setCantidadesAlta({})
        setAlbaranAlta(null)
        setErroresAlta({})

        try {

            const token = localStorage.getItem('access')

            const response = await axios.get(
                'http://127.0.0.1:8000/api/expedientes/pedidosrecibidos/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setPedidos(response.data)

        } catch (error) {

            console.error('ERROR:', error)
            console.error('RESPUESTA:', error.response?.data)
            console.error('STATUS:', error.response?.status)

            setErroresAlta({
                general:
                    'No se han podido cargar los pedidos recibidos.'
            })
        }
    }

    const cerrarNuevaAlta = () => {

        setMostrarNuevaAlta(false)

        setPedidoSeleccionado('')
        setDetallesPedido([])
        setCantidadesAlta({})
        setAlbaranAlta(null)
        setErroresAlta({})
        setCreandoAlta(false)
    }

    const cambiarPedido = async (valor) => {

        setPedidoSeleccionado(valor)
        setDetallesPedido([])
        setCantidadesAlta({})
        setErroresAlta({})

        if (!valor) {
            return
        }

        try {

            const token = localStorage.getItem('access')

            const response = await axios.get(
                `http://127.0.0.1:8000/api/expedientes/pedidos/${valor}/detalles/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setDetallesPedido(response.data)

            const cantidadesIniciales = {}

            response.data.forEach((detalle) => {
                cantidadesIniciales[detalle.suministro] = ''
            })

            setCantidadesAlta(cantidadesIniciales)

        } catch (error) {

            console.error('ERROR:', error)
            console.error('RESPUESTA:', error.response?.data)
            console.error('STATUS:', error.response?.status)

            setErroresAlta({
                general:
                    'No se han podido cargar los suministros del pedido.'
            })
        }
    }

    const cambiarCantidadAlta = (suministroId, valor) => {

        setCantidadesAlta((cantidadesActuales) => ({
            ...cantidadesActuales,
            [suministroId]: valor
        }))

        setErroresAlta((erroresActuales) => ({
            ...erroresActuales,
            detalles: ''
        }))
    }

    const crearAlta = async (e) => {

        e.preventDefault()

        setErroresAlta({})

        if (!pedidoSeleccionado) {

            setErroresAlta({
                pedido:
                    'Debes seleccionar un pedido.'
            })

            return
        }

        const detalles = detallesPedido.map((detalle) => ({
            suministro: detalle.suministro,
            cantidad: Number(
                cantidadesAlta[detalle.suministro] || 0
            )
        }))

        const hayCantidad = detalles.some(
            (detalle) => detalle.cantidad > 0
        )

        if (!hayCantidad) {

            setErroresAlta({
                detalles:
                    'Debes recibir al menos un suministro.'
            })

            return
        }

        const nuevosErrores = {}

        detallesPedido.forEach((detalle) => {

            const cantidad = Number(
                cantidadesAlta[detalle.suministro] || 0
            )

            if (cantidad < 0) {

                nuevosErrores.detalles =
                    'Las cantidades no pueden ser negativas.'
            }

            if (
                detalle.cantidad_pendiente !== undefined &&
                cantidad >
                    Number(detalle.cantidad_pendiente)
            ) {

                nuevosErrores.detalles =
                    `No puedes recibir más de ${detalle.cantidad_pendiente} unidades de ${detalle.suministro_nombre}.`
            }
        })

        if (Object.keys(nuevosErrores).length > 0) {

            setErroresAlta(nuevosErrores)

            return
        }

        try {

            setCreandoAlta(true)

            const token = localStorage.getItem('access')

            const formData = new FormData()

            formData.append(
                'pedido',
                Number(pedidoSeleccionado)
            )

            formData.append(
                'detalles',
                JSON.stringify(detalles)
            )

            if (albaranAlta) {
                formData.append(
                    'factura_albaran',
                    albaranAlta
                )
            }

            await axios.post(
                'http://127.0.0.1:8000/api/almacen/crearalta/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            cerrarNuevaAlta()

        } catch (error) {

            console.error('ERROR:', error)
            console.error('RESPUESTA:', error.response?.data)
            console.error('STATUS:', error.response?.status)

            if (error.response?.data) {

                const erroresServidor =
                    error.response.data

                if (erroresServidor.error) {

                    setErroresAlta({
                        general:
                            erroresServidor.error
                    })

                } else {

                    setErroresAlta(
                        erroresServidor
                    )
                }

            } else {

                setErroresAlta({
                    general:
                        'No se ha podido registrar el alta.'
                })
            }

        } finally {

            setCreandoAlta(false)
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
                            Registrar una salida de servicio de almacén
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={abrirNuevaAlta}
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
                        onClick={() =>
                            navigate('/almacen/bajas')
                        }
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
                        onClick={() =>
                            navigate('/almacen/altas')
                        }
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

                                <label>Categoría</label>

                                <select
                                    value={categoria}
                                    onChange={(e) =>
                                        cambiarCategoria(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Todas las categorías
                                    </option>

                                    {categorias.map(
                                        (categoriaItem) => (

                                            <option
                                                key={
                                                    categoriaItem.id
                                                }
                                                value={
                                                    categoriaItem.id
                                                }
                                            >
                                                {
                                                    categoriaItem.nombre
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <div className="crear-modulo-campo">

                                <label>Suministro</label>

                                <select
                                    value={suministro}
                                    onChange={(e) => {

                                        setSuministro(
                                            e.target.value
                                        )

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
                                    ).map(
                                        (suministroItem) => (

                                            <option
                                                key={
                                                    suministroItem.id
                                                }
                                                value={
                                                    suministroItem.id
                                                }
                                            >
                                                {
                                                    suministroItem.nombre
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                                {erroresBaja.suministro && (
                                    <span className="crear-modulo-error">
                                        {
                                            erroresBaja.suministro
                                        }
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>Cantidad</label>

                                <input
                                    type="number"
                                    min="1"
                                    value={cantidad}
                                    onChange={(e) =>
                                        setCantidad(
                                            e.target.value
                                        )
                                    }
                                />

                                {erroresBaja.cantidad && (
                                    <span className="crear-modulo-error">
                                        {
                                            erroresBaja.cantidad
                                        }
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>Servicio</label>

                                <select
                                    value={servicio}
                                    onChange={(e) =>
                                        setServicio(
                                            e.target.value
                                        )
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
                                        {
                                            erroresBaja.servicio
                                        }
                                    </span>
                                )}

                            </div>

                            <div className="crear-modulo-campo">

                                <label>Observaciones</label>

                                <textarea
                                    value={observaciones}
                                    onChange={(e) =>
                                        setObservaciones(
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                />

                                {erroresBaja.observaciones && (
                                    <span className="crear-modulo-error">
                                        {
                                            erroresBaja.observaciones
                                        }
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

            {mostrarNuevaAlta && (
                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>Nueva alta</h2>

                        <form onSubmit={crearAlta}>

                            <div className="crear-modulo-campo">

                                <label>Pedido</label>

                                <select
                                    value={pedidoSeleccionado}
                                    onChange={(e) =>
                                        cambiarPedido(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Selecciona un pedido
                                    </option>

                                    {pedidos.map((pedido) => (

                                        <option
                                            key={pedido.id}
                                            value={pedido.id}
                                        >
                                            {pedido.nombre}
                                        </option>

                                    ))}

                                </select>

                                {erroresAlta.pedido && (
                                    <span className="crear-modulo-error">
                                        {erroresAlta.pedido}
                                    </span>
                                )}

                            </div>

                            {detallesPedido.length > 0 && (

                                <div className="crear-modulo-campo">

                                    <label>Suministros</label>

                                    {detallesPedido.map(
                                        (detalle) => (

                                            <div
                                                key={detalle.id}
                                                className="alta-suministro"
                                            >

                                                <div className="alta-suministro-info">

                                                    <strong>
                                                        {
                                                            detalle.suministro_nombre
                                                        }
                                                    </strong>

                                                    <span>
                                                        Pedido:{' '}
                                                        {
                                                            detalle.cantidad
                                                        }{' '}
                                                        {
                                                            detalle.suministro_unidad
                                                        }
                                                    </span>

                                                </div>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        cantidadesAlta[
                                                            detalle.suministro
                                                        ] || ''
                                                    }
                                                    onChange={(e) =>
                                                        cambiarCantidadAlta(
                                                            detalle.suministro,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Cantidad"
                                                />

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                            {erroresAlta.detalles && (
                                <div className="crear-modulo-error">
                                    {erroresAlta.detalles}
                                </div>
                            )}

                            <div className="crear-modulo-campo">

                                <label>Albarán</label>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setAlbaranAlta(
                                            e.target.files[0] || null
                                        )
                                    }
                                />

                            </div>

                            {erroresAlta.general && (
                                <div className="crear-modulo-error">
                                    {erroresAlta.general}
                                </div>
                            )}

                            <div className="crear-modulo-botones">

                                <button
                                    type="submit"
                                    disabled={
                                        creandoAlta ||
                                        !pedidoSeleccionado ||
                                        detallesPedido.length === 0
                                    }
                                >
                                    {creandoAlta
                                        ? 'Registrando...'
                                        : 'Registrar alta'}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarNuevaAlta}
                                    disabled={creandoAlta}
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