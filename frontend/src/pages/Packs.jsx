import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Packs.css";

const Packs = () => {
    const [packs, setPacks] = useState([]);
    const [packSeleccionado, setPackSeleccionado] = useState(null);
    const [error, setError] = useState(null);

    const [categorias, setCategorias] = useState([]);
    const [suministros, setSuministros] = useState([]);

    const [modalCrearPack, setModalCrearPack] = useState(false);
    const [nombrePack, setNombrePack] = useState("");
    const [descripcionPack, setDescripcionPack] = useState("");

    const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);

    const navigate = useNavigate();

    const [suministrosPack, setSuministrosPack] = useState([
        {
            categoria: "",
            suministro: "",
            cantidad: "",
        },
    ]);

    const [erroresFormulario, setErroresFormulario] = useState({});
    const [creandoPack, setCreandoPack] = useState(false);

    useEffect(() => {
        const obtenerPacks = async () => {
            try {
                const token = localStorage.getItem("access");

                const respuesta = await axios.get(
                    "http://127.0.0.1:8000/api/suministros/packs/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (Array.isArray(respuesta.data)) {
                    setPacks(respuesta.data);
                    setError(null);
                } else {
                    setError(
                        "La respuesta del servidor no tiene un formato válido."
                    );
                }
            } catch (error) {
                console.error(
                    "Error al obtener los packs:",
                    error
                );

                setError(
                    "No se han podido cargar los packs."
                );
            }
        };

        obtenerPacks();
    }, []);

    useEffect(() => {
        const obtenerSuministros = async () => {
            try {
                const token = localStorage.getItem("access");

                const respuesta = await axios.get(
                    "http://127.0.0.1:8000/api/suministros/suministros/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (Array.isArray(respuesta.data)) {
                    setSuministros(respuesta.data);
                }
            } catch (error) {
                console.error(
                    "Error al obtener los suministros:",
                    error
                );
            }
        };

        obtenerSuministros();
    }, []);

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const token = localStorage.getItem("access");

                const respuesta = await axios.get(
                    "http://127.0.0.1:8000/api/suministros/categorias/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (Array.isArray(respuesta.data)) {
                    setCategorias(respuesta.data);
                }
            } catch (error) {
                console.error(
                    "Error al obtener las categorías:",
                    error
                );
            }
        };

        obtenerCategorias();
    }, []);

    const abrirDetallePack = (pack) => {
        setPackSeleccionado(pack);
        setConfirmandoEliminacion(false);
    };

    const cerrarDetallePack = () => {
        setPackSeleccionado(null);
        setConfirmandoEliminacion(false);
    };

    const eliminarPack = async () => {

        const token = localStorage.getItem("access");

        try {

            await axios.delete(
                `http://127.0.0.1:8000/api/suministros/packs/${packSeleccionado.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPacks((packsActuales) =>
                packsActuales.filter(
                    (pack) => pack.id !== packSeleccionado.id
                )
            );

            cerrarDetallePack();

        } catch (error) {

            console.error(
                "Error al eliminar el pack:",
                error
            );

            cerrarDetallePack();

            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError(
                    "No se ha podido eliminar el pack."
                );
            }
        }
    };

    const abrirModalCrearPack = () => {
        setNombrePack("");
        setDescripcionPack("");

        setSuministrosPack([
            {
                categoria: "",
                suministro: "",
                cantidad: "",
            },
        ]);

        setErroresFormulario({});

        setModalCrearPack(true);
    };

    const cerrarModalCrearPack = () => {
        if (creandoPack) {
            return;
        }

        setModalCrearPack(false);

        setNombrePack("");
        setDescripcionPack("");

        setSuministrosPack([
            {
                categoria: "",
                suministro: "",
                cantidad: "",
            },
        ]);

        setErroresFormulario({});
    };

    const cambiarSuministroPack = (indice, valor) => {
        setSuministrosPack((suministrosAnteriores) =>
            suministrosAnteriores.map((fila, indiceFila) =>
                indiceFila === indice
                    ? {
                        ...fila,
                        suministro: valor,
                    }
                    : fila
            )
        );
    };

    const suministroSeleccionadoEnOtraFila = (
        suministroId,
        indiceFila
    ) => {
        return suministrosPack.some(
            (fila, indice) =>
                indice !== indiceFila &&
                String(fila.suministro) === String(suministroId)
        );
    };

    const cambiarCantidadPack = (indice, valor) => {
        setSuministrosPack((suministrosAnteriores) =>
            suministrosAnteriores.map((fila, indiceFila) =>
                indiceFila === indice
                    ? {
                        ...fila,
                        cantidad: valor,
                    }
                    : fila
            )
        );
    };

    const anadirSuministroPack = () => {
        setSuministrosPack((suministrosAnteriores) => [
            ...suministrosAnteriores,
            {
                categoria: "",
                suministro: "",
                cantidad: "",
            },
        ]);
    };

    const eliminarSuministroPack = (indice) => {
        setSuministrosPack((suministrosAnteriores) =>
            suministrosAnteriores.filter(
                (_, indiceFila) => indiceFila !== indice
            )
        );
    };

    const cambiarCategoriaPack = (indice, valor) => {
        setSuministrosPack((suministrosAnteriores) =>
            suministrosAnteriores.map((fila, indiceFila) =>
                indiceFila === indice
                    ? {
                        ...fila,
                        categoria: valor,
                        suministro: "",
                    }
                    : fila
            )
        );
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!nombrePack.trim()) {
            nuevosErrores.nombre =
                "El nombre es obligatorio.";
        } else if (nombrePack.trim().length > 100) {
            nuevosErrores.nombre =
                "El nombre no puede superar los 100 caracteres.";
        } else if (
            packs.some(
                (pack) =>
                    pack.nombre.trim().toLowerCase() ===
                    nombrePack.trim().toLowerCase()
            )
        ) {
            nuevosErrores.nombre =
                "Ya existe un pack con ese nombre.";
        }

        if (
            descripcionPack.trim().length > 500
        ) {
            nuevosErrores.descripcion =
                "La descripción no puede superar los 500 caracteres.";
        }

        for (const fila of suministrosPack) {
            if (!fila.suministro) {
                nuevosErrores.suministros =
                    "Debe seleccionar un suministro en todas las filas.";
                break;
            }

            if (
                !fila.cantidad ||
                Number(fila.cantidad) <= 0
            ) {
                nuevosErrores.suministros =
                    "La cantidad debe ser un número positivo.";
                break;
            }
        }

        setErroresFormulario(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const crearPack = async () => {
        if (!validarFormulario()) {
            return;
        }

        try {
            setCreandoPack(true);
            setErroresFormulario({});

            const token = localStorage.getItem("access");

            const respuestaPack = await axios.post(
                "http://127.0.0.1:8000/api/suministros/crearpack/",
                {
                    nombre: nombrePack.trim(),
                    descripcion: descripcionPack,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const packCreado = respuestaPack.data;

            for (const fila of suministrosPack) {
                await axios.post(
                    "http://127.0.0.1:8000/api/suministros/crearcontenidopack/",
                    {
                        pack: packCreado.id,
                        suministro: fila.suministro,
                        cantidad: Number(fila.cantidad),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            const respuestaPacks = await axios.get(
                "http://127.0.0.1:8000/api/suministros/packs/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (Array.isArray(respuestaPacks.data)) {
                setPacks(respuestaPacks.data);
            } else {
                setError(
                    "La respuesta del servidor no tiene un formato válido."
                );
            }

            cerrarModalCrearPack();

        } catch (error) {
            console.error(
                "Error al crear el pack:",
                error
            );

            if (error.response?.data) {
                const datosError = error.response.data;
                const erroresBackend = {};

                if (datosError.nombre) {
                    erroresBackend.nombre =
                        Array.isArray(datosError.nombre)
                            ? datosError.nombre[0]
                            : datosError.nombre;
                }

                if (datosError.descripcion) {
                    erroresBackend.descripcion =
                        Array.isArray(datosError.descripcion)
                            ? datosError.descripcion[0]
                            : datosError.descripcion;
                }

                if (datosError.suministro) {
                    erroresBackend.suministros =
                        Array.isArray(datosError.suministro)
                            ? datosError.suministro[0]
                            : datosError.suministro;
                }

                if (datosError.cantidad) {
                    erroresBackend.suministros =
                        Array.isArray(datosError.cantidad)
                            ? datosError.cantidad[0]
                            : datosError.cantidad;
                }

                if (datosError.pack) {
                    erroresBackend.suministros =
                        Array.isArray(datosError.pack)
                            ? datosError.pack[0]
                            : datosError.pack;
                }

                if (datosError.error) {
                    erroresBackend.general =
                        datosError.error;
                }

                if (Object.keys(erroresBackend).length > 0) {
                    setErroresFormulario(
                        erroresBackend
                    );
                } else {
                    setErroresFormulario({
                        general:
                            "No se ha podido crear el pack.",
                    });
                }
            } else {
                setErroresFormulario({
                    general:
                        "No se ha podido conectar con el servidor.",
                });
            }
        } finally {
            setCreandoPack(false);
        }
    };

    return (
        <div className="packs-container">

            <div className="packs-titulo">

                <div>
                    <h1>
                        Packs
                    </h1>

                    <p>
                        Gestión de los packs de suministros del centro.
                    </p>
                </div>

                <button
                    className="packs-anadir"
                    type="button"
                    onClick={abrirModalCrearPack}
                >
                    +
                </button>

            </div>

            {error && (
                <p className="packs-error">
                    {error}
                </p>
            )}

            <div className="packs-listado">

                {packs.length === 0 ? (

                    <p className="packs-sin-elementos">
                        No hay packs creados.
                    </p>

                ) : (

                    packs.map((pack) => (

                        <button
                            type="button"
                            className="pack-card"
                            key={pack.id}
                            onClick={() =>
                                abrirDetallePack(pack)
                            }
                        >

                            <strong>
                                {pack.nombre}
                            </strong>

                            <span>
                                {pack.descripcion ||
                                    "Sin descripción"}
                            </span>

                        </button>

                    ))

                )}

            </div>

            {packSeleccionado && (

                <div
                    className="pack-detalle-overlay"
                    onClick={cerrarDetallePack}
                >

                    <div
                        className="pack-detalle"
                        onClick={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        {!confirmandoEliminacion ? (

                            <>
                                <button
                                    type="button"
                                    className="pack-detalle-cerrar"
                                    onClick={cerrarDetallePack}
                                >
                                    ×
                                </button>

                                <h2>
                                    {packSeleccionado.nombre}
                                </h2>

                                <div className="pack-detalle-descripcion">

                                    <h3>
                                        Descripción
                                    </h3>

                                    <p>
                                        {packSeleccionado.descripcion ||
                                            "Sin descripción"}
                                    </p>

                                </div>

                                <div className="pack-detalle-contenido">

                                    <h3>
                                        Suministros incluidos
                                    </h3>

                                    {packSeleccionado.contenido &&
                                    packSeleccionado.contenido.length > 0 ? (

                                        <div>

                                            {packSeleccionado.contenido.map(
                                                (contenido) => (

                                                    <div
                                                        className="pack-suministro"
                                                        key={contenido.id}
                                                    >

                                                        <span>
                                                            {contenido.suministro_nombre}
                                                        </span>

                                                        <span>
                                                            {contenido.cantidad}{" "}
                                                            {contenido.suministro_unidad}
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <p>
                                            Este pack no contiene suministros.
                                        </p>

                                    )}

                                </div>

                                <div className="pack-detalle-botones">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/packs/asignar/${packSeleccionado.id}`
                                            )
                                        }
                                    >
                                        Asignar Pack
                                    </button>

                                    <button
                                        type="button"
                                        className="pack-eliminar"
                                        onClick={() =>
                                            setConfirmandoEliminacion(true)
                                        }
                                    >
                                        Eliminar pack
                                    </button>

                                </div>
                            </>

                        ) : (

                            <div className="pack-confirmar-eliminacion">

                                <h2>
                                    Eliminar pack
                                </h2>

                                <p>
                                    ¿Seguro que quieres eliminar el pack{" "}
                                    <strong>
                                        "{packSeleccionado.nombre}"
                                    </strong>
                                    ?
                                </p>

                                <p>
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="pack-detalle-botones">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmandoEliminacion(false)
                                        }
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        className="pack-eliminar"
                                        onClick={eliminarPack}
                                    >
                                        Eliminar pack
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            )}

            {modalCrearPack && (

                <div
                    className="crear-pack-overlay"
                    onClick={cerrarModalCrearPack}
                >

                    <div
                        className="crear-pack-confirmacion"
                        onClick={(evento) =>
                            evento.stopPropagation()
                        }
                    >

                        <h2>
                            Crear pack
                        </h2>

                        <div className="crear-pack-campo">

                            <label htmlFor="nombre-pack">
                                Nombre
                            </label>

                            <input
                                id="nombre-pack"
                                type="text"
                                value={nombrePack}
                                onChange={(evento) =>
                                    setNombrePack(
                                        evento.target.value
                                    )
                                }
                                autoFocus
                            />

                            {erroresFormulario.nombre && (
                                <p className="crear-pack-error">
                                    {erroresFormulario.nombre}
                                </p>
                            )}

                        </div>

                        <div className="crear-pack-campo">

                            <label htmlFor="descripcion-pack">
                                Descripción
                            </label>

                            <textarea
                                id="descripcion-pack"
                                value={descripcionPack}
                                onChange={(evento) =>
                                    setDescripcionPack(
                                        evento.target.value
                                    )
                                }
                            />

                            {erroresFormulario.descripcion && (
                                <p className="crear-pack-error">
                                    {erroresFormulario.descripcion}
                                </p>
                            )}

                        </div>

                        <div className="crear-pack-contenido">

                            <div className="crear-pack-titulo-suministros">

                                <label>
                                    Suministros
                                </label>

                                <button
                                    type="button"
                                    className="crear-pack-anadir-suministro"
                                    onClick={anadirSuministroPack}
                                >
                                    +
                                </button>

                            </div>

                            {suministrosPack.map(
                                (fila, indice) => (

                                    <div
                                        className="crear-pack-suministro"
                                        key={indice}
                                    >

                                        <select
                                            value={fila.categoria}
                                            onChange={(evento) =>
                                                cambiarCategoriaPack(
                                                    indice,
                                                    evento.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Categoría
                                            </option>

                                            {categorias.map(
                                                (categoria) => (

                                                    <option
                                                        key={categoria.id}
                                                        value={categoria.id}
                                                    >
                                                        {categoria.nombre}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                        <select
                                            value={fila.suministro}
                                            onChange={(evento) =>
                                                cambiarSuministroPack(
                                                    indice,
                                                    evento.target.value
                                                )
                                            }
                                            disabled={!fila.categoria}
                                        >
                                            <option value="">
                                                {fila.categoria
                                                    ? "Suministro"
                                                    : "---"}
                                            </option>

                                            {categorias
                                                .find(
                                                    (categoria) =>
                                                        String(categoria.id) ===
                                                        String(fila.categoria)
                                                )
                                                ?.suministros
                                                ?.filter(
                                                    (suministro) =>
                                                        !suministroSeleccionadoEnOtraFila(
                                                            suministro.id,
                                                            indice
                                                        )
                                                )
                                                .map((suministro) => (
                                                    <option
                                                        key={suministro.id}
                                                        value={suministro.id}
                                                    >
                                                        {suministro.nombre}
                                                    </option>
                                                ))}
                                        </select>

                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Cantidad"
                                            value={fila.cantidad}
                                            onChange={(evento) =>
                                                cambiarCantidadPack(
                                                    indice,
                                                    evento.target.value
                                                )
                                            }
                                        />

                                        {suministrosPack.length > 1 && (

                                            <button
                                                type="button"
                                                className="crear-pack-eliminar-suministro"
                                                onClick={() =>
                                                    eliminarSuministroPack(
                                                        indice
                                                    )
                                                }
                                            >
                                                -
                                            </button>

                                        )}

                                    </div>

                                )
                            )}

                            {erroresFormulario.suministros && (
                                <p className="crear-pack-error">
                                    {erroresFormulario.suministros}
                                </p>
                            )}

                        </div>

                        {erroresFormulario.general && (
                            <p className="crear-pack-error">
                                {erroresFormulario.general}
                            </p>
                        )}

                        <div className="crear-pack-botones">

                            <button
                                type="button"
                                onClick={crearPack}
                                disabled={creandoPack}
                            >
                                {creandoPack
                                    ? "Creando..."
                                    : "Crear pack"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarModalCrearPack}
                                disabled={creandoPack}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Packs;