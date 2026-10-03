import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './CrearExpediente.css';


function CrearExpediente() {

    const [proveedores, setProveedores] = useState([]);
    const [suministrosDisponibles, setSuministrosDisponibles] = useState([]);

    const [error, setError] = useState('');
    const [errores, setErrores] = useState({});

    const [expediente, setExpediente] = useState({
        nombre: '',
        detalles: '',
        fecha_inicio: '',
        fecha_final: '',
        proveedor: '',
        presupuesto: '',
        contrato: null
    });

    const [suministrosSeleccionados, setSuministrosSeleccionados] = useState([
        {
            categoria: '',
            suministro: '',
            precio_unidad: ''
        }
    ]);

    const navigate = useNavigate();


    useEffect(() => {

        const obtenerDatos = async () => {

            try {

                const token = localStorage.getItem('access');

                const [respuestaProveedores, respuestaSuministros] =
                    await Promise.all([

                        axios.get(
                            '/api/expedientes/proveedores/',
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        ),

                        axios.get(
                            '/api/expedientes/suministrosdisponibles/',
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )

                    ]);

                setProveedores(
                    respuestaProveedores.data
                );

                setSuministrosDisponibles(
                    respuestaSuministros.data
                );

            } catch (error) {

                setError(
                    'No se han podido cargar los datos necesarios para crear el expediente.'
                );

            }

        };

        obtenerDatos();

    }, []);


    const cambiarCampo = (e) => {

        const { name, value } = e.target;

        setExpediente({
            ...expediente,
            [name]: value
        });

        setErrores({
            ...errores,
            [name]: ''
        });

        setError('');

    };


    const cambiarContrato = (e) => {

        setExpediente({
            ...expediente,
            contrato: e.target.files[0] || null
        });

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

        setSuministrosSeleccionados(
            nuevosSuministros
        );

        setErrores((erroresActuales) => ({
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

        setSuministrosSeleccionados(
            nuevosSuministros
        );

        setErrores((erroresActuales) => ({
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

        setSuministrosSeleccionados(
            nuevosSuministros
        );

        setErrores((erroresActuales) => ({
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

        setErrores((erroresActuales) => {

            const nuevosErrores = {
                ...erroresActuales
            };

            delete nuevosErrores[index];

            return nuevosErrores;

        });

    };


    const validarExpediente = () => {

        const nuevosErrores = {};
        let valido = true;

        if (!expediente.nombre.trim()) {

            nuevosErrores.nombre =
                'El nombre no puede estar vacío.';

            valido = false;

        } else if (
            expediente.nombre.trim().length > 50
        ) {

            nuevosErrores.nombre =
                'El nombre no puede superar los 50 caracteres.';

            valido = false;

        }


        if (!expediente.detalles.trim()) {

            nuevosErrores.detalles =
                'Los detalles no pueden estar vacíos.';

            valido = false;

        } else if (
            expediente.detalles.trim().length > 200
        ) {

            nuevosErrores.detalles =
                'Los detalles no pueden superar los 200 caracteres.';

            valido = false;

        }


        if (!expediente.fecha_inicio) {

            nuevosErrores.fecha_inicio =
                'Debes indicar una fecha de inicio.';

            valido = false;

        }


        if (!expediente.fecha_final) {

            nuevosErrores.fecha_final =
                'Debes indicar una fecha final.';

            valido = false;

        }


        if (
            expediente.fecha_inicio &&
            expediente.fecha_final &&
            expediente.fecha_final < expediente.fecha_inicio
        ) {

            nuevosErrores.fecha_final =
                'La fecha final no puede ser anterior a la fecha de inicio.';

            valido = false;

        }


        if (!expediente.proveedor) {

            nuevosErrores.proveedor =
                'Debes seleccionar un proveedor.';

            valido = false;

        }


        if (
            expediente.presupuesto === '' ||
            expediente.presupuesto === null
        ) {

            nuevosErrores.presupuesto =
                'Debes indicar un presupuesto.';

            valido = false;

        } else if (
            Number(expediente.presupuesto) < 0
        ) {

            nuevosErrores.presupuesto =
                'El presupuesto no puede ser negativo.';

            valido = false;

        }


        if (
            suministrosSeleccionados.length === 0
        ) {

            nuevosErrores.suministros =
                'Debes indicar al menos un suministro.';

            valido = false;

        }


        const suministrosUsados = [];

        suministrosSeleccionados.forEach(
            (suministro, index) => {

                if (!suministro.categoria) {

                    nuevosErrores[index] =
                        'Debes seleccionar una categoría.';

                    valido = false;

                }


                if (!suministro.suministro) {

                    nuevosErrores[index] =
                        'Debes seleccionar un suministro.';

                    valido = false;

                } else {

                    if (
                        suministrosUsados.includes(
                            suministro.suministro
                        )
                    ) {

                        nuevosErrores[index] =
                            'No se puede añadir el mismo suministro más de una vez.';

                        valido = false;

                    }

                    suministrosUsados.push(
                        suministro.suministro
                    );

                }


                if (
                    suministro.precio_unidad === '' ||
                    suministro.precio_unidad === null
                ) {

                    nuevosErrores[index] =
                        'Debes indicar un precio por unidad.';

                    valido = false;

                } else if (
                    Number(suministro.precio_unidad) < 0
                ) {

                    nuevosErrores[index] =
                        'El precio por unidad no puede ser negativo.';

                    valido = false;

                }

            }
        );


        setErrores(nuevosErrores);

        return valido;

    };


    const crearExpediente = async () => {

        setError('');

        if (!validarExpediente()) {
            return;
        }

        const token = localStorage.getItem('access');

        const datos = new FormData();

        datos.append(
            'nombre',
            expediente.nombre.trim()
        );

        datos.append(
            'detalles',
            expediente.detalles.trim()
        );

        datos.append(
            'fecha_inicio',
            expediente.fecha_inicio
        );

        datos.append(
            'fecha_final',
            expediente.fecha_final
        );

        datos.append(
            'proveedor',
            expediente.proveedor
        );

        datos.append(
            'presupuesto',
            expediente.presupuesto
        );


        if (expediente.contrato) {

            datos.append(
                'contrato',
                expediente.contrato
            );

        }


        datos.append(
            'suministros',
            JSON.stringify(
                suministrosSeleccionados.map(
                    (suministro) => ({
                        suministro:
                            Number(
                                suministro.suministro
                            ),
                        precio_unidad:
                            Number(
                                suministro.precio_unidad
                            )
                    })
                )
            )
        );


        try {

            await axios.post(
                '/api/expedientes/crearexpediente/',
                datos,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate('/expedientes');

        } catch (error) {

            console.error(
                'Error al crear el expediente:',
                error
            );

            const datosError = error.response?.data;

            if (datosError?.error) {

                setError(datosError.error);

            } else if (datosError) {

                setErrores(datosError);

            } else {

                setError('No se ha podido crear el expediente.');

            }

        }

    };


    return (

        <div className="crear-expediente-container">

            <div className="crear-expediente-contenido">

                <div className="crear-expediente-cabecera">

                    <div>

                        <h1>
                            Crear expediente
                        </h1>

                        <p>
                            Introduce la información del nuevo expediente.
                        </p>

                    </div>

                </div>


                <div className="crear-expediente-card">

                    <h2>
                        Información del expediente
                    </h2>

                    <div className="crear-expediente-grid">

                        <div className="crear-expediente-campo">

                            <label>
                                Nombre
                            </label>

                            <input
                                type="text"
                                name="nombre"
                                value={expediente.nombre}
                                onChange={cambiarCampo}
                            />

                            {errores.nombre && (

                                <p className="crear-expediente-error">
                                    {errores.nombre}
                                </p>

                            )}

                        </div>


                        <div className="crear-expediente-campo">

                            <label>
                                Proveedor
                            </label>

                            <select
                                name="proveedor"
                                value={expediente.proveedor}
                                onChange={cambiarCampo}
                            >

                                <option value="">
                                    Selecciona un proveedor
                                </option>

                                {proveedores.map(
                                    (proveedor) => (

                                        <option
                                            key={proveedor.id}
                                            value={proveedor.id}
                                        >
                                            {proveedor.nombre}
                                        </option>

                                    )
                                )}

                            </select>

                            {errores.proveedor && (

                                <p className="crear-expediente-error">
                                    {errores.proveedor}
                                </p>

                            )}

                        </div>


                        <div className="crear-expediente-campo">

                            <label>
                                Fecha de inicio
                            </label>

                            <input
                                type="date"
                                name="fecha_inicio"
                                value={expediente.fecha_inicio}
                                onChange={cambiarCampo}
                            />

                            {errores.fecha_inicio && (

                                <p className="crear-expediente-error">
                                    {errores.fecha_inicio}
                                </p>

                            )}

                        </div>


                        <div className="crear-expediente-campo">

                            <label>
                                Fecha final
                            </label>

                            <input
                                type="date"
                                name="fecha_final"
                                value={expediente.fecha_final}
                                onChange={cambiarCampo}
                            />

                            {errores.fecha_final && (

                                <p className="crear-expediente-error">
                                    {errores.fecha_final}
                                </p>

                            )}

                        </div>


                        <div className="crear-expediente-campo">

                            <label>
                                Presupuesto
                            </label>

                            <input
                                type="number"
                                name="presupuesto"
                                min="0"
                                step="0.01"
                                value={expediente.presupuesto}
                                onChange={cambiarCampo}
                            />

                            {errores.presupuesto && (

                                <p className="crear-expediente-error">
                                    {errores.presupuesto}
                                </p>

                            )}

                        </div>


                        <div className="crear-expediente-campo crear-expediente-campo-completo">

                            <label>
                                Detalles
                            </label>

                            <textarea
                                name="detalles"
                                value={expediente.detalles}
                                onChange={cambiarCampo}
                            />

                            {errores.detalles && (

                                <p className="crear-expediente-error">
                                    {errores.detalles}
                                </p>

                            )}

                        </div>

                    </div>

                </div>


                <div className="crear-expediente-card">

                    <div className="crear-expediente-card-cabecera">

                        <div>

                            <h2>
                                Suministros del expediente
                            </h2>

                            <p>
                                Añade los suministros asociados al expediente.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="crear-expediente-anadir-icono"
                            onClick={añadirSuministro}
                        >
                            +
                        </button>

                    </div>


                    {errores.suministros && (

                        <p className="crear-expediente-error">
                            {errores.suministros}
                        </p>

                    )}


                    <div className="crear-expediente-suministros">

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


                                console.log(
                                    'CREAR EXPEDIENTE - categorias:',
                                    categoriasDisponibles
                                );


                                return (

                                    <div
                                        className="crear-expediente-suministro"
                                        key={index}
                                    >

                                        <div className="crear-expediente-suministro-campo">

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
                                                                suministro.categoria ??
                                                                'sin-asignar'
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


                                        <div className="crear-expediente-suministro-campo">

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

                                            {errores[index] && (

                                                <p className="crear-expediente-error">
                                                    {errores[index]}
                                                </p>

                                            )}

                                        </div>


                                        <div className="crear-expediente-suministro-campo">

                                            <label>
                                                Precio por unidad
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

                                            {errores[index] && (

                                                <p className="crear-expediente-error">
                                                    {errores[index]}
                                                </p>

                                            )}

                                        </div>


                                        {suministrosSeleccionados.length > 1 && (

                                            <button
                                                type="button"
                                                className="crear-expediente-eliminar-suministro"
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

                                );

                            }
                        )}

                    </div>

                </div>


                <div className="crear-expediente-card">

                    <h2>
                        Contrato
                    </h2>

                    <div className="crear-expediente-contrato">

                        <label>
                            Documento del contrato
                        </label>

                        <input
                            type="file"
                            onChange={cambiarContrato}
                        />

                    </div>

                </div>


                {error && (

                    <div className="crear-expediente-error-general">
                        {error}
                    </div>

                )}


                <div className="crear-expediente-botones">

                    <button
                        type="button"
                        className="crear-expediente-cancelar"
                        onClick={() =>
                            navigate('/expedientes')
                        }
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="crear-expediente-crear"
                        onClick={crearExpediente}
                    >
                        Crear expediente
                    </button>

                </div>

            </div>

        </div>

    );

}


export default CrearExpediente;