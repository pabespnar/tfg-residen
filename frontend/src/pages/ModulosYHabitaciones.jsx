import { useEffect, useState } from "react";
import axios from "axios";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

import "./ModulosYHabitaciones.css";

const ModulosYHabitaciones = () => {

    const [modulos, setModulos] = useState([]);
    const [error, setError] = useState(null);

    const [mostrarCrearModulo, setMostrarCrearModulo] = useState(false);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [numHabitacionesMax, setNumHabitacionesMax] = useState("");

    const [erroresFormulario, setErroresFormulario] = useState({});
    const [creandoModulo, setCreandoModulo] = useState(false);

    const [mostrarEditarModulo, setMostrarEditarModulo] = useState(false);
    const [moduloEditando, setModuloEditando] = useState(null);

    const [nombreEditar, setNombreEditar] = useState("");
    const [descripcionEditar, setDescripcionEditar] = useState("");
    const [numHabitacionesMaxEditar, setNumHabitacionesMaxEditar] =
        useState("");

    const [erroresEditar, setErroresEditar] = useState({});
    const [editandoModulo, setEditandoModulo] = useState(false);

    const [mostrarEliminarModulo, setMostrarEliminarModulo] = useState(false);
    const [moduloEliminando, setModuloEliminando] = useState(null);
    const [eliminandoModulo, setEliminandoModulo] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState(null);

    useEffect(() => {

        const obtenerModulos = async () => {

            try {

                const token = localStorage.getItem("access");

                const respuesta = await axios.get(
                    "http://127.0.0.1:8000/api/modulos/listadomodulos/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (Array.isArray(respuesta.data)) {

                    setModulos(respuesta.data);
                    setError(null);

                } else {

                    setError(
                        "La respuesta del servidor no tiene un formato válido."
                    );

                }

            } catch (error) {

                console.error("Error al obtener los módulos:", error);

                setError("No se han podido cargar los módulos.");

            }

        };

        obtenerModulos();

    }, []);

    const validarFormulario = () => {

        const nuevosErrores = {};

        if (!nombre.trim()) {

            nuevosErrores.nombre =
                "El nombre es obligatorio.";

        } else if (nombre.trim().length > 100) {

            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";

        }

        if (!numHabitacionesMax) {

            nuevosErrores.numHabitacionesMax =
                "El número máximo de habitaciones es obligatorio.";

        } else if (
            !Number.isInteger(Number(numHabitacionesMax)) ||
            Number(numHabitacionesMax) < 1
        ) {

            nuevosErrores.numHabitacionesMax =
                "Debe ser un número entero mayor o igual que 1.";

        }

        setErroresFormulario(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;

    };

    const crearModulo = async () => {

        if (!validarFormulario()) {
            return;
        }

        try {

            setCreandoModulo(true);
            setErroresFormulario({});

            const token = localStorage.getItem("access");

            const respuesta = await axios.post(
                "http://127.0.0.1:8000/api/modulos/crearmodulo/",
                {
                    nombre: nombre.trim(),
                    descripcion: descripcion,
                    num_habitaciones_max: Number(numHabitacionesMax),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setModulos((modulosActuales) => [
                ...modulosActuales,
                respuesta.data,
            ]);

            cerrarCrearModulo();

        } catch (error) {

            console.error("Error al crear el módulo:", error);

            if (error.response?.data) {

                const erroresBackend = {};

                if (error.response.data.nombre) {

                    erroresBackend.nombre =
                        error.response.data.nombre[0];

                }

                if (error.response.data.num_habitaciones_max) {

                    erroresBackend.numHabitacionesMax =
                        error.response.data.num_habitaciones_max[0];

                }

                if (Object.keys(erroresBackend).length > 0) {

                    setErroresFormulario(erroresBackend);

                } else {

                    setErroresFormulario({
                        general:
                            "No se ha podido crear el módulo.",
                    });

                }

            } else {

                setErroresFormulario({
                    general:
                        "No se ha podido conectar con el servidor.",
                });

            }

        } finally {

            setCreandoModulo(false);

        }

    };

    const cerrarCrearModulo = () => {

        setMostrarCrearModulo(false);

        setNombre("");
        setDescripcion("");
        setNumHabitacionesMax("");

        setErroresFormulario({});

    };

    const abrirEditarModulo = (modulo) => {

        setModuloEditando(modulo);

        setNombreEditar(modulo.nombre);
        setDescripcionEditar(modulo.descripcion || "");
        setNumHabitacionesMaxEditar(
            modulo.num_habitaciones_max
        );

        setErroresEditar({});

        setMostrarEditarModulo(true);

    };

    const validarEditarModulo = () => {

        const nuevosErrores = {};

        if (!nombreEditar.trim()) {

            nuevosErrores.nombre =
                "El nombre es obligatorio.";

        } else if (nombreEditar.trim().length > 100) {

            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";

        }

        if (!numHabitacionesMaxEditar) {

            nuevosErrores.numHabitacionesMax =
                "El número máximo de habitaciones es obligatorio.";

        } else if (
            !Number.isInteger(Number(numHabitacionesMaxEditar)) ||
            Number(numHabitacionesMaxEditar) < 1
        ) {

            nuevosErrores.numHabitacionesMax =
                "Debe ser un número entero mayor o igual que 1.";

        }

        setErroresEditar(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;

    };

    const editarModulo = async () => {

        if (!validarEditarModulo()) {
            return;
        }

        try {

            setEditandoModulo(true);
            setErroresEditar({});

            const token = localStorage.getItem("access");

            const respuesta = await axios.put(
                `http://127.0.0.1:8000/api/modulos/editarmodulo/${moduloEditando.id}/`,
                {
                    nombre: nombreEditar.trim(),
                    descripcion: descripcionEditar,
                    num_habitaciones_max:
                        Number(numHabitacionesMaxEditar),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setModulos((modulosActuales) =>
                modulosActuales.map((modulo) =>
                    modulo.id === respuesta.data.id
                        ? respuesta.data
                        : modulo
                )
            );

            cerrarEditarModulo();

        } catch (error) {

            console.error(
                "Error al editar el módulo:",
                error
            );

            if (error.response?.data) {

                const erroresBackend = {};

                if (error.response.data.nombre) {

                    erroresBackend.nombre =
                        error.response.data.nombre[0];

                }

                if (error.response.data.num_habitaciones_max) {

                    erroresBackend.numHabitacionesMax =
                        error.response.data.num_habitaciones_max[0];

                }

                if (Object.keys(erroresBackend).length > 0) {

                    setErroresEditar(erroresBackend);

                } else {

                    setErroresEditar({
                        general:
                            "No se ha podido editar el módulo.",
                    });

                }

            } else {

                setErroresEditar({
                    general:
                        "No se ha podido conectar con el servidor.",
                });

            }

        } finally {

            setEditandoModulo(false);

        }

    };

    const cerrarEditarModulo = () => {

        setMostrarEditarModulo(false);

        setModuloEditando(null);

        setNombreEditar("");
        setDescripcionEditar("");
        setNumHabitacionesMaxEditar("");

        setErroresEditar({});

    };

    const abrirEliminarModulo = (modulo) => {

        setModuloEliminando(modulo);

        setErrorEliminar(null);

        setMostrarEliminarModulo(true);

    };

    const eliminarModulo = async () => {

        try {

            setEliminandoModulo(true);
            setErrorEliminar(null);

            const token = localStorage.getItem("access");

            await axios.delete(
                `http://127.0.0.1:8000/api/modulos/eliminarmodulo/${moduloEliminando.id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setModulos((modulosActuales) =>
                modulosActuales.filter(
                    (modulo) =>
                        modulo.id !== moduloEliminando.id
                )
            );

            setMostrarEliminarModulo(false);
            setModuloEliminando(null);

        } catch (error) {

            console.error(
                "Error al eliminar el módulo:",
                error
            );

            setErrorEliminar(
                "No se ha podido eliminar el módulo."
            );

        } finally {

            setEliminandoModulo(false);

        }

    };

    const cerrarEliminarModulo = () => {

        if (eliminandoModulo) {
            return;
        }

        setMostrarEliminarModulo(false);
        setModuloEliminando(null);
        setErrorEliminar(null);

    };

    return (

        <div className="modulos-container">

            <div className="modulos-titulo">

                <h1>Módulos</h1>

                <button
                    type="button"
                    className="modulos-anadir"
                    onClick={() => setMostrarCrearModulo(true)}
                >
                    +
                </button>

            </div>

            {error && (
                <p className="modulos-error">
                    {error}
                </p>
            )}

            <div className="modulos-listado">

                {modulos.map((modulo) => (

                    <div
                        className="modulo-card"
                        key={modulo.id}
                    >

                        <div className="modulo-cabecera">

                            <h2>
                                {modulo.nombre}
                            </h2>

                            <div className="modulo-acciones">

                                <button
                                    type="button"
                                    className="modulo-editar"
                                    onClick={() =>
                                        abrirEditarModulo(modulo)
                                    }
                                    title="Editar módulo"
                                    aria-label="Editar módulo"
                                >
                                    <FaPencilAlt />
                                </button>

                                <button
                                    type="button"
                                    className="modulo-eliminar"
                                    onClick={() =>
                                        abrirEliminarModulo(modulo)
                                    }
                                    title="Eliminar módulo"
                                    aria-label="Eliminar módulo"
                                >
                                    <FaTrash />
                                </button>

                            </div>

                        </div>

                        <p className="modulo-descripcion">
                            {modulo.descripcion || "Sin descripción"}
                        </p>

                        <p className="modulo-habitaciones-max">
                            Máximo de habitaciones:{" "}
                            {modulo.num_habitaciones_max}
                        </p>

                        <div className="modulo-contenido">

                            {/* Añadir las habitacionesssss */}

                        </div>

                    </div>

                ))}

            </div>

            {mostrarCrearModulo && (

                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>
                            Crear módulo
                        </h2>

                        <div className="crear-modulo-campo">

                            <label htmlFor="nombre">
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />

                            {erroresFormulario.nombre && (
                                <p className="crear-modulo-error">
                                    {erroresFormulario.nombre}
                                </p>
                            )}

                        </div>

                        <div className="crear-modulo-campo">

                            <label htmlFor="descripcion">
                                Descripción
                            </label>

                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) =>
                                    setDescripcion(e.target.value)
                                }
                            />

                        </div>

                        <div className="crear-modulo-campo">

                            <label htmlFor="num-habitaciones-max">
                                Número máximo de habitaciones
                            </label>

                            <input
                                id="num-habitaciones-max"
                                type="number"
                                min="1"
                                value={numHabitacionesMax}
                                onChange={(e) =>
                                    setNumHabitacionesMax(e.target.value)
                                }
                            />

                            {erroresFormulario.numHabitacionesMax && (
                                <p className="crear-modulo-error">
                                    {erroresFormulario.numHabitacionesMax}
                                </p>
                            )}

                        </div>

                        {erroresFormulario.general && (
                            <p className="crear-modulo-error">
                                {erroresFormulario.general}
                            </p>
                        )}

                        <div className="crear-modulo-botones">

                            <button
                                type="button"
                                onClick={crearModulo}
                                disabled={creandoModulo}
                            >
                                {creandoModulo
                                    ? "Creando..."
                                    : "Crear"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarCrearModulo}
                                disabled={creandoModulo}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {mostrarEditarModulo && (

                <div className="crear-modulo-overlay">

                    <div className="crear-modulo-confirmacion">

                        <h2>
                            Editar módulo
                        </h2>

                        <div className="crear-modulo-campo">

                            <label htmlFor="nombre-editar">
                                Nombre
                            </label>

                            <input
                                id="nombre-editar"
                                type="text"
                                value={nombreEditar}
                                onChange={(e) =>
                                    setNombreEditar(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresEditar.nombre && (
                                <p className="crear-modulo-error">
                                    {erroresEditar.nombre}
                                </p>
                            )}

                        </div>

                        <div className="crear-modulo-campo">

                            <label htmlFor="descripcion-editar">
                                Descripción
                            </label>

                            <textarea
                                id="descripcion-editar"
                                value={descripcionEditar}
                                onChange={(e) =>
                                    setDescripcionEditar(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="crear-modulo-campo">

                            <label htmlFor="num-habitaciones-max-editar">
                                Número máximo de habitaciones
                            </label>

                            <input
                                id="num-habitaciones-max-editar"
                                type="number"
                                min="1"
                                value={numHabitacionesMaxEditar}
                                onChange={(e) =>
                                    setNumHabitacionesMaxEditar(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresEditar.numHabitacionesMax && (
                                <p className="crear-modulo-error">
                                    {
                                        erroresEditar.numHabitacionesMax
                                    }
                                </p>
                            )}

                        </div>

                        {erroresEditar.general && (
                            <p className="crear-modulo-error">
                                {erroresEditar.general}
                            </p>
                        )}

                        <div className="crear-modulo-botones">

                            <button
                                type="button"
                                onClick={editarModulo}
                                disabled={editandoModulo}
                            >
                                {editandoModulo
                                    ? "Guardando..."
                                    : "Guardar"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarEditarModulo}
                                disabled={editandoModulo}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {mostrarEliminarModulo && (

                <div className="eliminar-modulo-overlay">

                    <div className="eliminar-modulo-confirmacion">

                        <p>
                            ¿Seguro que desea eliminar el módulo{" "}
                            <strong>
                                {moduloEliminando?.nombre}
                            </strong>
                            ?
                        </p>

                        {errorEliminar && (
                            <p className="eliminar-modulo-error">
                                {errorEliminar}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={eliminarModulo}
                            disabled={eliminandoModulo}
                        >
                            {eliminandoModulo
                                ? "Eliminando..."
                                : "Sí, eliminar módulo"}
                        </button>

                        <button
                            type="button"
                            onClick={cerrarEliminarModulo}
                            disabled={eliminandoModulo}
                        >
                            Cancelar
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

};

export default ModulosYHabitaciones;