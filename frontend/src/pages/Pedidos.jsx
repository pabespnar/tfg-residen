import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    const navigate = useNavigate();


    useEffect(() => {

        const obtenerDatos = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuestaPedidos = await axios.get(
                    'http://127.0.0.1:8000/api/expedientes/pedidos/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const respuestaCentro = await axios.get(
                    'http://127.0.0.1:8000/api/centro/',
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
                'http://127.0.0.1:8000/api/expedientes/suministrosdisponibles/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const respuestaProveedores = await axios.get(
                'http://127.0.0.1:8000/api/expedientes/proveedores/',
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
                    Number(
                        suministroSeleccionado.cantidad
                    ) <= 0
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
                'http://127.0.0.1:8000/api/expedientes/crearpedidogeneral/',
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


    const pedidosPorPagina = 3;
    const indiceUltimoPedido =
        paginaPedidos * pedidosPorPagina;
    const indicePrimerPedido =
        indiceUltimoPedido - pedidosPorPagina;

    const pedidosActuales = pedidos.slice(
        indicePrimerPedido,
        indiceUltimoPedido
    );

    const totalPaginasPedidos = Math.ceil(
        pedidos.length / pedidosPorPagina
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
                                                    !suministroSeleccionado.categoria ||
                                                    (
                                                        suministroSeleccionado.categoria === 'sin-asignar'
                                                            ? suministro.categoria === null
                                                            : String(
                                                                suministro.categoria
                                                            ) ===
                                                                String(
                                                                    suministroSeleccionado.categoria
                                                                )
                                                    )
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