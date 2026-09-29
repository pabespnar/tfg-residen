import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerPedido.css'
import { useNavigate, useParams } from 'react-router-dom'

function VerPedido() {

    const [pedido, setPedido] = useState(null)
    const [detalles, setDetalles] = useState([])

    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {

        const token = localStorage.getItem('access')

        axios.get(
            `/api/expedientes/pedidos/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {

            setPedido(response.data.pedido)
            setDetalles(response.data.detalles)

        })
        .catch((error) => {

            console.error(
                'Error al obtener los datos del pedido:',
                error
            )

            if (error.response?.status === 404) {

                setError(
                    'El pedido no existe.'
                )

            } else {

                setError(
                    'No se han podido cargar los datos del pedido.'
                )

            }

        })

    }, [id])


    const calcularTotal = () => {

        let total = 0

        detalles.forEach((detalle) => {

            total +=
                Number(detalle.cantidad) *
                Number(detalle.precio_unidad)

        })

        return total
    }


    const abrirExpediente = () => {

        if (pedido?.expediente) {

            navigate(
                `/expedientes/${pedido.expediente}`
            )

        }

    }


    const detallesConDiferencias = detalles.filter(
        (detalle) =>
            detalle.cantidad_recibida !== undefined &&
            detalle.cantidad !== detalle.cantidad_recibida
    )


    if (error) {

        return (

            <div className="ver-pedido-error">

                <h1>
                    {error}
                </h1>

                <button
                    onClick={() => navigate('/pedidos')}
                >
                    Volver a pedidos
                </button>

            </div>

        )

    }


    if (!pedido) {

        return (

            <div className="ver-pedido-loading">

                <h1>
                    Cargando pedido...
                </h1>

            </div>

        )

    }


    return (

        <div className="ver-pedido-container">

            <div className="ver-pedido-contenido">

                <div className="ver-pedido-cabecera">

                    <div className="ver-pedido-cabecera-info">

                        <h1>
                            {pedido.nombre}
                        </h1>

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


                <div className="ver-pedido-card">

                    <h2>
                        Información del pedido
                    </h2>

                    <div className="ver-pedido-grid">

                        <div className="ver-pedido-campo">

                            <span className="ver-pedido-label">
                                Nombre
                            </span>

                            <span className="ver-pedido-valor">
                                {pedido.nombre}
                            </span>

                        </div>


                        <div className="ver-pedido-campo">

                            <span className="ver-pedido-label">
                                Fecha
                            </span>

                            <span className="ver-pedido-valor">
                                {pedido.fecha}
                            </span>

                        </div>


                        <div className="ver-pedido-campo">

                            <span className="ver-pedido-label">
                                Tipo de pedido
                            </span>

                            <span className="ver-pedido-valor">
                                {pedido.tipo_pedido === 'EXPEDIENTE'
                                    ? 'Con expediente'
                                    : 'Gasto general'}
                            </span>

                        </div>


                        <div className="ver-pedido-campo">

                            <span className="ver-pedido-label">
                                Proveedor
                            </span>

                            <span className="ver-pedido-valor">
                                {pedido.proveedor_nombre || '—'}
                            </span>

                        </div>


                        <div className="ver-pedido-campo">

                            <span className="ver-pedido-label">
                                Expediente
                            </span>

                            {pedido.expediente ? (

                                <button
                                    type="button"
                                    className="ver-pedido-expediente"
                                    onClick={abrirExpediente}
                                >
                                    {pedido.expediente_nombre}
                                </button>

                            ) : (

                                <span className="ver-pedido-valor">
                                    —
                                </span>

                            )}

                        </div>

                    </div>

                </div>


                <div className="ver-pedido-card">

                    <h2>
                        Suministros del pedido
                    </h2>

                    {detalles.length > 0 ? (

                        <div className="ver-pedido-suministros">

                            {detalles.map((detalle) => (

                                <div
                                    className="ver-pedido-suministro"
                                    key={detalle.id}
                                >

                                    <div className="ver-pedido-suministro-info">

                                        <span className="ver-pedido-label">
                                            Suministro
                                        </span>

                                        <span className="ver-pedido-valor">
                                            {detalle.suministro_nombre}
                                        </span>

                                    </div>


                                    <div className="ver-pedido-suministro-info">

                                        <span className="ver-pedido-label">
                                            Cantidad
                                        </span>

                                        <span className="ver-pedido-valor">
                                            {detalle.cantidad}{' '}
                                            {detalle.suministro_unidad}
                                        </span>

                                    </div>


                                    <div className="ver-pedido-suministro-info">

                                        <span className="ver-pedido-label">
                                            Precio por unidad
                                        </span>

                                        <span className="ver-pedido-valor">
                                            {Number(
                                                detalle.precio_unidad
                                            ).toFixed(2)}
                                            {' €'}
                                        </span>

                                    </div>


                                    <div className="ver-pedido-suministro-info">

                                        <span className="ver-pedido-label">
                                            Importe
                                        </span>

                                        <strong>
                                            {(
                                                Number(detalle.cantidad) *
                                                Number(detalle.precio_unidad)
                                            ).toFixed(2)}
                                            {' €'}
                                        </strong>

                                    </div>

                                </div>

                            ))}


                            <div className="ver-pedido-suministro ver-pedido-total">

                                <div></div>

                                <div></div>

                                <div className="ver-pedido-suministro-info">

                                    <span className="ver-pedido-label">
                                        Total
                                    </span>

                                </div>

                                <div className="ver-pedido-suministro-info">

                                    <strong>
                                        {calcularTotal().toFixed(2)}
                                        {' €'}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <p className="ver-pedido-sin-suministros">
                            No hay suministros asociados a este pedido.
                        </p>

                    )}

                </div>


                {pedido.recibido && !pedido.correcto && detallesConDiferencias.length > 0 && (

                    <div className="ver-pedido-diferencias">

                        <h3>
                            Suministros recibidos con diferencias
                        </h3>

                        <div className="ver-pedido-diferencias-lista">

                            {detallesConDiferencias.map((detalle) => (

                                <div
                                    className="ver-pedido-diferencia"
                                    key={detalle.id}
                                >

                                    <span className="ver-pedido-diferencia-nombre">
                                        {detalle.suministro_nombre}
                                    </span>

                                    <span>
                                        Solicitado: {detalle.cantidad}{' '}
                                        {detalle.suministro_unidad}
                                    </span>

                                    <span>
                                        Recibido: {detalle.cantidad_recibida}{' '}
                                        {detalle.suministro_unidad}
                                    </span>

                                    <span>
                                        Diferencia:{' '}
                                        {detalle.diferencia > 0 ? '+' : ''}
                                        {detalle.diferencia}{' '}
                                        {detalle.suministro_unidad}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                )}


                <div className="ver-pedido-botones">

                    <button
                        className="ver-pedido-volver"
                        onClick={() => navigate('/pedidos')}
                    >
                        Volver
                    </button>

                </div>

            </div>

        </div>

    )

}

export default VerPedido