import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';

import './Expedientes.css';


function Expedientes() {

    const [expedientes, setExpedientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [paginaExpedientes, setPaginaExpedientes] = useState(1);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [orden, setOrden] = useState('fecha_inicio_desc');

    const [proveedor, setProveedor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [suministro, setSuministro] = useState('');
    const [presupuestoMin, setPresupuestoMin] = useState('');
    const [presupuestoMax, setPresupuestoMax] = useState('');
    const [fechaInicioDesde, setFechaInicioDesde] = useState('');
    const [fechaInicioHasta, setFechaInicioHasta] = useState('');
    const [fechaFinalDesde, setFechaFinalDesde] = useState('');
    const [fechaFinalHasta, setFechaFinalHasta] = useState('');
    const [estado, setEstado] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

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


    const proveedores = expedientes
        .filter(
            (expediente) =>
                expediente.proveedor &&
                expediente.proveedor_nombre
        )
        .reduce((acumulado, expediente) => {

            if (
                !acumulado.some(
                    (item) => item.id === expediente.proveedor
                )
            ) {
                acumulado.push({
                    id: expediente.proveedor,
                    nombre: expediente.proveedor_nombre
                });
            }

            return acumulado;

        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );


    const categorias = expedientes
        .flatMap(
            (expediente) =>
                expediente.suministros || []
        )
        .reduce((acumulado, suministroActual) => {

            const categoriaId =
                suministroActual.categoria_id === null
                    ? 'sin-asignar'
                    : suministroActual.categoria_id;

            const categoriaNombre =
                suministroActual.categoria_nombre ||
                'Sin asignar';

            if (
                !acumulado.some(
                    (item) => item.id === categoriaId
                )
            ) {
                acumulado.push({
                    id: categoriaId,
                    nombre: categoriaNombre
                });
            }

            return acumulado;

        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );


    const suministros = expedientes
        .flatMap(
            (expediente) =>
                expediente.suministros || []
        )
        .filter((suministroActual) => {

            if (categoria === '') {
                return false;
            }

            if (categoria === 'sin-asignar') {
                return suministroActual.categoria_id === null;
            }

            return (
                suministroActual.categoria_id ===
                Number(categoria)
            );

        })
        .reduce((acumulado, suministroActual) => {

            if (
                !acumulado.some(
                    (item) => item.id === suministroActual.id
                )
            ) {
                acumulado.push({
                    id: suministroActual.id,
                    nombre: suministroActual.nombre
                });
            }

            return acumulado;

        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );


    const expedientesFiltrados = expedientes.filter((expediente) => {

        const texto = normalizarTexto(terminoBusqueda);

        const nombreExpediente = normalizarTexto(
            expediente.nombre || ''
        );

        const nombreProveedor = normalizarTexto(
            expediente.proveedor_nombre || ''
        );

        const coincideBusqueda =
            texto === '' ||
            nombreExpediente.includes(texto) ||
            nombreProveedor.includes(texto);

        const coincideProveedor =
            proveedor === '' ||
            expediente.proveedor === Number(proveedor);

        const coincideCategoria =
            categoria === '' ||
            (expediente.suministros || []).some(
                (suministroActual) => {

                    if (categoria === 'sin-asignar') {
                        return (
                            suministroActual.categoria_id === null
                        );
                    }

                    return (
                        suministroActual.categoria_id ===
                        Number(categoria)
                    );
                }
            );

        const coincideSuministro =
            suministro === '' ||
            (expediente.suministros || []).some(
                (suministroActual) =>
                    suministroActual.id === Number(suministro)
            );

        const presupuesto =
            Number(expediente.presupuesto || 0);

        const coincidePresupuestoMin =
            presupuestoMin === '' ||
            presupuesto >= Number(presupuestoMin);

        const coincidePresupuestoMax =
            presupuestoMax === '' ||
            presupuesto <= Number(presupuestoMax);

        const coincideFechaInicioDesde =
            fechaInicioDesde === '' ||
            expediente.fecha_inicio >= fechaInicioDesde;

        const coincideFechaInicioHasta =
            fechaInicioHasta === '' ||
            expediente.fecha_inicio <= fechaInicioHasta;

        const coincideFechaFinalDesde =
            fechaFinalDesde === '' ||
            expediente.fecha_final >= fechaFinalDesde;

        const coincideFechaFinalHasta =
            fechaFinalHasta === '' ||
            expediente.fecha_final <= fechaFinalHasta;

        const coincideEstado =
            estado === '' ||
            (estado === 'activo' && expediente.activo) ||
            (estado === 'inactivo' && !expediente.activo);

        return (
            coincideBusqueda &&
            coincideProveedor &&
            coincideCategoria &&
            coincideSuministro &&
            coincidePresupuestoMin &&
            coincidePresupuestoMax &&
            coincideFechaInicioDesde &&
            coincideFechaInicioHasta &&
            coincideFechaFinalDesde &&
            coincideFechaFinalHasta &&
            coincideEstado
        );
    });


    const expedientesOrdenados = [...expedientesFiltrados].sort((a, b) => {

        const nombreA = normalizarTexto(
            a.nombre || ''
        );

        const nombreB = normalizarTexto(
            b.nombre || ''
        );

        const proveedorA = normalizarTexto(
            a.proveedor_nombre || ''
        );

        const proveedorB = normalizarTexto(
            b.proveedor_nombre || ''
        );

        const presupuestoA = Number(
            a.presupuesto || 0
        );

        const presupuestoB = Number(
            b.presupuesto || 0
        );

        const presupuestoRestanteA = Number(
            a.presupuesto_restante || 0
        );

        const presupuestoRestanteB = Number(
            b.presupuesto_restante || 0
        );

        const fechaInicioA = new Date(
            a.fecha_inicio || 0
        ).getTime();

        const fechaInicioB = new Date(
            b.fecha_inicio || 0
        ).getTime();

        const fechaFinalA = new Date(
            a.fecha_final || 0
        ).getTime();

        const fechaFinalB = new Date(
            b.fecha_final || 0
        ).getTime();

        if (orden === 'fecha_inicio_asc') {
            return fechaInicioA - fechaInicioB;
        }

        if (orden === 'fecha_inicio_desc') {
            return fechaInicioB - fechaInicioA;
        }

        if (orden === 'fecha_final_asc') {
            return fechaFinalA - fechaFinalB;
        }

        if (orden === 'fecha_final_desc') {
            return fechaFinalB - fechaFinalA;
        }

        if (orden === 'nombre_asc') {
            return nombreA.localeCompare(nombreB);
        }

        if (orden === 'nombre_desc') {
            return nombreB.localeCompare(nombreA);
        }

        if (orden === 'proveedor_asc') {
            return proveedorA.localeCompare(proveedorB);
        }

        if (orden === 'proveedor_desc') {
            return proveedorB.localeCompare(proveedorA);
        }

        if (orden === 'presupuesto_asc') {
            return presupuestoA - presupuestoB;
        }

        if (orden === 'presupuesto_desc') {
            return presupuestoB - presupuestoA;
        }

        if (orden === 'presupuesto_restante_asc') {
            return presupuestoRestanteA - presupuestoRestanteB;
        }

        if (orden === 'presupuesto_restante_desc') {
            return presupuestoRestanteB - presupuestoRestanteA;
        }

        return 0;
    });


    useEffect(() => {
        setPaginaExpedientes(1);
    }, [
        terminoBusqueda,
        orden,
        proveedor,
        categoria,
        suministro,
        presupuestoMin,
        presupuestoMax,
        fechaInicioDesde,
        fechaInicioHasta,
        fechaFinalDesde,
        fechaFinalHasta,
        estado
    ]);


    const cambiarCategoria = (valor) => {
        setCategoria(valor);
        setSuministro('');
    };


    const restablecerFiltros = () => {
        setProveedor('');
        setCategoria('');
        setSuministro('');
        setPresupuestoMin('');
        setPresupuestoMax('');
        setFechaInicioDesde('');
        setFechaInicioHasta('');
        setFechaFinalDesde('');
        setFechaFinalHasta('');
        setEstado('');
    };


    const expedientesPorPagina = 3;

    const indiceUltimoExpediente =
        paginaExpedientes * expedientesPorPagina;

    const indicePrimerExpediente =
        indiceUltimoExpediente - expedientesPorPagina;

    const expedientesActuales = expedientesOrdenados.slice(
        indicePrimerExpediente,
        indiceUltimoExpediente
    );

    const totalPaginasExpedientes = Math.ceil(
        expedientesOrdenados.length / expedientesPorPagina
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

                    <div className="expedientes-controles">

                        <div className="expedientes-controles-principales">

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

                            <button
                                type="button"
                                className="expedientes-boton-filtros"
                                onClick={() =>
                                    setMostrarFiltros(!mostrarFiltros)
                                }
                            >
                                <FaFilter />
                                {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
                            </button>

                            <div className="expedientes-ordenacion">

                                <label htmlFor="orden-expedientes">
                                    Ordenar por:
                                </label>

                                <select
                                    id="orden-expedientes"
                                    value={orden}
                                    onChange={(evento) =>
                                        setOrden(evento.target.value)
                                    }
                                >
                                    <option value="fecha_inicio_desc">
                                        Fecha inicio: más reciente
                                    </option>

                                    <option value="fecha_inicio_asc">
                                        Fecha inicio: más antigua
                                    </option>

                                    <option value="fecha_final_desc">
                                        Fecha final: más reciente
                                    </option>

                                    <option value="fecha_final_asc">
                                        Fecha final: más antigua
                                    </option>

                                    <option value="nombre_asc">
                                        Expediente A-Z
                                    </option>

                                    <option value="nombre_desc">
                                        Expediente Z-A
                                    </option>

                                    <option value="proveedor_asc">
                                        Proveedor A-Z
                                    </option>

                                    <option value="proveedor_desc">
                                        Proveedor Z-A
                                    </option>

                                    <option value="presupuesto_asc">
                                        Presupuesto: menor a mayor
                                    </option>

                                    <option value="presupuesto_desc">
                                        Presupuesto: mayor a menor
                                    </option>

                                    <option value="presupuesto_restante_asc">
                                        Presupuesto restante: menor a mayor
                                    </option>

                                    <option value="presupuesto_restante_desc">
                                        Presupuesto restante: mayor a menor
                                    </option>
                                </select>

                            </div>

                        </div>

                        {mostrarFiltros && (

                            <div className="expedientes-panel-filtros">

                                <div className="expedientes-filtro">

                                    <label htmlFor="filtro-proveedor">
                                        Proveedor
                                    </label>

                                    <select
                                        id="filtro-proveedor"
                                        value={proveedor}
                                        onChange={(evento) =>
                                            setProveedor(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        {proveedores.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="filtro-categoria">
                                        Categoría de suministro
                                    </label>

                                    <select
                                        id="filtro-categoria"
                                        value={categoria}
                                        onChange={(evento) =>
                                            cambiarCategoria(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todas
                                        </option>

                                        {categorias.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="filtro-suministro">
                                        Suministro
                                    </label>

                                    <select
                                        id="filtro-suministro"
                                        value={suministro}
                                        disabled={categoria === ''}
                                        onChange={(evento) =>
                                            setSuministro(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        {suministros.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="expedientes-filtro">

                                    <label>
                                        Presupuesto
                                    </label>

                                    <div className="expedientes-filtro-rango">

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Mínimo"
                                            value={presupuestoMin}
                                            onChange={(evento) =>
                                                setPresupuestoMin(
                                                    evento.target.value
                                                )
                                            }
                                        />

                                        <span>–</span>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Máximo"
                                            value={presupuestoMax}
                                            onChange={(evento) =>
                                                setPresupuestoMax(
                                                    evento.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="fecha-inicio-desde">
                                        Fecha inicio desde
                                    </label>

                                    <input
                                        id="fecha-inicio-desde"
                                        type="date"
                                        value={fechaInicioDesde}
                                        onChange={(evento) =>
                                            setFechaInicioDesde(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="fecha-inicio-hasta">
                                        Fecha inicio hasta
                                    </label>

                                    <input
                                        id="fecha-inicio-hasta"
                                        type="date"
                                        value={fechaInicioHasta}
                                        onChange={(evento) =>
                                            setFechaInicioHasta(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="fecha-final-desde">
                                        Fecha final desde
                                    </label>

                                    <input
                                        id="fecha-final-desde"
                                        type="date"
                                        value={fechaFinalDesde}
                                        onChange={(evento) =>
                                            setFechaFinalDesde(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="fecha-final-hasta">
                                        Fecha final hasta
                                    </label>

                                    <input
                                        id="fecha-final-hasta"
                                        type="date"
                                        value={fechaFinalHasta}
                                        onChange={(evento) =>
                                            setFechaFinalHasta(
                                                evento.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="expedientes-filtro">

                                    <label htmlFor="filtro-estado">
                                        Estado
                                    </label>

                                    <select
                                        id="filtro-estado"
                                        value={estado}
                                        onChange={(evento) =>
                                            setEstado(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        <option value="activo">
                                            Activos
                                        </option>

                                        <option value="inactivo">
                                            Inactivos
                                        </option>
                                    </select>

                                </div>

                                <button
                                    type="button"
                                    className="expedientes-restablecer-filtros"
                                    onClick={restablecerFiltros}
                                >
                                    Restablecer filtros
                                </button>

                            </div>

                        )}

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