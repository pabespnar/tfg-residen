import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerExpediente.css'
import { useNavigate, useParams } from 'react-router-dom'

function VerExpediente() {

    const [expediente, setExpediente] = useState(null)
    const [detalles, setDetalles] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [error, setError] = useState('')

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
                                : 'Finalizado'}
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


                        <button
                            className="ver-expediente-anadir-icono"
                            onClick={() =>
                                navigate(
                                    `/expedientes/${id}/crear-pedido`
                                )
                            }
                            title="Crear pedido"
                        >
                            +
                        </button>

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
                                            Pedido
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {pedido.nombre}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-pedido-info">

                                        <span className="ver-expediente-label">
                                            Fecha
                                        </span>

                                        <span className="ver-expediente-valor">
                                            {pedido.fecha}
                                        </span>

                                    </div>


                                    <div className="ver-expediente-pedido-info">

                                        <span className="ver-expediente-label">
                                            Estado
                                        </span>

                                        <span
                                            className={
                                                pedido.recibido
                                                    ? 'ver-expediente-pedido-estado recibido'
                                                    : 'ver-expediente-pedido-estado pendiente'
                                            }
                                        >
                                            {pedido.recibido
                                                ? 'Recibido'
                                                : 'Pendiente'}
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

        </div>

    )
}

export default VerExpediente