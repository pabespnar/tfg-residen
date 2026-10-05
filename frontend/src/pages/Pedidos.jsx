import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation  } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';

import './Pedidos.css';

function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [presupuesto, setPresupuesto] = useState(null);
    const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
    const [suministrosDisponibles, setSuministrosDisponibles] = useState([]);
    const [cargandoSuministros, setCargandoSuministros] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [cargandoProveedores, setCargandoProveedores] = useState(false);
    const [nombrePedido, setNombrePedido] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [suministrosSeleccionados, setSuministrosSeleccionados] = useState([
        {
            categoria: '',
            suministro: '',
            cantidad: 1,
            precio_unidad: ''
        }
    ]);
    const [errorNombrePedido, setErrorNombrePedido] = useState('');
    const [errorProveedor, setErrorProveedor] = useState('');
    const [erroresSuministros, setErroresSuministros] = useState({});
    const [errorSuministros, setErrorSuministros] = useState('');
    const [errorGeneral, setErrorGeneral] = useState('');
    const [paginaPedidos, setPaginaPedidos] = useState(1);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [orden, setOrden] = useState('fecha_desc');
    const [tipoPedido, setTipoPedido] = useState('');
    const [proveedorFiltro, setProveedorFiltro] = useState('');
    const [expedienteFiltro, setExpedienteFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [suministroFiltro, setSuministroFiltro] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.tipoPedido) {
            setTipoPedido(location.state.tipoPedido);
            setMostrarFiltros(true);
        }

        if (location.state?.estadoFiltro) {
            setEstadoFiltro(location.state.estadoFiltro);
            setMostrarFiltros(true);
        }
    }, [location.state]);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const token = localStorage.getItem('access');

                const respuestaPedidos = await axios.get(
                    '/api/expedientes/pedidos/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const respuestaCentro = await axios.get(
                    '/api/centro/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setPedidos(respuestaPedidos.data);

                setPresupuesto(
                    Number(respuestaCentro.data.presupuesto)
                );
            } catch (error) {
                console.error(
                    'Error al obtener los datos de los pedidos:',
                    error
                );

                setError(
                    'No se han podido cargar los pedidos.'
                );
            } finally {
                setCargando(false);
            }
        };

        obtenerDatos();
    }, []);

    const abrirModalPedido = async () => {
        setErrorGeneral('');
        setErrorSuministros('');
        setErrorNombrePedido('');
        setErrorProveedor('');
        setErroresSuministros({});
        setNombrePedido('');
        setProveedor('');

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: 1,
                precio_unidad: ''
            }
        ]);

        setCargandoSuministros(true);
        setCargandoProveedores(true);
        setMostrarModalPedido(true);

        try {
            const token = localStorage.getItem('access');

            const respuestaSuministros = await axios.get(
                '/api/expedientes/suministrosdisponibles/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const respuestaProveedores = await axios.get(
                '/api/expedientes/proveedores/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuministrosDisponibles(
                respuestaSuministros.data
            );

            setProveedores(
                respuestaProveedores.data
            );
        } catch (error) {
            console.error(
                'Error al obtener los datos del pedido general:',
                error
            );

            if (
                error.config?.url?.includes(
                    '/suministrosdisponibles/'
                )
            ) {
                setErrorSuministros(
                    'No se han podido cargar los suministros disponibles.'
                );
            } else {
                setErrorGeneral(
                    'No se han podido cargar los proveedores.'
                );
            }
        } finally {
            setCargandoSuministros(false);
            setCargandoProveedores(false);
        }
    };

    const cerrarModalPedido = () => {
        setMostrarModalPedido(false);
        setNombrePedido('');
        setProveedor('');

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: 1,
                precio_unidad: ''
            }
        ]);

        setErrorNombrePedido('');
        setErrorProveedor('');
        setErroresSuministros({});
        setErrorSuministros('');
        setErrorGeneral('');
    };

    const cambiarProveedor = (valor) => {
        setProveedor(valor);
        setErrorProveedor('');
    };

    const cambiarCategoria = (index, valor) => {
        const nuevosSuministros = [
            ...suministrosSeleccionados
        ];

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            categoria: valor,
            suministro: ''
        };

        setSuministrosSeleccionados(nuevosSuministros);

        setErroresSuministros((erroresActuales) => ({
            ...erroresActuales,
            [index]: ''
        }));
    };

    const cambiarSuministro = (index, valor) => {
        const nuevosSuministros = [
            ...suministrosSeleccionados
        ];

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            suministro: valor
        };

        setSuministrosSeleccionados(nuevosSuministros);

        setErroresSuministros((erroresActuales) => ({
            ...erroresActuales,
            [index]: ''
        }));
    };

    const cambiarCantidad = (index, valor) => {
        const nuevosSuministros = [
            ...suministrosSeleccionados
        ];

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            cantidad: valor
        };

        setSuministrosSeleccionados(nuevosSuministros);

        setErroresSuministros((erroresActuales) => ({
            ...erroresActuales,
            [index]: ''
        }));
    };

    const cambiarPrecio = (index, valor) => {
        const nuevosSuministros = [
            ...suministrosSeleccionados
        ];

        nuevosSuministros[index] = {
            ...nuevosSuministros[index],
            precio_unidad: valor
        };

        setSuministrosSeleccionados(nuevosSuministros);

        setErroresSuministros((erroresActuales) => ({
            ...erroresActuales,
            [index]: ''
        }));
    };

    const añadirSuministro = () => {
        setSuministrosSeleccionados([
            ...suministrosSeleccionados,
            {
                categoria: '',
                suministro: '',
                cantidad: 1,
                precio_unidad: ''
            }
        ]);
    };

    const eliminarSuministro = (index) => {
        if (suministrosSeleccionados.length === 1) {
            return;
        }

        setSuministrosSeleccionados(
            suministrosSeleccionados.filter(
                (_, i) => i !== index
            )
        );

        setErroresSuministros((erroresActuales) => {
            const nuevosErrores = {
                ...erroresActuales
            };

            delete nuevosErrores[index];

            return nuevosErrores;
        });
    };

    const calcularTotal = () => {
        return suministrosSeleccionados.reduce(
            (total, suministro) => {
                const cantidad =
                    Number(suministro.cantidad) || 0;

                const precio =
                    Number(suministro.precio_unidad) || 0;

                return total + cantidad * precio;
            },
            0
        );
    };

    const totalPedido = calcularTotal();

    const diferenciaPresupuesto =
        presupuesto !== null
            ? presupuesto - totalPedido
            : null;

    const superaPresupuesto =
        presupuesto !== null &&
        totalPedido > presupuesto;

    const crearPedido = async () => {
        setErrorGeneral('');
        setErrorNombrePedido('');
        setErrorProveedor('');
        setErrorSuministros('');
        setErroresSuministros({});

        const nuevosErrores = {};
        let hayErrores = false;

        if (!nombrePedido.trim()) {
            setErrorNombrePedido(
                'El nombre del pedido no puede estar vacío.'
            );

            hayErrores = true;
        } else if (nombrePedido.trim().length > 50) {
            setErrorNombrePedido(
                'El nombre del pedido no puede superar los 50 caracteres.'
            );

            hayErrores = true;
        }

        if (!proveedor) {
            setErrorProveedor(
                'Debes seleccionar un proveedor.'
            );

            hayErrores = true;
        }

        if (suministrosSeleccionados.length === 0) {
            setErrorSuministros(
                'Debes indicar al menos un suministro.'
            );

            hayErrores = true;
        }

        const suministrosUsados = [];

        suministrosSeleccionados.forEach(
            (suministroSeleccionado, index) => {
                if (!suministroSeleccionado.categoria) {
                    nuevosErrores[index] =
                        'Debes seleccionar una categoría.';

                    return;
                }

                if (!suministroSeleccionado.suministro) {
                    nuevosErrores[index] =
                        'Debes seleccionar un suministro.';

                    return;
                }

                if (
                    suministrosUsados.includes(
                        suministroSeleccionado.suministro
                    )
                ) {
                    nuevosErrores[index] =
                        'Este suministro ya está seleccionado.';

                    return;
                }

                suministrosUsados.push(
                    suministroSeleccionado.suministro
                );

                if (
                    suministroSeleccionado.cantidad === '' ||
                    !Number.isInteger(
                        Number(suministroSeleccionado.cantidad)
                    )
                ) {
                    nuevosErrores[index] =
                        'La cantidad debe ser un número entero.';

                    return;
                }

                if (
                    Number(suministroSeleccionado.cantidad) <= 0
                ) {
                    nuevosErrores[index] =
                        'La cantidad debe ser mayor que cero.';

                    return;
                }

                if (
                    suministroSeleccionado.precio_unidad === '' ||
                    Number(
                        suministroSeleccionado.precio_unidad
                    ) < 0
                ) {
                    nuevosErrores[index] =
                        'El precio por unidad no puede ser negativo.';

                    return;
                }

                if (
                    !/^\d+(\.\d{1,2})?$/.test(
                        suministroSeleccionado.precio_unidad
                    )
                ) {
                    nuevosErrores[index] =
                        'El precio por unidad no puede tener más de 2 decimales.';
                }
            }
        );

        if (Object.keys(nuevosErrores).length > 0) {
            hayErrores = true;
        }

        setErroresSuministros(nuevosErrores);

        if (hayErrores) {
            return;
        }

        if (superaPresupuesto) {
            setErrorGeneral(
                'El importe del pedido supera el presupuesto restante del centro.'
            );

            return;
        }

        const suministros = {};

        suministrosSeleccionados.forEach(
            (suministroSeleccionado) => {
                suministros[
                    suministroSeleccionado.suministro
                ] = {
                    cantidad: Number(
                        suministroSeleccionado.cantidad
                    ),
                    precio_unidad: Number(
                        suministroSeleccionado.precio_unidad
                    )
                };
            }
        );

        try {
            const token = localStorage.getItem('access');

            const respuesta = await axios.post(
                '/api/expedientes/crearpedidogeneral/',
                {
                    nombre: nombrePedido.trim(),
                    proveedor: Number(proveedor),
                    suministros: suministros
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPedidos((pedidosActuales) => [
                respuesta.data.pedido,
                ...pedidosActuales
            ]);

            if (
                respuesta.data.presupuesto_restante !== undefined
            ) {
                setPresupuesto(
                    Number(
                        respuesta.data.presupuesto_restante
                    )
                );
            } else {
                setPresupuesto(
                    diferenciaPresupuesto
                );
            }

            cerrarModalPedido();
        } catch (error) {
            console.error(
                'Error al crear el pedido general:',
                error.response?.data
            );

            const mensajeError =
                error.response?.data?.error ||
                'Ha ocurrido un error al crear el pedido general.';

            setErrorGeneral(mensajeError);
        }
    };

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

    const proveedoresFiltro = pedidos
        .filter(
            (pedido) =>
                pedido.proveedor &&
                pedido.proveedor_nombre
        )
        .reduce((acumulado, pedido) => {
            if (
                !acumulado.some(
                    (item) => item.id === pedido.proveedor
                )
            ) {
                acumulado.push({
                    id: pedido.proveedor,
                    nombre: pedido.proveedor_nombre
                });
            }

            return acumulado;
        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    const expedientesFiltro = pedidos
        .filter(
            (pedido) =>
                pedido.tipo_pedido === 'EXPEDIENTE' &&
                pedido.expediente &&
                pedido.expediente_nombre
        )
        .reduce((acumulado, pedido) => {
            if (
                !acumulado.some(
                    (item) => item.id === pedido.expediente
                )
            ) {
                acumulado.push({
                    id: pedido.expediente,
                    nombre: pedido.expediente_nombre
                });
            }

            return acumulado;
        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    const categoriasFiltro = pedidos
        .flatMap(
            (pedido) =>
                pedido.suministros || []
        )
        .filter(
            (suministro, index, array) =>
                array.findIndex(
                    (otroSuministro) =>
                        otroSuministro.categoria_id ===
                        suministro.categoria_id
                ) === index
        )
        .sort((a, b) =>
            a.categoria_nombre.localeCompare(
                b.categoria_nombre
            )
        );

    const suministrosFiltro = pedidos
        .flatMap(
            (pedido) =>
                pedido.suministros || []
        )
        .filter(
            (suministro) =>
                categoriaFiltro === '' ||
                String(
                    suministro.categoria_id
                ) === String(categoriaFiltro)
        )
        .filter(
            (suministro, index, array) =>
                array.findIndex(
                    (otroSuministro) =>
                        otroSuministro.id === suministro.id
                ) === index
        )
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

    const pedidosFiltrados = pedidos.filter((pedido) => {
        const texto = normalizarTexto(
            terminoBusqueda
        );

        const nombrePedido = normalizarTexto(
            pedido.nombre || ''
        );

        const nombreExpediente = normalizarTexto(
            pedido.expediente_nombre || ''
        );

        const coincideBusqueda =
            texto === '' ||
            nombrePedido.includes(texto) ||
            nombreExpediente.includes(texto);

        const coincideTipo =
            tipoPedido === '' ||
            pedido.tipo_pedido === tipoPedido;

        const coincideProveedor =
            proveedorFiltro === '' ||
            pedido.proveedor === Number(proveedorFiltro);

        const coincideExpediente =
            expedienteFiltro === '' ||
            pedido.expediente === Number(expedienteFiltro);

        const coincideCategoria =
            categoriaFiltro === '' ||
            (pedido.suministros || []).some(
                (suministro) =>
                    String(
                        suministro.categoria_id
                    ) === String(categoriaFiltro)
            );

        const coincideSuministro =
            suministroFiltro === '' ||
            (pedido.suministros || []).some(
                (suministro) =>
                    suministro.id === Number(
                        suministroFiltro
                    )
            );

        const coincideFechaDesde =
            fechaDesde === '' ||
            pedido.fecha >= fechaDesde;

        const coincideFechaHasta =
            fechaHasta === '' ||
            pedido.fecha <= fechaHasta;

        let coincideEstado = true;

        if (estadoFiltro === 'pendiente') {
            coincideEstado = !pedido.recibido;
        }

        if (estadoFiltro === 'correcto') {
            coincideEstado =
                pedido.recibido &&
                pedido.correcto;
        }

        if (estadoFiltro === 'incorrecto') {
            coincideEstado =
                pedido.recibido &&
                !pedido.correcto;
        }

        return (
            coincideBusqueda &&
            coincideTipo &&
            coincideProveedor &&
            coincideExpediente &&
            coincideCategoria &&
            coincideSuministro &&
            coincideFechaDesde &&
            coincideFechaHasta &&
            coincideEstado
        );
    });

    const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
        const nombreA = normalizarTexto(
            a.nombre || ''
        );

        const nombreB = normalizarTexto(
            b.nombre || ''
        );

        const expedienteA = normalizarTexto(
            a.expediente_nombre || ''
        );

        const expedienteB = normalizarTexto(
            b.expediente_nombre || ''
        );

        const fechaA = new Date(
            a.fecha || 0
        ).getTime();

        const fechaB = new Date(
            b.fecha || 0
        ).getTime();

        const estadoA = !a.recibido
            ? 0
            : a.correcto
                ? 1
                : 2;

        const estadoB = !b.recibido
            ? 0
            : b.correcto
                ? 1
                : 2;

        if (orden === 'fecha_asc') {
            return fechaA - fechaB;
        }

        if (orden === 'fecha_desc') {
            return fechaB - fechaA;
        }

        if (orden === 'nombre_asc') {
            return nombreA.localeCompare(nombreB);
        }

        if (orden === 'nombre_desc') {
            return nombreB.localeCompare(nombreA);
        }

        if (orden === 'expediente_asc') {
            return expedienteA.localeCompare(expedienteB);
        }

        if (orden === 'expediente_desc') {
            return expedienteB.localeCompare(expedienteA);
        }

        if (orden === 'estado_asc') {
            return estadoA - estadoB;
        }

        if (orden === 'estado_desc') {
            return estadoB - estadoA;
        }

        return 0;
    });

    useEffect(() => {
        setPaginaPedidos(1);
    }, [
        terminoBusqueda,
        orden,
        tipoPedido,
        proveedorFiltro,
        expedienteFiltro,
        categoriaFiltro,
        suministroFiltro,
        fechaDesde,
        fechaHasta,
        estadoFiltro
    ]);

    const cambiarTipoPedido = (valor) => {
        setTipoPedido(valor);

        if (valor !== 'EXPEDIENTE') {
            setExpedienteFiltro('');
        }
    };

    const cambiarCategoriaFiltro = (valor) => {
        setCategoriaFiltro(valor);
        setSuministroFiltro('');
    };

    const restablecerFiltros = () => {
        setTipoPedido('');
        setProveedorFiltro('');
        setExpedienteFiltro('');
        setCategoriaFiltro('');
        setSuministroFiltro('');
        setFechaDesde('');
        setFechaHasta('');
        setEstadoFiltro('');
    };

    const pedidosPorPagina = 3;

    const indiceUltimoPedido =
        paginaPedidos * pedidosPorPagina;

    const indicePrimerPedido =
        indiceUltimoPedido - pedidosPorPagina;

    const pedidosActuales = pedidosOrdenados.slice(
        indicePrimerPedido,
        indiceUltimoPedido
    );

    const totalPaginasPedidos = Math.ceil(
        pedidosOrdenados.length / pedidosPorPagina
    );

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

                <div className="pedidos-header-acciones">
                    <div className="pedidos-presupuesto">
                        <span>
                            Presupuesto restante gasto corriente
                        </span>

                        <strong>
                            {presupuesto !== null
                                ? presupuesto.toLocaleString(
                                    'es-ES',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )
                                : 'Cargando...'} €
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="pedidos-crear"
                        onClick={abrirModalPedido}
                    >
                        Crear pedido general
                    </button>
                </div>
            </div>

            {pedidos.length > 0 ? (
                <>
                    <div className="pedidos-controles">
                        <div className="pedidos-controles-principales">
                            <div className="pedidos-buscador">
                                <div className="pedidos-buscador-input">
                                    <FaSearch className="pedidos-buscador-icono" />

                                    <input
                                        type="text"
                                        placeholder="Buscar por pedido o expediente..."
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
                                className="pedidos-boton-filtros"
                                onClick={() =>
                                    setMostrarFiltros(!mostrarFiltros)
                                }
                            >
                                <FaFilter />
                                {mostrarFiltros
                                    ? 'Ocultar filtros'
                                    : 'Mostrar filtros'}
                            </button>

                            <div className="pedidos-ordenacion">
                                <label htmlFor="orden-pedidos">
                                    Ordenar por:
                                </label>

                                <select
                                    id="orden-pedidos"
                                    value={orden}
                                    onChange={(evento) =>
                                        setOrden(evento.target.value)
                                    }
                                >
                                    <option value="fecha_desc">
                                        Fecha: más reciente
                                    </option>

                                    <option value="fecha_asc">
                                        Fecha: más antigua
                                    </option>

                                    <option value="nombre_asc">
                                        Pedido A-Z
                                    </option>

                                    <option value="nombre_desc">
                                        Pedido Z-A
                                    </option>

                                    <option value="expediente_asc">
                                        Expediente A-Z
                                    </option>

                                    <option value="expediente_desc">
                                        Expediente Z-A
                                    </option>

                                    <option value="estado_asc">
                                        Estado: pendientes primero
                                    </option>

                                    <option value="estado_desc">
                                        Estado: recibidos primero
                                    </option>
                                </select>
                            </div>
                        </div>

                        {mostrarFiltros && (
                            <div className="pedidos-panel-filtros">
                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-tipo-pedido">
                                        Tipo de pedido
                                    </label>

                                    <select
                                        id="filtro-tipo-pedido"
                                        value={tipoPedido}
                                        onChange={(evento) =>
                                            cambiarTipoPedido(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        <option value="EXPEDIENTE">
                                            Con expediente
                                        </option>

                                        <option value="GENERAL">
                                            Gasto general
                                        </option>
                                    </select>
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-proveedor">
                                        Proveedor
                                    </label>

                                    <select
                                        id="filtro-proveedor"
                                        value={proveedorFiltro}
                                        onChange={(evento) =>
                                            setProveedorFiltro(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        {proveedoresFiltro.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-expediente">
                                        Expediente
                                    </label>

                                    <select
                                        id="filtro-expediente"
                                        value={expedienteFiltro}
                                        onChange={(evento) =>
                                            setExpedienteFiltro(
                                                evento.target.value
                                            )
                                        }
                                        disabled={
                                            tipoPedido !== 'EXPEDIENTE'
                                        }
                                    >
                                        <option value="">
                                            {tipoPedido === 'EXPEDIENTE'
                                                ? 'Todos'
                                                : 'Selecciona Con expediente'}
                                        </option>

                                        {expedientesFiltro.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-categoria">
                                        Categoría
                                    </label>

                                    <select
                                        id="filtro-categoria"
                                        value={categoriaFiltro}
                                        onChange={(evento) =>
                                            cambiarCategoriaFiltro(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todas
                                        </option>

                                        {categoriasFiltro.map((item) => (
                                            <option
                                                key={
                                                    item.categoria_id ??
                                                    'sin-asignar'
                                                }
                                                value={
                                                    item.categoria_id ??
                                                    'sin-asignar'
                                                }
                                            >
                                                {item.categoria_nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-suministro">
                                        Suministro
                                    </label>

                                    <select
                                        id="filtro-suministro"
                                        value={suministroFiltro}
                                        onChange={(evento) =>
                                            setSuministroFiltro(
                                                evento.target.value
                                            )
                                        }
                                        disabled={
                                            categoriaFiltro === ''
                                        }
                                    >
                                        <option value="">
                                            {categoriaFiltro === ''
                                                ? 'Selecciona una categoría'
                                                : 'Todos'}
                                        </option>

                                        {suministrosFiltro.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="fecha-desde">
                                        Fecha desde
                                    </label>

                                    <input
                                        id="fecha-desde"
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(evento) =>
                                            setFechaDesde(
                                                evento.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="fecha-hasta">
                                        Fecha hasta
                                    </label>

                                    <input
                                        id="fecha-hasta"
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(evento) =>
                                            setFechaHasta(
                                                evento.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="pedidos-filtro">
                                    <label htmlFor="filtro-estado">
                                        Estado
                                    </label>

                                    <select
                                        id="filtro-estado"
                                        value={estadoFiltro}
                                        onChange={(evento) =>
                                            setEstadoFiltro(
                                                evento.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Todos
                                        </option>

                                        <option value="pendiente">
                                            Pendiente
                                        </option>

                                        <option value="correcto">
                                            Recibido correctamente
                                        </option>

                                        <option value="incorrecto">
                                            Recibido con errores
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    className="pedidos-restablecer-filtros"
                                    onClick={restablecerFiltros}
                                >
                                    Restablecer filtros
                                </button>
                            </div>
                        )}
                    </div>

                    {pedidosActuales.length === 0 ? (
                        <div className="pedidos-vacio">
                            No se han encontrado pedidos que coincidan con la búsqueda.
                        </div>
                    ) : (
                        <div className="pedidos-lista">
                            {pedidosActuales.map(pedido => (
                                <div
                                    className="pedido-card"
                                    key={pedido.id}
                                    onClick={() =>
                                        navigate(
                                            `/pedidos/${pedido.id}`
                                        )
                                    }
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
                    )}

                    {totalPaginasPedidos > 1 && (
                        <div className="pedidos-paginacion">
                            <button
                                type="button"
                                disabled={paginaPedidos === 1}
                                onClick={() =>
                                    setPaginaPedidos(
                                        (paginaActual) => paginaActual - 1
                                    )
                                }
                            >
                                Anterior
                            </button>

                            <span>
                                Página {paginaPedidos} de {totalPaginasPedidos}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    paginaPedidos === totalPaginasPedidos
                                }
                                onClick={() =>
                                    setPaginaPedidos(
                                        (paginaActual) => paginaActual + 1
                                    )
                                }
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="pedidos-vacio">
                    No hay pedidos registrados.
                </div>
            )}

            {mostrarModalPedido && (
                <div className="ver-expediente-modal-fondo">
                    <div className="ver-expediente-modal">
                        <div className="ver-expediente-modal-cabecera">
                            <h2>
                                Crear pedido general
                            </h2>

                            <button
                                type="button"
                                className="ver-expediente-modal-cerrar"
                                onClick={cerrarModalPedido}
                            >
                                ×
                            </button>
                        </div>

                        <div className="ver-expediente-modal-contenido">
                            <div className="ver-expediente-modal-campo">
                                <h3>
                                    Nombre del pedido
                                </h3>

                                <input
                                    type="text"
                                    value={nombrePedido}
                                    onChange={(e) => {
                                        setNombrePedido(
                                            e.target.value
                                        );
                                        setErrorNombrePedido('');
                                    }}
                                />

                                {errorNombrePedido && (
                                    <p className="ver-expediente-modal-error">
                                        {errorNombrePedido}
                                    </p>
                                )}
                            </div>

                            <div className="pedidos-proveedor">
                                <h3>
                                    Proveedor
                                </h3>

                                <select
                                    value={proveedor}
                                    onChange={(e) =>
                                        cambiarProveedor(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        cargandoProveedores
                                    }
                                >
                                    <option value="">
                                        {cargandoProveedores
                                            ? 'Cargando proveedores...'
                                            : 'Seleccionar proveedor'}
                                    </option>

                                    {proveedores.map(
                                        (proveedor) => (
                                            <option
                                                key={
                                                    proveedor.id
                                                }
                                                value={
                                                    proveedor.id
                                                }
                                            >
                                                {
                                                    proveedor.nombre
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {errorProveedor && (
                                    <p className="pedidos-proveedor-error">
                                        {errorProveedor}
                                    </p>
                                )}
                            </div>

                            <div className="ver-expediente-modal-titulo-suministros">
                                <h3>
                                    Suministros
                                </h3>

                                <button
                                    type="button"
                                    className="ver-expediente-modal-anadir-suministro"
                                    onClick={añadirSuministro}
                                    disabled={
                                        cargandoSuministros ||
                                        cargandoProveedores ||
                                        suministrosDisponibles.length ===
                                            suministrosSeleccionados.length
                                    }
                                >
                                    +
                                </button>
                            </div>

                            {cargandoSuministros || cargandoProveedores ? (
                                <p>
                                    Cargando suministros y proveedores...
                                </p>
                            ) : suministrosDisponibles.length === 0 ? (
                                <p>
                                    No hay suministros disponibles para pedidos generales.
                                </p>
                            ) : (
                                suministrosSeleccionados.map(
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
                                                );

                                        const opcionesDisponibles =
                                            suministrosDisponibles.filter(
                                                (suministro) =>
                                                    !suministrosUsados.includes(
                                                        String(
                                                            suministro.id
                                                        )
                                                    ) &&
                                                    (!suministroSeleccionado.categoria ||
                                                        (
                                                            suministroSeleccionado.categoria === 'sin-asignar'
                                                                ? suministro.categoria === null
                                                                : String(
                                                                    suministro.categoria
                                                                ) ===
                                                                    String(
                                                                        suministroSeleccionado.categoria
                                                                    )
                                                        ))
                                            );

                                        const categoriasDisponibles =
                                            suministrosDisponibles.filter(
                                                (suministro, indice, array) =>
                                                    array.findIndex(
                                                        (otroSuministro) =>
                                                            String(
                                                                otroSuministro.categoria
                                                            ) ===
                                                            String(
                                                                suministro.categoria
                                                            )
                                                    ) === indice
                                            );

                                        return (
                                            <div
                                                className="ver-expediente-modal-suministro"
                                                key={index}
                                            >
                                                <div>
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
                                                            Seleccionar categoría
                                                        </option>

                                                        {categoriasDisponibles.map(
                                                            (suministro) => (
                                                                <option
                                                                    key={
                                                                        suministro.categoria ?? 'sin-asignar'
                                                                    }
                                                                    value={
                                                                        suministro.categoria === null
                                                                            ? 'sin-asignar'
                                                                            : suministro.categoria
                                                                    }
                                                                >
                                                                    {
                                                                        suministro.categoria_nombre ||
                                                                        'Sin asignar'
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
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
                                                        disabled={
                                                            !suministroSeleccionado.categoria
                                                        }
                                                    >
                                                        <option value="">
                                                            {suministroSeleccionado.categoria
                                                                ? 'Seleccionar suministro'
                                                                : 'Selecciona una categoría'}
                                                        </option>

                                                        {opcionesDisponibles.map(
                                                            (suministro) => (
                                                                <option
                                                                    key={
                                                                        suministro.id
                                                                    }
                                                                    value={
                                                                        suministro.id
                                                                    }
                                                                >
                                                                    {
                                                                        suministro.nombre
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label>
                                                        Cantidad
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
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
                                                </div>

                                                <div>
                                                    <label>
                                                        Precio/unidad
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            suministroSeleccionado.precio_unidad
                                                        }
                                                        onChange={(e) =>
                                                            cambiarPrecio(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="ver-expediente-modal-suministro-total">
                                                    <span>
                                                        Total
                                                    </span>

                                                    <strong>
                                                        {(
                                                            Number(
                                                                suministroSeleccionado.cantidad
                                                            ) *
                                                            Number(
                                                                suministroSeleccionado.precio_unidad
                                                            )
                                                        ).toFixed(2)} €
                                                    </strong>
                                                </div>

                                                {suministrosSeleccionados.length >
                                                    1 && (
                                                    <button
                                                        type="button"
                                                        className="ver-expediente-modal-eliminar-suministro"
                                                        onClick={() =>
                                                            eliminarSuministro(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                )}

                                                {erroresSuministros[
                                                    index
                                                ] && (
                                                    <p className="ver-expediente-modal-error">
                                                        {
                                                            erroresSuministros[
                                                                index
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                )
                            )}

                            {errorSuministros && (
                                <p className="ver-expediente-modal-error">
                                    {errorSuministros}
                                </p>
                            )}

                            <div className="ver-expediente-modal-resumen">
                                <div>
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {calcularTotal().toFixed(2)} €
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Presupuesto restante
                                    </span>

                                    <strong>
                                        {presupuesto !== null
                                            ? presupuesto.toLocaleString(
                                                'es-ES',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )
                                            : 'Cargando...'} €
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Diferencia
                                    </span>

                                    <strong>
                                        {diferenciaPresupuesto !== null
                                            ? diferenciaPresupuesto.toLocaleString(
                                                'es-ES',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )
                                            : 'Cargando...'} €
                                    </strong>
                                </div>
                            </div>

                            {superaPresupuesto && (
                                <p className="ver-expediente-modal-error">
                                    El importe del pedido supera el presupuesto restante del centro.
                                </p>
                            )}

                            {errorGeneral && (
                                <p className="ver-expediente-modal-error">
                                    {errorGeneral}
                                </p>
                            )}
                        </div>

                        <div className="ver-expediente-modal-botones">
                            <button
                                type="button"
                                className="ver-expediente-modal-cancelar"
                                onClick={cerrarModalPedido}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-expediente-modal-crear"
                                onClick={crearPedido}
                                disabled={
                                    cargandoSuministros ||
                                    cargandoProveedores ||
                                    suministrosDisponibles.length === 0 ||
                                    superaPresupuesto
                                }
                            >
                                Crear pedido general
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pedidos;