import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './Almacen.css'

function Almacen() {

    const navigate = useNavigate()
    const location = useLocation()

    const [mostrarNuevaBaja, setMostrarNuevaBaja] = useState(false)
    const [mostrarNuevaAlta, setMostrarNuevaAlta] = useState(false)

    const [suministros, setSuministros] = useState([])
    const [categorias, setCategorias] = useState([])

    const [suministrosSeleccionados, setSuministrosSeleccionados] = useState([
        {
            categoria: '',
            suministro: '',
            cantidad: ''
        }
    ])

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

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: ''
            }
        ])

        setServicio('')
        setObservaciones('')

        try {
            const token = localStorage.getItem('access')

            const responseSuministros = await axios.get(
                '/api/suministros/suministros',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            console.log('SUMINISTROS:', responseSuministros.data)

            const responseCategorias = await axios.get(
                '/api/suministros/categorias/',
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

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: ''
            }
        ])

        setServicio('')
        setObservaciones('')
        setErroresBaja({})
        setCreandoBaja(false)
    }

    const cambiarCategoria = (index, valor) => {

        const nuevosSuministros = [
            ...suministrosSeleccionados
        ]

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            categoria: valor,
            suministro: ''
        }

        setSuministrosSeleccionados(
            nuevosSuministros
        )

        setErroresBaja((erroresActuales) => ({
            ...erroresActuales,
            [`suministro_${index}`]: ''
        }))
    }

    const cambiarSuministro = (index, valor) => {

        const nuevosSuministros = [
            ...suministrosSeleccionados
        ]

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            suministro: valor
        }

        setSuministrosSeleccionados(
            nuevosSuministros
        )

        setErroresBaja((erroresActuales) => ({
            ...erroresActuales,
            [`suministro_${index}`]: ''
        }))
    }

    const cambiarCantidad = (index, valor) => {

        const nuevosSuministros = [
            ...suministrosSeleccionados
        ]

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            cantidad: valor
        }

        setSuministrosSeleccionados(
            nuevosSuministros
        )

        setErroresBaja((erroresActuales) => ({
            ...erroresActuales,
            [`cantidad_${index}`]: '',
            cantidad: ''
        }))
    }

    const obtenerSuministrosCategoria = (categoriaId) => {

        if (!categoriaId) {
            return suministros
        }

        if (categoriaId === 'sin-asignar') {
            return suministros.filter(
                (suministro) =>
                    suministro.categoria === null
            )
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

    const añadirSuministro = () => {

        setSuministrosSeleccionados([
            ...suministrosSeleccionados,
            {
                categoria: '',
                suministro: '',
                cantidad: ''
            }
        ])
    }

    const eliminarSuministro = (index) => {

        if (suministrosSeleccionados.length === 1) {
            return
        }

        setSuministrosSeleccionados(
            suministrosSeleccionados.filter(
                (_, i) => i !== index
            )
        )

        setErroresBaja((erroresActuales) => {

            const nuevosErrores = {
                ...erroresActuales
            }

            delete nuevosErrores[`suministro_${index}`]
            delete nuevosErrores[`cantidad_${index}`]

            return nuevosErrores
        })
    }

    const crearBaja = async (e) => {

        e.preventDefault()

        setErroresBaja({})

        const nuevosErrores = {}

        const suministrosUsados = []

        suministrosSeleccionados.forEach(
            (suministroSeleccionado, index) => {

                if (!suministroSeleccionado.categoria) {

                    nuevosErrores[`suministro_${index}`] =
                        'Debes seleccionar una categoría.'

                    return
                }

                if (!suministroSeleccionado.suministro) {

                    nuevosErrores[`suministro_${index}`] =
                        'Debes seleccionar un suministro.'

                    return
                }

                if (
                    suministrosUsados.includes(
                        suministroSeleccionado.suministro
                    )
                ) {

                    nuevosErrores[`suministro_${index}`] =
                        'Este suministro ya está seleccionado.'

                    return
                }

                suministrosUsados.push(
                    suministroSeleccionado.suministro
                )

                if (
                    !suministroSeleccionado.cantidad ||
                    Number(
                        suministroSeleccionado.cantidad
                    ) <= 0
                ) {

                    nuevosErrores[`cantidad_${index}`] =
                        'La cantidad debe ser mayor que 0.'
                }
            }
        )

        if (!servicio) {
            nuevosErrores.servicio =
                'Debes seleccionar un servicio.'
        }

        if (!observaciones.trim()) {
            nuevosErrores.observaciones =
                'Las bajas de servicio requieren observaciones.'
        } else if (observaciones.length > 250) {
            nuevosErrores.observaciones =
                'Las observaciones no pueden superar los 250 caracteres.'
        }

        if (Object.keys(nuevosErrores).length > 0) {

            setErroresBaja(nuevosErrores)

            return
        }

        try {

            setCreandoBaja(true)

            const token = localStorage.getItem('access')

            const datosSuministros =
                suministrosSeleccionados.map(
                    (suministroSeleccionado) => ({
                        suministro: Number(
                            suministroSeleccionado.suministro
                        ),
                        cantidad: Number(
                            suministroSeleccionado.cantidad
                        )
                    })
                )

            await axios.post(
                '/api/almacen/crearbajaservicio/',
                {
                    suministros: datosSuministros,
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
                '/api/expedientes/pedidosrecibidos/',
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
                `/api/expedientes/pedidos/${valor}/detalles/`,
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
                '/api/almacen/crearalta/',
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

    useEffect(() => {
        if (!location.state?.abrirNuevaAlta) {
            return
        }

        abrirNuevaAlta()
        navigate('/almacen', {
            replace: true,
            state: {}
        })
    }, [location.state])

    return (
        <div className="almacen-container">

            <div className="almacen-cabecera">

                <h1>Gestión de almacén</h1>

                <p>
                    Gestiona las entradas y salidas de suministros del almacén.
                </p>

            </div>

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

                            <div className="baja-suministros-titulo">

                                <label>
                                    Suministros
                                </label>

                                <button
                                    type="button"
                                    className="baja-suministros-anadir"
                                    onClick={añadirSuministro}
                                >
                                    +
                                </button>

                            </div>

                            {suministrosSeleccionados.map(
                                (suministroSeleccionado, index) => {

                                    const suministrosUsados =
                                        suministrosSeleccionados
                                            .filter(
                                                (_, i) =>
                                                    i !== index
                                            )
                                            .map(
                                                (suministro) =>
                                                    String(
                                                        suministro.suministro
                                                    )
                                            )

                                    const opcionesDisponibles =
                                        obtenerSuministrosCategoria(
                                            suministroSeleccionado.categoria
                                        ).filter(
                                            (suministroItem) =>
                                                !suministrosUsados.includes(
                                                    String(
                                                        suministroItem.id
                                                    )
                                                )
                                        )

                                    return (

                                        <div
                                            key={index}
                                            className="baja-suministro"
                                        >

                                            <div className="crear-modulo-campo">

                                                <label>
                                                    Categoría
                                                </label>

                                                <select
                                                    value={
                                                        suministroSeleccionado.categoria
                                                    }
                                                    onChange={(e) =>
                                                        cambiarCategoria(
                                                            index,
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

                                                <label>
                                                    Suministro
                                                </label>

                                                <select
                                                    value={
                                                        suministroSeleccionado.suministro
                                                    }
                                                    onChange={(e) =>
                                                        cambiarSuministro(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">
                                                        Selecciona un suministro
                                                    </option>

                                                    {opcionesDisponibles.map(
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

                                                {erroresBaja[
                                                    `suministro_${index}`
                                                ] && (
                                                    <span className="crear-modulo-error">
                                                        {
                                                            erroresBaja[
                                                                `suministro_${index}`
                                                            ]
                                                        }
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
                                                    value={
                                                        suministroSeleccionado.cantidad
                                                    }
                                                    onChange={(e) =>
                                                        cambiarCantidad(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                {erroresBaja[
                                                    `cantidad_${index}`
                                                ] && (
                                                    <span className="crear-modulo-error">
                                                        {
                                                            erroresBaja[
                                                                `cantidad_${index}`
                                                            ]
                                                        }
                                                    </span>
                                                )}

                                                {erroresBaja.cantidad && (
                                                    <span className="crear-modulo-error">
                                                        {erroresBaja.cantidad}
                                                    </span>
                                                )}

                                            </div>

                                            {suministrosSeleccionados.length >
                                                1 && (

                                                <button
                                                    type="button"
                                                    className="baja-suministro-eliminar"
                                                    onClick={() =>
                                                        eliminarSuministro(
                                                            index
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                            )}

                                        </div>

                                    )
                                }
                            )}

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
                                    maxLength={250}
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