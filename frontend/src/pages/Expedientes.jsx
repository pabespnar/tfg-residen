import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

import './Expedientes.css';


function Expedientes() {

    const [expedientes, setExpedientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [paginaExpedientes, setPaginaExpedientes] = useState(1);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    const navigate = useNavigate();


    useEffect(() => {

        const obtenerExpedientes = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/expedientes/expedientes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setExpedientes(respuesta.data);

            } catch (error) {

                console.error(
                    'Error al obtener los expedientes:',
                    error
                );

                setError(
                    'No se han podido cargar los expedientes.'
                );

            } finally {

                setCargando(false);

            }
        };

        obtenerExpedientes();

    }, []);


    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');


    const expedientesFiltrados = expedientes.filter((expediente) => {

        const texto = normalizarTexto(terminoBusqueda);

        const nombreExpediente = normalizarTexto(
            expediente.nombre || ''
        );

        const nombreProveedor = normalizarTexto(
            expediente.proveedor_nombre || ''
        );

        return (
            texto === '' ||
            nombreExpediente.includes(texto) ||
            nombreProveedor.includes(texto)
        );
    });


    useEffect(() => {
        setPaginaExpedientes(1);
    }, [terminoBusqueda]);


    const expedientesPorPagina = 3;
    const indiceUltimoExpediente = paginaExpedientes * expedientesPorPagina;
    const indicePrimerExpediente =
        indiceUltimoExpediente - expedientesPorPagina;

    const expedientesActuales = expedientesFiltrados.slice(
        indicePrimerExpediente,
        indiceUltimoExpediente
    );

    const totalPaginasExpedientes = Math.ceil(
        expedientesFiltrados.length / expedientesPorPagina
    );


    if (cargando) {
        return (
            <div className="expedientes-cargando">
                Cargando expedientes...
            </div>
        );
    }


    if (error) {
        return (
            <div className="expedientes-error">
                {error}
            </div>
        );
    }


    return (

        <div className="expedientes-container">

            <div className="expedientes-header">

                <div>

                    <h1>
                        Expedientes
                    </h1>

                    <p>
                        Gestiona los expedientes y su información económica.
                    </p>

                </div>


                <button
                    className="expedientes-boton-anadir"
                    onClick={() => navigate('/expedientes/nuevo')}
                >
                    +
                </button>

            </div>


            {expedientes.length > 0 ? (

                <>

                    <div className="expedientes-buscador">

                        <div className="expedientes-buscador-input">

                            <FaSearch className="expedientes-buscador-icono" />

                            <input
                                type="text"
                                placeholder="Buscar por expediente o proveedor..."
                                value={terminoBusqueda}
                                onChange={(evento) =>
                                    setTerminoBusqueda(
                                        evento.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {expedientesFiltrados.length === 0 ? (

                        <div className="expedientes-vacio">

                            No se han encontrado expedientes que coincidan con la búsqueda.

                        </div>

                    ) : (

                        <>

                            <div className="expedientes-lista">

                                {expedientesActuales.map(expediente => (

                                    <div
                                        className="expediente-card"
                                        key={expediente.id}
                                        onClick={() =>
                                            navigate(
                                                `/expedientes/${expediente.id}`
                                            )
                                        }
                                    >

                                        <div className="expediente-card-header">

                                            <div>

                                                <h2>
                                                    {expediente.nombre}
                                                </h2>

                                                <span>
                                                    Proveedor: {expediente.proveedor_nombre}
                                                </span>

                                            </div>


                                            <span
                                                className={
                                                    expediente.activo
                                                        ? 'expediente-estado activo'
                                                        : 'expediente-estado finalizado'
                                                }
                                            >
                                                {expediente.activo
                                                    ? 'Activo'
                                                    : 'Inactivo'}
                                            </span>

                                        </div>


                                        <div className="expediente-card-fechas">

                                            <span>
                                                {expediente.fecha_inicio}
                                            </span>

                                            <span>
                                                —
                                            </span>

                                            <span>
                                                {expediente.fecha_final}
                                            </span>

                                        </div>


                                        <div className="expediente-card-economia">

                                            <div>

                                                <span>
                                                    Presupuesto
                                                </span>

                                                <strong>
                                                    {Number(
                                                        expediente.presupuesto
                                                    ).toFixed(2)}
                                                    {' €'}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Presupuesto restante
                                                </span>

                                                <strong>
                                                    {Number(
                                                        expediente.presupuesto_restante
                                                    ).toFixed(2)}
                                                    {' €'}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                            {totalPaginasExpedientes > 1 && (
                                <div className="expedientes-paginacion">

                                    <button
                                        type="button"
                                        disabled={paginaExpedientes === 1}
                                        onClick={() =>
                                            setPaginaExpedientes(
                                                (paginaActual) => paginaActual - 1
                                            )
                                        }
                                    >
                                        Anterior
                                    </button>

                                    <span>
                                        Página {paginaExpedientes} de {totalPaginasExpedientes}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            paginaExpedientes === totalPaginasExpedientes
                                        }
                                        onClick={() =>
                                            setPaginaExpedientes(
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

                </>

            ) : (

                <div className="expedientes-vacio">

                    No hay expedientes registrados.

                </div>

            )}

        </div>
    );
}


export default Expedientes;