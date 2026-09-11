import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Suministros.css";

const Suministros = () => {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
    const [error, setError] = useState(null);

    const [modalCrearCategoria, setModalCrearCategoria] = useState(false);
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [descripcionCategoria, setDescripcionCategoria] = useState("");
    const [errorCrearCategoria, setErrorCrearCategoria] = useState(null);
    const [creandoCategoria, setCreandoCategoria] = useState(false);

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
                    setError(null);
                } else {
                    setError(
                        "La respuesta del servidor no tiene un formato válido."
                    );
                }
            } catch (error) {
                console.error(
                    "Error al obtener las categorías:",
                    error
                );

                setError(
                    "No se han podido cargar las categorías."
                );
            }
        };

        obtenerCategorias();
    }, []);

    const alternarCategoria = (categoriaId) => {
        setCategoriasAbiertas((estadoAnterior) => ({
            ...estadoAnterior,
            [categoriaId]: !estadoAnterior[categoriaId],
        }));
    };

    const abrirModalCrearCategoria = () => {
        setNombreCategoria("");
        setDescripcionCategoria("");
        setErrorCrearCategoria(null);
        setModalCrearCategoria(true);
    };

    const cerrarModalCrearCategoria = () => {
        if (creandoCategoria) {
            return;
        }

        setModalCrearCategoria(false);
        setNombreCategoria("");
        setDescripcionCategoria("");
        setErrorCrearCategoria(null);
    };

    const crearCategoria = async (evento) => {
        evento.preventDefault();

        if (!nombreCategoria.trim()) {
            setErrorCrearCategoria(
                "El nombre de la categoría es obligatorio."
            );
            return;
        }

        try {
            setCreandoCategoria(true);
            setErrorCrearCategoria(null);

            const token = localStorage.getItem("access");

            const respuesta = await axios.post(
                "http://127.0.0.1:8000/api/suministros/crearcategoria/",
                {
                    nombre: nombreCategoria.trim(),
                    descripcion: descripcionCategoria.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCategorias((categoriasAnteriores) => [
                ...categoriasAnteriores,
                {
                    ...respuesta.data,
                    suministros: respuesta.data.suministros || [],
                },
            ]);

            setModalCrearCategoria(false);
            setNombreCategoria("");
            setDescripcionCategoria("");
            setErrorCrearCategoria(null);
        } catch (error) {
            console.error(
                "Error al crear la categoría:",
                error
            );

            if (error.response?.data) {
                const errores = error.response.data;

                if (errores.nombre) {
                    setErrorCrearCategoria(
                        errores.nombre[0]
                    );
                } else if (errores.descripcion) {
                    setErrorCrearCategoria(
                        errores.descripcion[0]
                    );
                } else if (errores.error) {
                    setErrorCrearCategoria(
                        errores.error
                    );
                } else {
                    setErrorCrearCategoria(
                        "No se ha podido crear la categoría."
                    );
                }
            } else {
                setErrorCrearCategoria(
                    "No se ha podido crear la categoría."
                );
            }
        } finally {
            setCreandoCategoria(false);
        }
    };

    return (
        <div className="suministros-container">
            <div className="suministros-titulo">
                <div>
                    <h1>Suministros</h1>

                    <p>
                        Gestión de los suministros del centro dividido en categorías.
                    </p>
                </div>

                <button
                    className="suministros-anadir"
                    onClick={abrirModalCrearCategoria}
                >
                    +
                </button>
            </div>

            {error && (
                <p className="suministros-error">
                    {error}
                </p>
            )}

            <div className="suministros-listado">
                {categorias.map((categoria) => {
                    const abierta =
                        categoriasAbiertas[categoria.id] || false;

                    return (
                        <div
                            className="suministro-categoria-card"
                            key={categoria.id}
                        >
                            <button
                                className="suministro-categoria-boton"
                                onClick={() =>
                                    alternarCategoria(categoria.id)
                                }
                            >
                                <span>
                                    {categoria.nombre}
                                </span>

                                <span>
                                    {abierta ? "▼" : "▶"}
                                </span>
                            </button>

                            {abierta && (
                                <div className="suministros-categoria-listado">
                                    <p className="suministro-categoria-descripcion">
                                        {categoria.descripcion ||
                                            "Sin descripción"}
                                    </p>

                                    {categoria.suministros.length > 0 ? (
                                        categoria.suministros.map(
                                            (suministro) => (
                                                <div
                                                    className="suministro-item"
                                                    key={suministro.id}
                                                    onClick={() =>
                                                        navigate(
                                                            `/suministros/${suministro.id}`
                                                        )
                                                    }
                                                >
                                                    <span className="suministro-nombre">
                                                        {suministro.nombre}
                                                    </span>

                                                    <span className="suministro-stock">
                                                        {suministro.stock}{" "}
                                                        {suministro.unidad}
                                                    </span>
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <p className="suministros-sin-elementos">
                                            No hay suministros en esta categoría.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {modalCrearCategoria && (
                <div className="crear-categoria-overlay">
                    <div className="crear-categoria-confirmacion">
                        <h2>Crear categoría</h2>

                        <form onSubmit={crearCategoria}>
                            <div className="crear-categoria-campo">
                                <label htmlFor="nombre-categoria">
                                    Nombre
                                </label>

                                <input
                                    id="nombre-categoria"
                                    type="text"
                                    value={nombreCategoria}
                                    onChange={(evento) =>
                                        setNombreCategoria(
                                            evento.target.value
                                        )
                                    }
                                    disabled={creandoCategoria}
                                    autoFocus
                                />
                            </div>

                            <div className="crear-categoria-campo">
                                <label htmlFor="descripcion-categoria">
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion-categoria"
                                    value={descripcionCategoria}
                                    onChange={(evento) =>
                                        setDescripcionCategoria(
                                            evento.target.value
                                        )
                                    }
                                    disabled={creandoCategoria}
                                />
                            </div>

                            {errorCrearCategoria && (
                                <p className="crear-categoria-error">
                                    {errorCrearCategoria}
                                </p>
                            )}

                            <div className="crear-categoria-botones">
                                <button
                                    type="submit"
                                    disabled={creandoCategoria}
                                >
                                    {creandoCategoria
                                        ? "Creando..."
                                        : "Crear categoría"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarModalCrearCategoria}
                                    disabled={creandoCategoria}
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

export default Suministros;