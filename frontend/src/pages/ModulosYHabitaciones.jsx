import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPencilAlt, FaTrash, FaSearch  } from "react-icons/fa";

import "./ModulosYHabitaciones.css";

const ModulosYHabitaciones = () => {
    const navigate = useNavigate();

    const [modulos, setModulos] = useState([]);
    const [habitaciones, setHabitaciones] = useState({});
    const [error, setError] = useState(null);

    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [orden, setOrden] = useState("nombre_asc");

    const [paginasHabitaciones, setPaginasHabitaciones] = useState({});
    const [paginaModulos, setPaginaModulos] = useState(1);

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

    const [mostrarCrearHabitacion, setMostrarCrearHabitacion] =
        useState(false);
    const [moduloHabitacion, setModuloHabitacion] = useState(null);

    const [nombreHabitacion, setNombreHabitacion] = useState("");
    const [infoHabitacion, setInfoHabitacion] = useState("");
    const [capacidadHabitacion, setCapacidadHabitacion] = useState("");

    const [erroresHabitacion, setErroresHabitacion] = useState({});
    const [creandoHabitacion, setCreandoHabitacion] = useState(false);

    const [mostrarEditarHabitacion, setMostrarEditarHabitacion] =
        useState(false);
    const [habitacionEditando, setHabitacionEditando] = useState(null);

    const [nombreHabitacionEditar, setNombreHabitacionEditar] = useState("");
    const [infoHabitacionEditar, setInfoHabitacionEditar] = useState("");
    const [capacidadHabitacionEditar] =
        useState("");

    const [erroresEditarHabitacion, setErroresEditarHabitacion] =
        useState({});
    const [editandoHabitacion, setEditandoHabitacion] = useState(false);

    const [mostrarEliminarHabitacion, setMostrarEliminarHabitacion] =
        useState(false);
    const [habitacionEliminando, setHabitacionEliminando] = useState(null);
    const [eliminandoHabitacion, setEliminandoHabitacion] = useState(false);
    const [errorEliminarHabitacion, setErrorEliminarHabitacion] =
        useState(null);

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

                    respuesta.data.forEach((modulo) => {
                        obtenerHabitaciones(modulo.id);
                    });
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

        const obtenerHabitaciones = async (moduloId) => {
            try {
                const token = localStorage.getItem("access");

                const respuesta = await axios.get(
                    `http://127.0.0.1:8000/api/modulos/${moduloId}/habitaciones/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setHabitaciones((habitacionesActuales) => ({
                    ...habitacionesActuales,
                    [moduloId]: Array.isArray(respuesta.data)
                        ? respuesta.data
                        : [],
                }));
            } catch (error) {
                console.error(
                    `Error al obtener las habitaciones del módulo ${moduloId}:`,
                    error
                );

                setHabitaciones((habitacionesActuales) => ({
                    ...habitacionesActuales,
                    [moduloId]: [],
                }));
            }
        };

        obtenerModulos();
    }, []);

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const obtenerNumeroResidentesModulo = (moduloId) => {
        const habitacionesModulo = habitaciones[moduloId] || [];

        return habitacionesModulo.reduce(
            (total, habitacion) =>
                total + Number(habitacion.residentes_actuales || 0),
            0
        );
    };

    const obtenerPorcentajeOcupacionModulo = (modulo) => {
        const habitacionesModulo = habitaciones[modulo.id] || [];

        const residentesActuales = habitacionesModulo.reduce(
            (total, habitacion) =>
                total + Number(habitacion.residentes_actuales || 0),
            0
        );

        const capacidadTotal = habitacionesModulo.reduce(
            (total, habitacion) =>
                total + Number(habitacion.capacidad || 0),
            0
        );

        if (!capacidadTotal) {
            return 0;
        }

        return (residentesActuales / capacidadTotal) * 100;
    };

    const modulosFiltrados = modulos.filter((modulo) => {
        const texto = normalizarTexto(terminoBusqueda);

        return (
            texto === "" ||
            normalizarTexto(modulo.nombre).includes(texto)
        );
    });

    const modulosOrdenados = [...modulosFiltrados].sort((a, b) => {
        const habitacionesA = habitaciones[a.id] || [];
        const habitacionesB = habitaciones[b.id] || [];

        const residentesA = obtenerNumeroResidentesModulo(a.id);
        const residentesB = obtenerNumeroResidentesModulo(b.id);

        const nombreA = normalizarTexto(a.nombre || "");
        const nombreB = normalizarTexto(b.nombre || "");

        const habitacionesActualesA = habitacionesA.length;
        const habitacionesActualesB = habitacionesB.length;

        const ocupacionA = obtenerPorcentajeOcupacionModulo(a);
        const ocupacionB = obtenerPorcentajeOcupacionModulo(b);

        if (orden === "nombre_asc") {
            return nombreA.localeCompare(nombreB);
        }

        if (orden === "nombre_desc") {
            return nombreB.localeCompare(nombreA);
        }

        if (orden === "residentes_asc") {
            return residentesA - residentesB;
        }

        if (orden === "residentes_desc") {
            return residentesB - residentesA;
        }

        if (orden === "habitaciones_asc") {
            return habitacionesActualesA - habitacionesActualesB;
        }

        if (orden === "habitaciones_desc") {
            return habitacionesActualesB - habitacionesActualesA;
        }

        if (orden === "ocupacion_asc") {
            return ocupacionA - ocupacionB;
        }

        if (orden === "ocupacion_desc") {
            return ocupacionB - ocupacionA;
        }

        return 0;
    });

    useEffect(() => {
        setPaginaModulos(1);
    }, [terminoBusqueda, orden]);

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (nombre.trim().length > 100) {
            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";
        } else {
            const nombreModuloExiste = modulos.some(
                (modulo) =>
                    modulo.nombre.trim().toLowerCase() ===
                    nombre.trim().toLowerCase()
            );

            if (nombreModuloExiste) {
                nuevosErrores.nombre =
                    "Ya existe un módulo con ese nombre.";
            }
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

            setHabitaciones((habitacionesActuales) => ({
                ...habitacionesActuales,
                [respuesta.data.id]: [],
            }));

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
                        general: "No se ha podido crear el módulo.",
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
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (nombreEditar.trim().length > 100) {
            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";
        } else {
            const nombreModuloExiste = modulos.some(
                (modulo) =>
                    modulo.id !== moduloEditando.id &&
                    modulo.nombre.trim().toLowerCase() ===
                    nombreEditar.trim().toLowerCase()
            );

            if (nombreModuloExiste) {
                nuevosErrores.nombre =
                    "Ya existe un módulo con ese nombre.";
            }
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

            setHabitaciones((habitacionesActuales) => {
                const nuevasHabitaciones = {
                    ...habitacionesActuales,
                };

                delete nuevasHabitaciones[moduloEliminando.id];

                return nuevasHabitaciones;
            });

            setPaginasHabitaciones((paginasActuales) => {
                const nuevasPaginas = {
                    ...paginasActuales,
                };

                delete nuevasPaginas[moduloEliminando.id];

                return nuevasPaginas;
            });

            setMostrarEliminarModulo(false);
            setModuloEliminando(null);
        } catch (error) {
            console.error(
                "Error al eliminar el módulo:",
                error
            );

            if (error.response?.data?.error) {
                setErrorEliminar(
                    error.response.data.error
                );
            } else {
                setErrorEliminar(
                    "No se ha podido eliminar el módulo."
                );
            }
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

    const abrirCrearHabitacion = (modulo) => {
        setModuloHabitacion(modulo);

        setNombreHabitacion("");
        setInfoHabitacion("");
        setCapacidadHabitacion("");

        setErroresHabitacion({});

        setMostrarCrearHabitacion(true);
    };

    const validarHabitacion = () => {
        const nuevosErrores = {};

        if (!nombreHabitacion.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (nombreHabitacion.trim().length > 100) {
            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";
        } else {
            const nombreHabitacionExiste =
                (habitaciones[moduloHabitacion.id] || []).some(
                    (habitacion) =>
                        habitacion.nombre.trim().toLowerCase() ===
                        nombreHabitacion.trim().toLowerCase()
                );

            if (nombreHabitacionExiste) {
                nuevosErrores.nombre =
                    "Ya existe una habitación con ese nombre en este módulo.";
            }
        }

        if (!capacidadHabitacion) {
            nuevosErrores.capacidad =
                "La capacidad es obligatoria.";
        } else if (
            !Number.isInteger(Number(capacidadHabitacion)) ||
            Number(capacidadHabitacion) < 1
        ) {
            nuevosErrores.capacidad =
                "La capacidad debe ser un número entero mayor o igual que 1.";
        }

        setErroresHabitacion(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const crearHabitacion = async () => {
        if (!validarHabitacion()) {
            return;
        }

        try {
            setCreandoHabitacion(true);
            setErroresHabitacion({});

            const token = localStorage.getItem("access");

            const respuesta = await axios.post(
                `http://127.0.0.1:8000/api/modulos/${moduloHabitacion.id}/habitaciones/crear/`,
                {
                    nombre: nombreHabitacion.trim(),
                    info: infoHabitacion,
                    capacidad: Number(capacidadHabitacion),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setHabitaciones((habitacionesActuales) => ({
                ...habitacionesActuales,
                [moduloHabitacion.id]: [
                    ...(habitacionesActuales[moduloHabitacion.id] || []),
                    respuesta.data,
                ],
            }));

            cerrarCrearHabitacion();
        } catch (error) {
            console.error(
                "Error al crear la habitación:",
                error
            );

            if (error.response?.data?.error) {
                setErroresHabitacion({
                    general: error.response.data.error,
                });
            } else if (error.response?.data) {
                const erroresBackend = {};

                if (error.response.data.nombre) {
                    erroresBackend.nombre =
                        error.response.data.nombre[0];
                }

                if (error.response.data.capacidad) {
                    erroresBackend.capacidad =
                        error.response.data.capacidad[0];
                }

                if (error.response.data.info) {
                    erroresBackend.info =
                        error.response.data.info[0];
                }

                if (Object.keys(erroresBackend).length > 0) {
                    setErroresHabitacion(erroresBackend);
                } else {
                    setErroresHabitacion({
                        general:
                            "No se ha podido crear la habitación.",
                    });
                }
            } else {
                setErroresHabitacion({
                    general:
                        "No se ha podido conectar con el servidor.",
                });
            }
        } finally {
            setCreandoHabitacion(false);
        }
    };

    const cerrarCrearHabitacion = () => {
        setMostrarCrearHabitacion(false);

        setModuloHabitacion(null);

        setNombreHabitacion("");
        setInfoHabitacion("");
        setCapacidadHabitacion("");

        setErroresHabitacion({});
    };

    const abrirEditarHabitacion = (habitacion) => {
        setHabitacionEditando(habitacion);

        setNombreHabitacionEditar(habitacion.nombre);
        setInfoHabitacionEditar(habitacion.info || "");
        setCapacidadHabitacionEditar(habitacion.capacidad);

        setErroresEditarHabitacion({});

        setMostrarEditarHabitacion(true);
    };

    const validarEditarHabitacion = () => {
        const nuevosErrores = {};

        if (!nombreHabitacionEditar.trim()) {
            nuevosErrores.nombre =
                "El nombre es obligatorio.";
        } else if (nombreHabitacionEditar.trim().length > 100) {
            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";
        } else {
            const nombreHabitacionExiste =
                (habitaciones[habitacionEditando.modulo] || []).some(
                    (habitacion) =>
                        habitacion.id !== habitacionEditando.id &&
                        habitacion.nombre.trim().toLowerCase() ===
                            nombreHabitacionEditar.trim().toLowerCase()
                );

            if (nombreHabitacionExiste) {
                nuevosErrores.nombre =
                    "Ya existe una habitación con ese nombre en este módulo.";
            }
        }

        if (!capacidadHabitacionEditar) {
            nuevosErrores.capacidad =
                "La capacidad es obligatoria.";
        } else if (
            !Number.isInteger(
                Number(capacidadHabitacionEditar)
            ) ||
            Number(capacidadHabitacionEditar) < 1
        ) {
            nuevosErrores.capacidad =
                "La capacidad debe ser un número entero mayor o igual que 1.";
        } else if (
            Number(capacidadHabitacionEditar) <
            Number(habitacionEditando.residentes_actuales || 0)
        ) {
            nuevosErrores.capacidad =
                "La capacidad no puede ser inferior al número de residentes actuales.";
        }

        setErroresEditarHabitacion(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const editarHabitacion = async () => {
        if (!validarEditarHabitacion()) {
            return;
        }

        try {
            setEditandoHabitacion(true);
            setErroresEditarHabitacion({});

            const token = localStorage.getItem("access");

            const respuesta = await axios.put(
                `http://127.0.0.1:8000/api/modulos/${habitacionEditando.modulo}/habitaciones/${habitacionEditando.id}/editar/`,
                {
                    nombre: nombreHabitacionEditar.trim(),
                    info: infoHabitacionEditar,
                    capacidad: Number(
                        capacidadHabitacionEditar
                    ),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setHabitaciones((habitacionesActuales) => ({
                ...habitacionesActuales,
                [habitacionEditando.modulo]: (
                    habitacionesActuales[
                        habitacionEditando.modulo
                    ] || []
                ).map((habitacion) =>
                    habitacion.id === respuesta.data.id
                        ? respuesta.data
                        : habitacion
                ),
            }));

            cerrarEditarHabitacion();
        } catch (error) {
            console.error(
                "Error al editar la habitación:",
                error
            );

            if (error.response?.data) {
                const erroresBackend = {};

                if (error.response.data.nombre) {
                    erroresBackend.nombre =
                        error.response.data.nombre[0];
                }

                if (error.response.data.capacidad) {
                    erroresBackend.capacidad =
                        error.response.data.capacidad[0];
                }

                if (error.response.data.info) {
                    erroresBackend.info =
                        error.response.data.info[0];
                }

                if (Object.keys(erroresBackend).length > 0) {
                    setErroresEditarHabitacion(
                        erroresBackend
                    );
                } else {
                    setErroresEditarHabitacion({
                        general:
                            error.response.data.error ||
                            "No se ha podido editar la habitación.",
                    });
                }
            } else {
                setErroresEditarHabitacion({
                    general:
                        "No se ha podido conectar con el servidor.",
                });
            }
        } finally {
            setEditandoHabitacion(false);
        }
    };

    const cerrarEditarHabitacion = () => {
        setMostrarEditarHabitacion(false);

        setHabitacionEditando(null);

        setNombreHabitacionEditar("");
        setInfoHabitacionEditar("");
        setCapacidadHabitacionEditar("");

        setErroresEditarHabitacion({});
    };

    const abrirEliminarHabitacion = (habitacion) => {
        setHabitacionEliminando(habitacion);

        setErrorEliminarHabitacion(null);

        setMostrarEliminarHabitacion(true);
    };

    const eliminarHabitacion = async () => {
        try {
            setEliminandoHabitacion(true);
            setErrorEliminarHabitacion(null);

            const token = localStorage.getItem("access");

            await axios.delete(
                `http://127.0.0.1:8000/api/modulos/${habitacionEliminando.modulo}/habitaciones/${habitacionEliminando.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setHabitaciones((habitacionesActuales) => ({
                ...habitacionesActuales,
                [habitacionEliminando.modulo]: (
                    habitacionesActuales[
                        habitacionEliminando.modulo
                    ] || []
                ).filter(
                    (habitacion) =>
                        habitacion.id !==
                        habitacionEliminando.id
                ),
            }));

            setMostrarEliminarHabitacion(false);
            setHabitacionEliminando(null);
        } catch (error) {
            console.error(
                "Error al eliminar la habitación:",
                error
            );

            if (error.response?.data?.error) {
                setErrorEliminarHabitacion(
                    error.response.data.error
                );
            } else {
                setErrorEliminarHabitacion(
                    "No se ha podido eliminar la habitación."
                );
            }
        } finally {
            setEliminandoHabitacion(false);
        }
    };

    const cerrarEliminarHabitacion = () => {
        if (eliminandoHabitacion) {
            return;
        }

        setMostrarEliminarHabitacion(false);
        setHabitacionEliminando(null);
        setErrorEliminarHabitacion(null);
    };

    const obtenerClaseOcupacion = (habitacion) => {
        const capacidad = Number(habitacion.capacidad);

        const residentesActuales =
            Number(habitacion.residentes_actuales || 0);

        if (!capacidad) {
            return "habitacion-bloque-sin-capacidad";
        }

        const ocupacion =
            (residentesActuales / capacidad) * 100;

        if (ocupacion >= 100) {
            return "habitacion-bloque-completa";
        }

        if (ocupacion >= 75) {
            return "habitacion-bloque-alta";
        }

        if (ocupacion >= 50) {
            return "habitacion-bloque-media";
        }

        return "habitacion-bloque-baja";
    };

    const modulosPorPagina = 2;
    const indiceUltimoModulo =
        paginaModulos * modulosPorPagina;
    const indicePrimerModulo =
        indiceUltimoModulo - modulosPorPagina;

    const modulosActuales = modulosOrdenados.slice(
        indicePrimerModulo,
        indiceUltimoModulo
    );

    const totalPaginasModulos = Math.ceil(
        modulosOrdenados.length / modulosPorPagina
    );

    return (
        <div className="modulos-container">
            <div className="modulos-titulo">
                <div>
                    <h1>Módulos</h1>

                    <p>
                        Gestión de los módulos del centro
                    </p>
                </div>

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

            {modulos.length > 0 && (
                <div className="modulos-controles">
                    <div className="modulos-buscador">
                        <div className="modulos-buscador-input">
                            <FaSearch className="modulos-buscador-icono" />
                            <input
                                type="text"
                                placeholder="Buscar módulos..."
                                value={terminoBusqueda}
                                onChange={(e) =>
                                    setTerminoBusqueda(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="modulos-ordenacion">
                        <label htmlFor="orden-modulos">
                            Ordenar por:
                        </label>

                        <select
                            id="orden-modulos"
                            value={orden}
                            onChange={(e) =>
                                setOrden(e.target.value)
                            }
                        >
                            <option value="nombre_asc">
                                Nombre A-Z
                            </option>

                            <option value="nombre_desc">
                                Nombre Z-A
                            </option>

                            <option value="residentes_asc">
                                Residentes actuales: menor a mayor
                            </option>

                            <option value="residentes_desc">
                                Residentes actuales: mayor a menor
                            </option>

                            <option value="habitaciones_asc">
                                Habitaciones actuales: menor a mayor
                            </option>

                            <option value="habitaciones_desc">
                                Habitaciones actuales: mayor a menor
                            </option>

                            <option value="ocupacion_asc">
                                Porcentaje de ocupación: menor a mayor
                            </option>

                            <option value="ocupacion_desc">
                                Porcentaje de ocupación: mayor a menor
                            </option>
                        </select>
                    </div>
                </div>
            )}

            {modulosFiltrados.length === 0 && modulos.length > 0 ? (
                <div className="modulos-vacio">
                    <p>
                        No se han encontrado módulos que coincidan con la búsqueda.
                    </p>
                </div>
            ) : (
                <div className="modulos-listado">
                    {modulosActuales.map((modulo) => {
                        const habitacionesModulo =
                            habitaciones[modulo.id] || [];

                        const paginaActual =
                            paginasHabitaciones[modulo.id] || 1;

                        const habitacionesPorPagina = 4;

                        const indiceUltimaHabitacion =
                            paginaActual * habitacionesPorPagina;

                        const indicePrimeraHabitacion =
                            indiceUltimaHabitacion -
                            habitacionesPorPagina;

                        const habitacionesActuales =
                            habitacionesModulo.slice(
                                indicePrimeraHabitacion,
                                indiceUltimaHabitacion
                            );

                        const totalPaginasHabitaciones =
                            Math.ceil(
                                habitacionesModulo.length /
                                    habitacionesPorPagina
                            );

                        const residentesActualesModulo =
                            obtenerNumeroResidentesModulo(modulo.id);

                        const porcentajeOcupacionModulo =
                            obtenerPorcentajeOcupacionModulo(modulo);

                        return (
                            <div
                                className="modulo-card"
                                key={modulo.id}
                            >
                                <div className="modulo-cabecera">
                                    <h2>
                                        {modulo.nombre}
                                    </h2>

                                    <div className="modulo-acciones">
                                        <div className="modulo-ocupacion">
                                            <span className="modulo-ocupacion-valor">
                                                {porcentajeOcupacionModulo.toFixed(0)}%
                                            </span>
                                            <span className="modulo-ocupacion-texto">
                                                Ocupación
                                            </span>
                                        </div>

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
                                    Habitaciones:{" "}
                                    {habitacionesModulo.length} /{" "}
                                    {modulo.num_habitaciones_max}
                                </p>

                                <p className="modulo-residentes-actuales">
                                    Residentes actuales:{" "}
                                    {residentesActualesModulo}
                                </p>

                                <div className="modulo-contenido">
                                    <div className="habitaciones-titulo">
                                        <h3>
                                            Habitaciones
                                        </h3>

                                        <button
                                            type="button"
                                            className="habitacion-anadir"
                                            onClick={() =>
                                                abrirCrearHabitacion(modulo)
                                            }
                                            disabled={
                                                habitacionesModulo.length >=
                                                modulo.num_habitaciones_max
                                            }
                                            title={
                                                habitacionesModulo.length >=
                                                modulo.num_habitaciones_max
                                                    ? "El módulo ha alcanzado su máximo de habitaciones"
                                                    : "Añadir habitación"
                                            }
                                            aria-label="Añadir habitación"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="habitaciones-bloques">
                                        {habitacionesModulo.length === 0 ? (
                                            <p className="habitaciones-bloques-vacio">
                                                No hay habitaciones en este módulo.
                                            </p>
                                        ) : (
                                            habitacionesActuales.map(
                                                (habitacion) => {
                                                    const claseOcupacion =
                                                        obtenerClaseOcupacion(
                                                            habitacion
                                                        );

                                                    const residentesActuales =
                                                        Number(
                                                            habitacion.residentes_actuales ||
                                                                0
                                                        );

                                                    const capacidad =
                                                        Number(
                                                            habitacion.capacidad
                                                        );

                                                    return (
                                                        <div
                                                            className={`habitacion-bloque ${claseOcupacion}`}
                                                            key={habitacion.id}
                                                            onClick={() =>
                                                                navigate(
                                                                    `/modulos/${modulo.id}/habitacion/${habitacion.id}`
                                                                )
                                                            }
                                                        >
                                                            <div className="habitacion-bloque-cabecera">
                                                                <h4>
                                                                    {habitacion.nombre}
                                                                </h4>

                                                                <div className="modulo-acciones">
                                                                    <button
                                                                        type="button"
                                                                        className="modulo-editar"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            abrirEditarHabitacion(
                                                                                habitacion
                                                                            );
                                                                        }}
                                                                        title="Editar habitación"
                                                                        aria-label="Editar habitación"
                                                                    >
                                                                        <FaPencilAlt />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="modulo-eliminar"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            abrirEliminarHabitacion(
                                                                                habitacion
                                                                            );
                                                                        }}
                                                                        title="Eliminar habitación"
                                                                        aria-label="Eliminar habitación"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="habitacion-ocupacion">
                                                                <span className="habitacion-residentes">
                                                                    {residentesActuales}
                                                                </span>

                                                                <span className="habitacion-capacidad">
                                                                    / {capacidad} residentes
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )
                                        )}
                                    </div>

                                    {totalPaginasHabitaciones > 1 && (
                                        <div className="habitaciones-paginacion">
                                            <button
                                                type="button"
                                                disabled={paginaActual === 1}
                                                onClick={() =>
                                                    setPaginasHabitaciones(
                                                        (paginasActuales) => ({
                                                            ...paginasActuales,
                                                            [modulo.id]:
                                                                paginaActual - 1,
                                                        })
                                                    )
                                                }
                                            >
                                                Anterior
                                            </button>

                                            <span>
                                                Página {paginaActual} de{" "}
                                                {totalPaginasHabitaciones}
                                            </span>

                                            <button
                                                type="button"
                                                disabled={
                                                    paginaActual ===
                                                    totalPaginasHabitaciones
                                                }
                                                onClick={() =>
                                                    setPaginasHabitaciones(
                                                        (paginasActuales) => ({
                                                            ...paginasActuales,
                                                            [modulo.id]:
                                                                paginaActual + 1,
                                                        })
                                                    )
                                                }
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPaginasModulos > 1 && (
                <div className="modulos-paginacion">
                    <button
                        type="button"
                        disabled={paginaModulos === 1}
                        onClick={() =>
                            setPaginaModulos(
                                (paginaActual) => paginaActual - 1
                            )
                        }
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaModulos} de{" "}
                        {totalPaginasModulos}
                    </span>

                    <button
                        type="button"
                        disabled={
                            paginaModulos === totalPaginasModulos
                        }
                        onClick={() =>
                            setPaginaModulos(
                                (paginaActual) => paginaActual + 1
                            )
                        }
                    >
                        Siguiente
                    </button>
                </div>
            )}

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
                                onChange={(e) =>
                                    setNombre(e.target.value)
                                }
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

            {mostrarCrearHabitacion && (
                <div className="crear-modulo-overlay">
                    <div className="crear-modulo-confirmacion">
                        <h2>
                            Crear habitación
                        </h2>

                        <p>
                            Módulo:{" "}
                            <strong>
                                {moduloHabitacion?.nombre}
                            </strong>
                        </p>

                        <div className="crear-modulo-campo">
                            <label htmlFor="nombre-habitacion">
                                Nombre
                            </label>

                            <input
                                id="nombre-habitacion"
                                type="text"
                                value={nombreHabitacion}
                                onChange={(e) =>
                                    setNombreHabitacion(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresHabitacion.nombre && (
                                <p className="crear-modulo-error">
                                    {erroresHabitacion.nombre}
                                </p>
                            )}
                        </div>

                        <div className="crear-modulo-campo">
                            <label htmlFor="info-habitacion">
                                Información
                            </label>

                            <textarea
                                id="info-habitacion"
                                value={infoHabitacion}
                                onChange={(e) =>
                                    setInfoHabitacion(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresHabitacion.info && (
                                <p className="crear-modulo-error">
                                    {erroresHabitacion.info}
                                </p>
                            )}
                        </div>

                        <div className="crear-modulo-campo">
                            <label htmlFor="capacidad-habitacion">
                                Capacidad
                            </label>

                            <input
                                id="capacidad-habitacion"
                                type="number"
                                min="1"
                                value={capacidadHabitacion}
                                onChange={(e) =>
                                    setCapacidadHabitacion(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresHabitacion.capacidad && (
                                <p className="crear-modulo-error">
                                    {erroresHabitacion.capacidad}
                                </p>
                            )}
                        </div>

                        {erroresHabitacion.general && (
                            <p className="crear-modulo-error">
                                {erroresHabitacion.general}
                            </p>
                        )}

                        <div className="crear-modulo-botones">
                            <button
                                type="button"
                                onClick={crearHabitacion}
                                disabled={creandoHabitacion}
                            >
                                {creandoHabitacion
                                    ? "Creando..."
                                    : "Crear"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarCrearHabitacion}
                                disabled={creandoHabitacion}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarEditarHabitacion && (
                <div className="crear-modulo-overlay">
                    <div className="crear-modulo-confirmacion">
                        <h2>
                            Editar habitación
                        </h2>

                        <div className="crear-modulo-campo">
                            <label htmlFor="nombre-habitacion-editar">
                                Nombre
                            </label>

                            <input
                                id="nombre-habitacion-editar"
                                type="text"
                                value={nombreHabitacionEditar}
                                onChange={(e) =>
                                    setNombreHabitacionEditar(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresEditarHabitacion.nombre && (
                                <p className="crear-modulo-error">
                                    {erroresEditarHabitacion.nombre}
                                </p>
                            )}
                        </div>

                        <div className="crear-modulo-campo">
                            <label htmlFor="info-habitacion-editar">
                                Información
                            </label>

                            <textarea
                                id="info-habitacion-editar"
                                value={infoHabitacionEditar}
                                onChange={(e) =>
                                    setInfoHabitacionEditar(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresEditarHabitacion.info && (
                                <p className="crear-modulo-error">
                                    {erroresEditarHabitacion.info
                                    }
                                </p>
                            )}
                        </div>

                        <div className="crear-modulo-campo">
                            <label htmlFor="capacidad-habitacion-editar">
                                Capacidad
                            </label>

                            <input
                                id="capacidad-habitacion-editar"
                                type="number"
                                min="1"
                                value={capacidadHabitacionEditar}
                                onChange={(e) =>
                                    setCapacidadHabitacionEditar(
                                        e.target.value
                                    )
                                }
                            />

                            {erroresEditarHabitacion.capacidad && (
                                <p className="crear-modulo-error">
                                    {
                                        erroresEditarHabitacion.capacidad
                                    }
                                </p>
                            )}
                        </div>

                        {erroresEditarHabitacion.general && (
                            <p className="crear-modulo-error">
                                {erroresEditarHabitacion.general}
                            </p>
                        )}

                        <div className="crear-modulo-botones">
                            <button
                                type="button"
                                onClick={editarHabitacion}
                                disabled={editandoHabitacion}
                            >
                                {editandoHabitacion
                                    ? "Guardando..."
                                    : "Guardar"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarEditarHabitacion}
                                disabled={editandoHabitacion}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarEliminarHabitacion && (
                <div className="eliminar-modulo-overlay">
                    <div className="eliminar-modulo-confirmacion">
                        <p>
                            ¿Seguro que desea eliminar la habitación{" "}
                            <strong>
                                {habitacionEliminando?.nombre}
                            </strong>
                            ?
                        </p>

                        {errorEliminarHabitacion && (
                            <p className="eliminar-modulo-error">
                                {errorEliminarHabitacion}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={eliminarHabitacion}
                            disabled={eliminandoHabitacion}
                        >
                            {eliminandoHabitacion
                                ? "Eliminando..."
                                : "Sí, eliminar habitación"}
                        </button>

                        <button
                            type="button"
                            onClick={cerrarEliminarHabitacion}
                            disabled={eliminandoHabitacion}
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