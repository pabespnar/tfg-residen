import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Pedidos.css';


function Pedidos() {

    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
    const [suministrosDisponibles, setSuministrosDisponibles] = useState([]);
    const [cargandoSuministros, setCargandoSuministros] = useState(false);

    const [nombrePedido, setNombrePedido] = useState('');

    const [suministrosSeleccionados, setSuministrosSeleccionados] = useState([
        {
            categoria: '',
            suministro: '',
            cantidad: 1,
            precio_unidad: ''
        }
    ]);

    const [errorNombrePedido, setErrorNombrePedido] = useState('');
    const [erroresSuministros, setErroresSuministros] = useState({});
    const [errorSuministros, setErrorSuministros] = useState('');
    const [errorGeneral, setErrorGeneral] = useState('');

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


    const abrirModalPedido = async () => {

        setErrorGeneral('');
        setErrorSuministros('');
        setErrorNombrePedido('');
        setErroresSuministros({});

        setNombrePedido('');

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: 1,
                precio_unidad: ''
            }
        ]);

        setCargandoSuministros(true);
        setMostrarModalPedido(true);

        try {

            const token = localStorage.getItem('access');

            const respuesta = await axios.get(
                'http://127.0.0.1:8000/api/expedientes/suministrosdisponibles/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuministrosDisponibles(
                respuesta.data
            );

        } catch (error) {

            console.error(
                'Error al obtener los suministros disponibles:',
                error
            );

            setErrorSuministros(
                'No se han podido cargar los suministros disponibles.'
            );

        } finally {

            setCargandoSuministros(false);

        }
    };


    const cerrarModalPedido = () => {

        setMostrarModalPedido(false);

        setNombrePedido('');

        setSuministrosSeleccionados([
            {
                categoria: '',
                suministro: '',
                cantidad: 1,
                precio_unidad: ''
            }
        ]);

        setErrorNombrePedido('');
        setErroresSuministros({});
        setErrorSuministros('');
        setErrorGeneral('');

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


    const crearPedido = async () => {

        setErrorGeneral('');
        setErrorNombrePedido('');
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

                <button
                    type="button"
                    className="pedidos-crear"
                    onClick={abrirModalPedido}
                >
                    Crear pedido
                </button>

            </div>


            {pedidos.length > 0 ? (

                <div className="pedidos-lista">

                    {pedidos.map(pedido => (

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
                                        suministrosDisponibles.length ===
                                            suministrosSeleccionados.length
                                    }
                                >
                                    +
                                </button>

                            </div>


                            {cargandoSuministros ? (

                                <p>
                                    Cargando suministros...
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
                                                    (
                                                        !suministroSeleccionado.categoria ||
                                                        String(
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
                                                    suministro.categoria !== null &&
                                                    suministro.categoria !== undefined &&
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
                                                                        suministro.categoria
                                                                    }
                                                                    value={
                                                                        suministro.categoria
                                                                    }
                                                                >
                                                                    {
                                                                        suministro.categoria_nombre
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

                            </div>


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
                                    suministrosDisponibles.length === 0
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