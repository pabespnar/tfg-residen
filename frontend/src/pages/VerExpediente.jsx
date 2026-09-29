import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerExpediente.css'
import { useNavigate, useParams } from 'react-router-dom'

function VerExpediente() {

    const [expediente, setExpediente] = useState(null)
    const [detalles, setDetalles] = useState([])
    const [pedidos, setPedidos] = useState([])

    const [error, setError] = useState('')

    const [mostrarModalPedido, setMostrarModalPedido] = useState(false)

    const [nombrePedido, setNombrePedido] = useState('')
    const [cantidades, setCantidades] = useState({})

    const [errorNombrePedido, setErrorNombrePedido] = useState('')
    const [erroresCantidad, setErroresCantidad] = useState({})
    const [errorSuministros, setErrorSuministros] = useState('')
    const [errorPresupuesto, setErrorPresupuesto] = useState('')
    const [errorPedido, setErrorPedido] = useState('')


    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {

        const token = localStorage.getItem('access')

        axios.get(
            `http://127.0.0.1:8000/api/expedientes/expedientes/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {

            setExpediente(response.data.expediente)
            setDetalles(response.data.detalles)
            setPedidos(response.data.pedidos)

        })
        .catch((error) => {

            console.error(
                'Error al obtener los datos del expediente:',
                error
            )

            if (error.response?.status === 404) {

                setError(
                    'El expediente no existe.'
                )

            } else {

                setError(
                    'No se han podido cargar los datos del expediente.'
                )

            }

        })

    }, [id])

    const validarPedido = () => {

        setErrorNombrePedido('')
        setErroresCantidad({})
        setErrorSuministros('')
        setErrorPresupuesto('')
        setErrorPedido('')

        let valido = true

        if (!nombrePedido.trim()) {
            setErrorNombrePedido(
                'El nombre del pedido no puede estar vacío.'
            )
            valido = false
        }

        const nuevosErroresCantidad = {}

        detalles.forEach((detalle) => {
            const cantidad = cantidades[detalle.suministro]

            if (
                cantidad !== '' &&
                Number(cantidad) < 0
            ) {
                nuevosErroresCantidad[detalle.suministro] =
                    'La cantidad no puede ser negativa.'
                valido = false
            }
        })

        setErroresCantidad(nuevosErroresCantidad)

        const haySuministro = detalles.some(
            (detalle) =>
                Number(
                    cantidades[detalle.suministro] || 0
                ) > 0
        )

        if (!haySuministro) {
            setErrorSuministros(
                'Debes indicar al menos un suministro.'
            )
            valido = false
        }

        const total = calcularTotal()

        if (
            total > Number(expediente.presupuesto_restante)
        ) {
            setErrorPresupuesto(
                'El importe del pedido supera el presupuesto restante del expediente.'
            )
            valido = false
        }

        return valido
    }

    const crearPedido = () => {

        const valido = validarPedido()

        if (!valido) {
            return
        }

        const token = localStorage.getItem('access')

        axios.post(
            `http://127.0.0.1:8000/api/expedientes/expedientes/${id}/crearpedidoexpediente/`,
            {
                nombre: nombrePedido,
                cantidades: cantidades
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then(() => {

            cerrarModalPedido()

            axios.get(
                `http://127.0.0.1:8000/api/expedientes/expedientes/${id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((response) => {

                setExpediente(response.data.expediente)
                setDetalles(response.data.detalles)
                setPedidos(response.data.pedidos)

            })

        })
        .catch((error) => {

            console.error(
                'Error al crear el pedido:',
                error
            )

            setErrorPedido(
                error.response?.data?.error ||
                'Ha ocurrido un error al crear el pedido.'
            )

        })
    }

    const cerrarModalPedido = () => {

        setMostrarModalPedido(false)

        setNombrePedido('')

        setCantidades({})

        setErrorNombrePedido('')

        setErroresCantidad({})

        setErrorSuministros('')

        setErrorPresupuesto('')

        setErrorPedido('')

    }

    const calcularTotal = () => {

        let total = 0

        detalles.forEach((detalle) => {

            const cantidad = Number(
                cantidades[detalle.suministro] || 0
            )

            total += cantidad * Number(
                detalle.precio_unidad
            )

        })

        return total
    }


    if (error) {

        return (

            <div className="ver-expediente-error">

                <h1>
                    {error}
                </h1>

                <button
                    onClick={() => navigate('/expedientes')}
                >
                    Volver a expedientes
                </button>

            </div>

        )

    }


    if (!expediente) {

        return (

            <div className="ver-expediente-loading">

                <h1>
                    Cargando expediente...
                </h1>

            </div>
            
        )

    }


    return (

        <div className="ver-expediente-container">

            <div className="ver-expediente-contenido">

                <div className="ver-expediente-cabecera">

                    <div className="ver-expediente-cabecera-info">

                        <h1>
                            {expediente.nombre}
                        </h1>

                        <span
                            className={
                                expediente.activo
                                    ? 'ver-expediente-estado activo'
                                    : 'ver-expediente-estado finalizado'
                            }
                        >
                            {expediente.activo
                                ? 'Activo'
                                : 'Inactivo'}
                        </span>

                    </div>

                </div>


                <div className="ver-expediente-card">

                    <h2>
                        Información del expediente
                    </h2>

                    <div className="ver-expediente-grid">

                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Nombre
                            </span>

                            <span className="ver-expediente-valor">
                                {expediente.nombre}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Proveedor
                            </span>

                            <span className="ver-expediente-valor">
                                {expediente.proveedor_nombre}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Fecha de inicio
                            </span>

                            <span className="ver-expediente-valor">
                                {expediente.fecha_inicio}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Fecha final
                            </span>

                            <span className="ver-expediente-valor">
                                {expediente.fecha_final}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Presupuesto
                            </span>

                            <span className="ver-expediente-valor">
                                {Number(
                                    expediente.presupuesto
                                ).toFixed(2)}
                                {' €'}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Presupuesto restante
                            </span>

                            <span className="ver-expediente-valor">
                                {Number(
                                    expediente.presupuesto_restante
                                ).toFixed(2)}
                                {' €'}
                            </span>

                        </div>


                        <div className="ver-expediente-campo">

                            <span className="ver-expediente-label">
                                Presupuesto gastado
                            </span>

                            <span className="ver-expediente-valor">
                                {Number(expediente.presupuesto) > 0
                                    ? (
                                        (
                                            Number(expediente.presupuesto) -
                                            Number(expediente.presupuesto_restante)
                                        ) /
                                        Number(expediente.presupuesto) *
                                        100
                                    ).toFixed(1)
                                    : '0.0'}
                                {' %'}
                            </span>

                        </div>


                        <div className="ver-expediente-campo ver-expediente-campo-completo">

                            <span className="ver-expediente-label">
                                Detalles
                            </span>

                            <span className="ver-expediente-valor">
                                {expediente.detalles}
                            </span>

                        </div>

                    </div>

                </div>


                <div className="ver-expediente-card">

                    <h2>
                        Suministros del expediente
                    </h2>

                    {detalles.length > 0 ? (

                        <div className="ver-expediente-suministros">

                            {detalles.map((detalle) => (

                                <div
                                    className="ver-expediente-suministro"
                                    key={detalle.id}
                                >

                                    <div className="ver-expediente-suministro-info">

                                        <span className="ver-expediente-label">
                                            Suministro
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {detalle.suministro_nombre}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-suministro-info">

                                        <span className="ver-expediente-label">
                                            Unidad
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {detalle.suministro_unidad}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-suministro-info">

                                        <span className="ver-expediente-label">
                                            Precio por unidad
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {Number(
                                                detalle.precio_unidad
                                            ).toFixed(2)}
                                            {' €'}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="ver-expediente-sin-suministros">
                            No hay suministros asociados a este expediente.
                        </p>

                    )}

                </div>


                <div className="ver-expediente-card">

                    <div className="ver-expediente-card-cabecera">

                        <div>

                            <h2>
                                Pedidos
                            </h2>

                            <p>
                                Pedidos realizados dentro de este expediente.
                            </p>

                        </div>

                        {expediente.activo && (

                            <button
                                className="ver-expediente-anadir-icono"
                                onClick={() => setMostrarModalPedido(true)}
                                title="Crear pedido"
                            >
                                +
                            </button>

                        )}

                    </div>


                    {pedidos.length > 0 ? (

                        <div className="ver-expediente-pedidos">

                            {pedidos.map((pedido) => (

                                <div
                                    className="ver-expediente-pedido"
                                    key={pedido.id}
                                >

                                    <div className="ver-expediente-pedido-info">

                                        <span className="ver-expediente-label">
                                            Pedido:
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {pedido.nombre}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-pedido-info">

                                        <span className="ver-expediente-label">
                                            Fecha:
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {pedido.fecha}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-pedido-info">

                                        <span className="ver-expediente-label">
                                            Estado: 
                                        </span>

                                        <span
                                            className={
                                                !pedido.recibido
                                                    ? 'pedido-estado pendiente'
                                                    : pedido.correcto
                                                        ? 'pedido-estado correcto'
                                                        : 'pedido-estado incorrecto'
                                            }
                                        >
                                            {!pedido.recibido
                                                ? 'Pendiente'
                                                : pedido.correcto
                                                    ? '✓ Recibido correctamente'
                                                    : '✕ Recibido con diferencias'}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="ver-expediente-sin-pedidos">
                            No hay pedidos asociados a este expediente.
                        </p>

                    )}

                </div>


                {expediente.contrato && (

                    <div className="ver-expediente-card">

                        <h2>
                            Contrato
                        </h2>

                        <div className="ver-expediente-contrato">

                            <span className="ver-expediente-label">
                                Documento del contrato
                            </span>

                            <a
                                href={expediente.contrato}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ver contrato
                            </a>

                        </div>

                    </div>

                )}


                <div className="ver-expediente-botones">

                    <button
                        className="ver-expediente-volver"
                        onClick={() => navigate('/expedientes')}
                    >
                        Volver
                    </button>

                </div>

            </div>

            {mostrarModalPedido && (

                <div className="ver-expediente-modal-fondo">

                    <div className="ver-expediente-modal">

                        <div className="ver-expediente-modal-cabecera">

                            <h2>
                                Crear pedido
                            </h2>

                            <button
                                className="ver-expediente-modal-cerrar"
                                onClick={cerrarModalPedido}
                            >
                                ×
                            </button>

                        </div>

                        <div className="ver-expediente-modal-contenido">

                            {errorPedido && (

                                <span className="ver-expediente-modal-error">
                                    {errorPedido}
                                </span>

                            )}

                            <div className="ver-expediente-modal-campo">

                                <h3>
                                    Nombre del pedido
                                </h3>

                                <input
                                    type="text"
                                    placeholder="Nombre del pedido"
                                    value={nombrePedido}
                                    onChange={(e) => {

                                        setNombrePedido(e.target.value)

                                        setErrorNombrePedido('')
                                        setErrorPedido('')

                                    }}
                                />

                                {errorNombrePedido && (

                                    <span className="ver-expediente-modal-error">
                                        {errorNombrePedido}
                                    </span>

                                )}

                            </div>

                            <h3>
                                Suministros
                            </h3>

                            {errorSuministros && (

                                <span className="ver-expediente-modal-error">
                                    {errorSuministros}
                                </span>

                            )}

                            {detalles.map((detalle) => (

                                <div
                                    className="ver-expediente-modal-suministro"
                                    key={detalle.id}
                                >

                                    <div>

                                        <span className="ver-expediente-label">
                                            Suministro
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {detalle.suministro_nombre}
                                        </span>

                                    </div>

                                    <div>

                                        <span className="ver-expediente-label">
                                            Precio por unidad
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {Number(
                                                detalle.precio_unidad
                                            ).toFixed(2)}
                                            {' €'}
                                        </span>

                                    </div>

                                    <div>

                                        <label>
                                            Cantidad ({detalle.suministro_unidad})
                                        </label>

                                        <input
                                            type="number"
                                            value={
                                                cantidades[detalle.suministro] ?? 0
                                            }
                                            onChange={(e) => {

                                                setCantidades({
                                                    ...cantidades,
                                                    [detalle.suministro]: e.target.value
                                                })

                                                setErroresCantidad({
                                                    ...erroresCantidad,
                                                    [detalle.suministro]: ''
                                                })

                                                setErrorSuministros('')
                                                setErrorPresupuesto('')
                                                setErrorPedido('')

                                            }}
                                        />

                                        {erroresCantidad[detalle.suministro] && (

                                            <span className="ver-expediente-modal-error">
                                                {erroresCantidad[detalle.suministro]}
                                            </span>

                                        )}

                                    </div>

                                </div>

                            ))}

                            <div className="ver-expediente-modal-resumen">

                                <p>
                                    Presupuesto restante:{' '}
                                    {Number(
                                        expediente.presupuesto_restante
                                    ).toFixed(2)}
                                    {' €'}
                                </p>

                                <p>
                                    Coste total del pedido:{' '}
                                    {calcularTotal().toFixed(2)}
                                    {' €'}
                                </p>

                                <p>
                                    Presupuesto después del pedido:{' '}
                                    {(
                                        Number(
                                            expediente.presupuesto_restante
                                        ) -
                                        calcularTotal()
                                    ).toFixed(2)}
                                    {' €'}
                                </p>

                                {errorPresupuesto && (

                                    <span className="ver-expediente-modal-error ver-expediente-modal-error-presupuesto">
                                        {errorPresupuesto}
                                    </span>

                                )}

                            </div>

                        </div>

                        <div className="ver-expediente-modal-botones">

                            <button
                                className="ver-expediente-modal-cancelar"
                                onClick={cerrarModalPedido}
                            >
                                Cancelar
                            </button>

                            <button
                                className="ver-expediente-modal-crear"
                                onClick={crearPedido}
                            >
                                Crear pedido
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
        
    )
}

export default VerExpediente