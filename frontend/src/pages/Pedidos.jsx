import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Pedidos.css';


function Pedidos() {

    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {

        const obtenerPedidos = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/expedientes/pedidos/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setPedidos(respuesta.data);

            } catch (error) {

                console.error(
                    'Error al obtener los pedidos:',
                    error
                );

                setError(
                    'No se han podido cargar los pedidos.'
                );

            } finally {

                setCargando(false);

            }
        };

        obtenerPedidos();

    }, []);


    if (cargando) {
        return (
            <div className="pedidos-cargando">
                Cargando pedidos...
            </div>
        );
    }


    if (error) {
        return (
            <div className="pedidos-error">
                {error}
            </div>
        );
    }


    return (

        <div className="pedidos-container">

            <div className="pedidos-header">

                <div>

                    <h1>
                        Pedidos
                    </h1>

                    <p>
                        Consulta y realiza el seguimiento de los pedidos realizados por el centro.
                    </p>

                </div>

            </div>


            {pedidos.length > 0 ? (

                <div className="pedidos-lista">

                    {pedidos.map(pedido => (

                        <div
                            className="pedido-card"
                            key={pedido.id}
                            onClick={() => navigate(`/pedidos/${pedido.id}`)}
                        >

                            <div className="pedido-card-header">

                                <div>

                                    <h2>
                                        {pedido.nombre}
                                    </h2>

                                    <span>
                                        {pedido.tipo_pedido === 'EXPEDIENTE'
                                            ? `Expediente: ${pedido.expediente_nombre}`
                                            : 'Gasto general'}
                                    </span>

                                </div>


                                <span
                                    className={
                                        pedido.recibido
                                            ? 'pedido-estado recibido'
                                            : 'pedido-estado pendiente'
                                    }
                                >
                                    {pedido.recibido
                                        ? 'Recibido'
                                        : 'Pendiente'}
                                </span>

                            </div>


                            <div className="pedido-card-fecha">

                                <span>
                                    Fecha
                                </span>

                                <strong>
                                    {pedido.fecha}
                                </strong>

                            </div>

                        </div>

                    ))}

                </div>

            ) : (

                <div className="pedidos-vacio">

                    No hay pedidos registrados.

                </div>

            )}

        </div>
    );
}


export default Pedidos;