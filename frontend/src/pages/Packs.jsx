import { useEffect, useState } from "react";
import axios from "axios";

import "./Packs.css";

const Packs = () => {
    const [packs, setPacks] = useState([]);
    const [packSeleccionado, setPackSeleccionado] = useState(null);
    const [error, setError] = useState(null);

    const [suministros, setSuministros] = useState([]);

    const [modalCrearPack, setModalCrearPack] = useState(false);
    const [nombrePack, setNombrePack] = useState("");
    const [descripcionPack, setDescripcionPack] = useState("");

    const [suministrosPack, setSuministrosPack] = useState([
        {
            suministro: "",
            cantidad: "",
        },
    ]);

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
                    "http://127.0.0.1:8000/api/suministros/",
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

    const abrirDetallePack = (pack) => {
        setPackSeleccionado(pack);
    };

    const cerrarDetallePack = () => {
        setPackSeleccionado(null);
    };

    const abrirModalCrearPack = () => {
        setNombrePack("");
        setDescripcionPack("");

        setSuministrosPack([
            {
                suministro: "",
                cantidad: "",
            },
        ]);

        setModalCrearPack(true);
    };

    const cerrarModalCrearPack = () => {
        setModalCrearPack(false);

        setNombrePack("");
        setDescripcionPack("");

        setSuministrosPack([
            {
                suministro: "",
                cantidad: "",
            },
        ]);
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

    return (
        <div className="packs-container">

            <div className="packs-titulo">

                <div>
                    <h1>Packs</h1>

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
                            onClick={() => abrirDetallePack(pack)}
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
                                                    {contenido.cantidad}
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
                                onClick={cerrarDetallePack}
                            >
                                Cerrar
                            </button>

                        </div>

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

                        <form>

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
                                                value={fila.suministro}
                                                onChange={(evento) =>
                                                    cambiarSuministroPack(
                                                        indice,
                                                        evento.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Seleccione un suministro
                                                </option>

                                                {suministros.map(
                                                    (suministro) => (

                                                        <option
                                                            key={suministro.id}
                                                            value={suministro.id}
                                                        >
                                                            {suministro.nombre}
                                                        </option>

                                                    )
                                                )}

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

                            </div>

                            <div className="crear-pack-botones">

                                <button
                                    type="submit"
                                >
                                    Crear pack
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarModalCrearPack}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Packs;