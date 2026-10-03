import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaPencilAlt,
    FaTrash,
    FaSearch,
    FaFilter,
    FaExclamationTriangle,
} from "react-icons/fa";

import "./Suministros.css";

const Suministros = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [categorias, setCategorias] = useState([]);
    const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
    const [error, setError] = useState(null);

    const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [unidad, setUnidad] = useState("");
    const [estadoStock, setEstadoStock] = useState("");
    const [orden, setOrden] = useState("nombre_asc");
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const [paginaCategorias, setPaginaCategorias] = useState(1);

    const [modalCrearCategoria, setModalCrearCategoria] = useState(false);
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [descripcionCategoria, setDescripcionCategoria] = useState("");
    const [errorCrearCategoria, setErrorCrearCategoria] = useState(null);
    const [creandoCategoria, setCreandoCategoria] = useState(false);

    const [mostrarEliminarCategoria, setMostrarEliminarCategoria] =
        useState(false);
    const [categoriaEliminando, setCategoriaEliminando] = useState(null);
    const [errorEliminarCategoria, setErrorEliminarCategoria] = useState(null);
    const [eliminandoCategoria, setEliminandoCategoria] = useState(false);

    const [mostrarEditarSuministro, setMostrarEditarSuministro] =
        useState(false);
    const [suministroEditando, setSuministroEditando] = useState(null);

    const [categoriaEditar, setCategoriaEditar] = useState("");
    const [stockMinimoEditar, setStockMinimoEditar] = useState("");
    const [detallesEditar, setDetallesEditar] = useState("");
    const [errorEditarSuministro, setErrorEditarSuministro] = useState(null);
    const [editandoSuministro, setEditandoSuministro] = useState(false);

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const categoriasDisponibles = categorias
        .map((categoria) => ({
            id: categoria.id,
            nombre: categoria.nombre || "",
        }))
        .sort((a, b) =>
            normalizarTexto(a.nombre).localeCompare(
                normalizarTexto(b.nombre)
            )
        );

    const unidadesDisponibles = [
        ...new Set(
            categorias.flatMap((categoria) =>
                (categoria.suministros || []).map(
                    (suministro) => suministro.unidad || ""
                )
            )
        ),
    ]
        .filter((unidad) => unidad !== "")
        .sort((a, b) =>
            normalizarTexto(a).localeCompare(normalizarTexto(b))
        );

    const obtenerNumeroSuministrosCategoria = (categoriaId) => {
        const categoriaEncontrada = categorias.find(
            (categoria) => categoria.id === categoriaId
        );

        return (categoriaEncontrada?.suministros || []).length;
    };

    const obtenerStockTotalCategoria = (categoriaId) => {
        const categoriaEncontrada = categorias.find(
            (categoria) => categoria.id === categoriaId
        );

        return (categoriaEncontrada?.suministros || []).reduce(
            (total, suministro) =>
                total + Number(suministro.stock || 0),
            0
        );
    };

    const comprobarEstadoStock = (suministro) => {
        const stock = Number(suministro.stock || 0);
        const stockMinimo = Number(suministro.stock_minimo || 0);

        if (stock === 0) {
            return "sin_stock";
        }

        if (stock < stockMinimo) {
            return "stock_bajo";
        }

        return "stock_normal";
    };

    const categoriasFiltradas = categorias
        .map((categoriaActual) => {
            const texto = normalizarTexto(terminoBusqueda);

            const nombreCategoria = normalizarTexto(
                categoriaActual.nombre || ""
            );

            const descripcionCategoria = normalizarTexto(
                categoriaActual.descripcion || ""
            );

            const coincideCategoria =
                texto === "" ||
                nombreCategoria.includes(texto) ||
                descripcionCategoria.includes(texto);

            const coincideFiltroCategoria =
                categoria === "" ||
                String(categoriaActual.id) === String(categoria);

            const suministrosFiltrados = (
                categoriaActual.suministros || []
            ).filter((suministro) => {
                const nombreSuministro = normalizarTexto(
                    suministro.nombre || ""
                );

                const detallesSuministro = normalizarTexto(
                    suministro.detalles || ""
                );

                const coincideBusqueda =
                    texto === "" ||
                    nombreSuministro.includes(texto) ||
                    detallesSuministro.includes(texto);

                const coincideUnidad =
                    unidad === "" ||
                    suministro.unidad === unidad;

                const coincideEstadoStock =
                    estadoStock === "" ||
                    comprobarEstadoStock(suministro) === estadoStock;

                return (
                    coincideBusqueda &&
                    coincideUnidad &&
                    coincideEstadoStock
                );
            });

            const hayFiltrosDeSuministro =
                unidad !== "" || estadoStock !== "";

            if (
                coincideCategoria &&
                coincideFiltroCategoria &&
                !hayFiltrosDeSuministro
            ) {
                return {
                    ...categoriaActual,
                    suministros: categoriaActual.suministros || [],
                };
            }

            if (
                coincideFiltroCategoria &&
                suministrosFiltrados.length > 0
            ) {
                return {
                    ...categoriaActual,
                    suministros: suministrosFiltrados,
                };
            }

            return null;
        })
        .filter(Boolean);

    const categoriasOrdenadas = [...categoriasFiltradas].sort((a, b) => {
        const nombreA = normalizarTexto(a.nombre || "");
        const nombreB = normalizarTexto(b.nombre || "");

        const suministrosA = obtenerNumeroSuministrosCategoria(a.id);
        const suministrosB = obtenerNumeroSuministrosCategoria(b.id);

        const stockA = obtenerStockTotalCategoria(a.id);
        const stockB = obtenerStockTotalCategoria(b.id);

        if (orden === "nombre_asc") {
            return nombreA.localeCompare(nombreB);
        }

        if (orden === "nombre_desc") {
            return nombreB.localeCompare(nombreA);
        }

        if (orden === "suministros_asc") {
            return suministrosA - suministrosB;
        }

        if (orden === "suministros_desc") {
            return suministrosB - suministrosA;
        }

        if (orden === "stock_asc") {
            return stockA - stockB;
        }

        if (orden === "stock_desc") {
            return stockB - stockA;
        }

        return 0;
    });

    useEffect(() => {
        const estadoStockInicial = location.state?.estadoStock;

        if (!estadoStockInicial) {
            return;
        }

        setEstadoStock(estadoStockInicial);
        setPaginaCategorias(1);
        setMostrarFiltros(true);
    }, [location.state]);

    useEffect(() => {
        setPaginaCategorias(1);
    }, [
        terminoBusqueda,
        categoria,
        unidad,
        estadoStock,
        orden,
    ]);

    const obtenerCategorias = async () => {
        try {
            const token = localStorage.getItem("access");

            const respuesta = await axios.get(
                "/api/suministros/categorias/",
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

    useEffect(() => {
        obtenerCategorias();
    }, []);

    const alternarCategoria = (categoriaId) => {
        setCategoriasAbiertas((estadoAnterior) => ({
            ...estadoAnterior,
            [categoriaId]: !estadoAnterior[categoriaId],
        }));
    };

    const restablecerFiltros = () => {
        setCategoria("");
        setUnidad("");
        setEstadoStock("");
        setPaginaCategorias(1);
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

    const abrirEliminarCategoria = (categoria) => {
        setCategoriaEliminando(categoria);
        setErrorEliminarCategoria(null);
        setMostrarEliminarCategoria(true);
    };

    const cerrarEliminarCategoria = () => {
        if (eliminandoCategoria) {
            return;
        }

        setMostrarEliminarCategoria(false);
        setCategoriaEliminando(null);
        setErrorEliminarCategoria(null);
    };

    const eliminarCategoria = async () => {
        try {
            setEliminandoCategoria(true);
            setErrorEliminarCategoria(null);

            const token = localStorage.getItem("access");

            await axios.delete(
                `/api/suministros/categorias/${categoriaEliminando.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await obtenerCategorias();

            setMostrarEliminarCategoria(false);
            setCategoriaEliminando(null);
            setErrorEliminarCategoria(null);
        } catch (error) {
            console.error(
                "Error al eliminar la categoría:",
                error
            );

            if (error.response?.data?.error) {
                setErrorEliminarCategoria(
                    error.response.data.error
                );
            } else {
                setErrorEliminarCategoria(
                    "No se ha podido eliminar la categoría."
                );
            }
        } finally {
            setEliminandoCategoria(false);
        }
    };

    const abrirEditarSuministro = (suministro, categoria) => {
        setSuministroEditando(suministro);

        setCategoriaEditar(
            categoria.id === "sin-asignar"
                ? ""
                : categoria.id
        );

        setStockMinimoEditar(
            suministro.stock_minimo ?? ""
        );

        setDetallesEditar(
            suministro.detalles || ""
        );

        setErrorEditarSuministro(null);
        setMostrarEditarSuministro(true);
    };

    const cerrarEditarSuministro = () => {
        if (editandoSuministro) {
            return;
        }

        setMostrarEditarSuministro(false);
        setSuministroEditando(null);

        setCategoriaEditar("");
        setStockMinimoEditar("");
        setDetallesEditar("");
        setErrorEditarSuministro(null);
    };

    const editarSuministro = async (evento) => {
        evento.preventDefault();

        setErrorEditarSuministro(null);

        const stockMinimo = Number(stockMinimoEditar);

        if (
            !Number.isInteger(stockMinimo) ||
            stockMinimo < 0
        ) {
            setErrorEditarSuministro(
                "El stock mínimo debe ser un número entero igual o superior a 0."
            );
            return;
        }

        if (
            detallesEditar &&
            !detallesEditar.trim()
        ) {
            setErrorEditarSuministro(
                "Los detalles no pueden estar formados únicamente por espacios."
            );
            return;
        }

        try {
            setEditandoSuministro(true);

            const token = localStorage.getItem("access");

            await axios.patch(
                `/api/suministros/${suministroEditando.id}/editar/`,
                {
                    categoria: categoriaEditar
                        ? Number(categoriaEditar)
                        : null,
                    stock_minimo: stockMinimo,
                    detalles: detallesEditar.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await obtenerCategorias();

            setMostrarEditarSuministro(false);
            setSuministroEditando(null);

            setCategoriaEditar("");
            setStockMinimoEditar("");
            setDetallesEditar("");
            setErrorEditarSuministro(null);
        } catch (error) {
            console.error(
                "Error al editar el suministro:",
                error
            );

            if (error.response?.data) {
                const errores = error.response.data;

                if (errores.stock_minimo) {
                    setErrorEditarSuministro(
                        Array.isArray(errores.stock_minimo)
                            ? errores.stock_minimo[0]
                            : errores.stock_minimo
                    );
                } else if (errores.detalles) {
                    setErrorEditarSuministro(
                        Array.isArray(errores.detalles)
                            ? errores.detalles[0]
                            : errores.detalles
                    );
                } else if (errores.categoria) {
                    setErrorEditarSuministro(
                        Array.isArray(errores.categoria)
                            ? errores.categoria[0]
                            : errores.categoria
                    );
                } else if (errores.error) {
                    setErrorEditarSuministro(
                        errores.error
                    );
                } else {
                    setErrorEditarSuministro(
                        "No se ha podido editar el suministro."
                    );
                }
            } else {
                setErrorEditarSuministro(
                    "No se ha podido editar el suministro."
                );
            }
        } finally {
            setEditandoSuministro(false);
        }
    };

    const crearCategoria = async (evento) => {
        evento.preventDefault();

        if (!nombreCategoria.trim()) {
            setErrorCrearCategoria(
                "El nombre de la categoría es obligatorio."
            );
            return;
        } else if (nombreCategoria.trim().length > 100) {
            setErrorCrearCategoria(
                "El nombre de la categoría no puede superar los 100 caracteres."
            );
            return;
        }

        try {
            setCreandoCategoria(true);
            setErrorCrearCategoria(null);

            const token = localStorage.getItem("access");

            const respuesta = await axios.post(
                "/api/suministros/crearcategoria/",
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

    const categoriasPorPagina = 9;

    const indiceUltimaCategoria =
        paginaCategorias * categoriasPorPagina;

    const indicePrimeraCategoria =
        indiceUltimaCategoria - categoriasPorPagina;

    const categoriasActuales = categoriasOrdenadas.slice(
        indicePrimeraCategoria,
        indiceUltimaCategoria
    );

    const totalPaginasCategorias = Math.ceil(
        categoriasOrdenadas.length / categoriasPorPagina
    );

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

            {categorias.length > 0 && (
                <div className="suministros-controles">
                    <div className="suministros-controles-principales">
                        <div className="suministros-buscador">
                            <div className="suministros-buscador-input">
                                <FaSearch className="suministros-buscador-icono" />

                                <input
                                    type="text"
                                    placeholder="Buscar por categoría o suministro..."
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
                            className="suministros-boton-filtros"
                            onClick={() =>
                                setMostrarFiltros(
                                    (estadoAnterior) =>
                                        !estadoAnterior
                                )
                            }
                        >
                            <FaFilter />
                            {mostrarFiltros
                                ? "Ocultar filtros"
                                : "Mostrar filtros"}
                        </button>

                        <div className="suministros-ordenacion">
                            <label htmlFor="orden-suministros">
                                Ordenar por:
                            </label>

                            <select
                                id="orden-suministros"
                                value={orden}
                                onChange={(evento) =>
                                    setOrden(evento.target.value)
                                }
                            >
                                <option value="nombre_asc">
                                    Nombre A-Z
                                </option>

                                <option value="nombre_desc">
                                    Nombre Z-A
                                </option>

                                <option value="suministros_asc">
                                    Número de suministros: menor a mayor
                                </option>

                                <option value="suministros_desc">
                                    Número de suministros: mayor a menor
                                </option>

                                <option value="stock_asc">
                                    Stock total: menor a mayor
                                </option>

                                <option value="stock_desc">
                                    Stock total: mayor a menor
                                </option>
                            </select>
                        </div>
                    </div>

                    {mostrarFiltros && (
                        <div className="suministros-panel-filtros">
                            <div className="suministros-filtro">
                                <label htmlFor="filtro-categoria">
                                    Categoría
                                </label>

                                <select
                                    id="filtro-categoria"
                                    value={categoria}
                                    onChange={(evento) =>
                                        setCategoria(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todas
                                    </option>

                                    {categoriasDisponibles.map(
                                        (categoriaDisponible) => (
                                            <option
                                                key={categoriaDisponible.id}
                                                value={
                                                    categoriaDisponible.id
                                                }
                                            >
                                                {
                                                    categoriaDisponible.nombre
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="suministros-filtro">
                                <label htmlFor="filtro-unidad">
                                    Unidad
                                </label>

                                <select
                                    id="filtro-unidad"
                                    value={unidad}
                                    onChange={(evento) =>
                                        setUnidad(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todas
                                    </option>

                                    {unidadesDisponibles.map(
                                        (unidadDisponible) => (
                                            <option
                                                key={unidadDisponible}
                                                value={unidadDisponible}
                                            >
                                                {unidadDisponible}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="suministros-filtro">
                                <label htmlFor="filtro-estado-stock">
                                    Estado del stock
                                </label>

                                <select
                                    id="filtro-estado-stock"
                                    value={estadoStock}
                                    onChange={(evento) =>
                                        setEstadoStock(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    <option value="stock_normal">
                                        Stock normal
                                    </option>

                                    <option value="stock_bajo">
                                        Stock bajo
                                    </option>

                                    <option value="sin_stock">
                                        Sin stock
                                    </option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="suministros-restablecer-filtros"
                                onClick={restablecerFiltros}
                            >
                                Restablecer filtros
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="suministros-listado">
                {categoriasFiltradas.length === 0 ? (
                    <div className="suministros-vacio">
                        <p>
                            No se han encontrado categorías o suministros que coincidan con la búsqueda.
                        </p>
                    </div>
                ) : (
                    categoriasActuales.map((categoriaActual) => {
                        const abierta =
                            categoriasAbiertas[categoriaActual.id] || false;

                        return (
                            <div
                                className="suministro-categoria-card"
                                key={categoriaActual.id}
                            >
                                <div className="suministro-categoria-cabecera">
                                    <button
                                        className="suministro-categoria-boton"
                                        onClick={() =>
                                            alternarCategoria(
                                                categoriaActual.id
                                            )
                                        }
                                    >
                                        <span>
                                            {categoriaActual.nombre}
                                        </span>

                                        <span>
                                            {abierta ? "▼" : "▶"}
                                        </span>
                                    </button>

                                    {categoriaActual.id !== "sin-asignar" && (
                                        <div className="suministro-categoria-acciones">
                                            <button
                                                className="suministro-categoria-eliminar"
                                                onClick={() =>
                                                    abrirEliminarCategoria(
                                                        categoriaActual
                                                    )
                                                }
                                                disabled={
                                                    eliminandoCategoria
                                                }
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {abierta && (
                                    <div className="suministros-categoria-listado">
                                        <p className="suministro-categoria-descripcion">
                                            {categoriaActual.descripcion ||
                                                "Sin descripción"}
                                        </p>

                                        {categoriaActual.suministros.length > 0 ? (
                                            categoriaActual.suministros.map(
                                                (suministro) => {
                                                    const estadoStockSuministro =
                                                        comprobarEstadoStock(
                                                            suministro
                                                        );

                                                    return (
                                                        <div
                                                            className="suministro-item"
                                                            key={suministro.id}
                                                        >
                                                            <div
                                                                className="suministro-item-informacion"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/suministros/${suministro.id}`
                                                                    )
                                                                }
                                                            >
                                                                <span className="suministro-nombre">
                                                                    {suministro.nombre}
                                                                </span>

                                                                <span
                                                                    className={`suministro-stock ${
                                                                        estadoStockSuministro ===
                                                                        "sin_stock"
                                                                            ? "suministro-stock-sin-stock"
                                                                            : estadoStockSuministro ===
                                                                              "stock_bajo"
                                                                            ? "suministro-stock-bajo"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {(estadoStockSuministro ===
                                                                        "sin_stock" ||
                                                                        estadoStockSuministro ===
                                                                            "stock_bajo") && (
                                                                        <FaExclamationTriangle
                                                                            className="suministro-stock-alerta"
                                                                            title={
                                                                                estadoStockSuministro ===
                                                                                "sin_stock"
                                                                                    ? "Sin stock"
                                                                                    : "Stock bajo"
                                                                            }
                                                                        />
                                                                    )}

                                                                    {suministro.stock}{" "}
                                                                    {suministro.unidad}
                                                                </span>
                                                            </div>

                                                            <div className="suministro-acciones">
                                                                <button
                                                                    className="suministro-editar"
                                                                    onClick={(evento) => {
                                                                        evento.stopPropagation();
                                                                        abrirEditarSuministro(
                                                                            suministro,
                                                                            categoriaActual
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        editandoSuministro
                                                                    }
                                                                >
                                                                    <FaPencilAlt />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
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
                    })
                )}
            </div>

            {totalPaginasCategorias > 1 && (
                <div className="suministros-paginacion">
                    <button
                        type="button"
                        disabled={paginaCategorias === 1}
                        onClick={() =>
                            setPaginaCategorias(
                                (paginaActual) => paginaActual - 1
                            )
                        }
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaCategorias} de{" "}
                        {totalPaginasCategorias}
                    </span>

                    <button
                        type="button"
                        disabled={
                            paginaCategorias === totalPaginasCategorias
                        }
                        onClick={() =>
                            setPaginaCategorias(
                                (paginaActual) => paginaActual + 1
                            )
                        }
                    >
                        Siguiente
                    </button>
                </div>
            )}

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
                                    maxLength={35}
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
                                    maxLength={150}
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

            {mostrarEliminarCategoria && categoriaEliminando && (
                <div className="eliminar-categoria-overlay">
                    <div className="eliminar-categoria-confirmacion">
                        <h2>
                            Eliminar categoría
                        </h2>

                        <p>
                            ¿Seguro que quieres eliminar la categoría{" "}
                            <strong>
                                "{categoriaEliminando.nombre}"
                            </strong>
                            ?
                        </p>

                        <p>
                            Los suministros de esta categoría pasarán a
                            "Sin asignar".
                        </p>

                        {errorEliminarCategoria && (
                            <p className="eliminar-categoria-error">
                                {errorEliminarCategoria}
                            </p>
                        )}

                        <div className="eliminar-categoria-botones">
                            <button
                                type="button"
                                onClick={eliminarCategoria}
                                disabled={eliminandoCategoria}
                            >
                                {eliminandoCategoria
                                    ? "Eliminando..."
                                    : "Eliminar"}
                            </button>

                            <button
                                type="button"
                                onClick={cerrarEliminarCategoria}
                                disabled={eliminandoCategoria}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarEditarSuministro && suministroEditando && (
                <div className="editar-suministro-overlay">
                    <div className="editar-suministro-confirmacion">
                        <h2>Editar suministro</h2>

                        <form onSubmit={editarSuministro}>
                            <div className="editar-suministro-campo">
                                <label htmlFor="categoria-suministro">
                                    Categoría
                                </label>

                                <select
                                    id="categoria-suministro"
                                    value={categoriaEditar}
                                    onChange={(evento) =>
                                        setCategoriaEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoSuministro}
                                >
                                    <option value="">
                                        Sin categoría
                                    </option>

                                    {categorias
                                        .filter(
                                            (categoriaActual) =>
                                                categoriaActual.id !==
                                                "sin-asignar"
                                        )
                                        .map((categoriaActual) => (
                                            <option
                                                key={categoriaActual.id}
                                                value={
                                                    categoriaActual.id
                                                }
                                            >
                                                {categoriaActual.nombre}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="editar-suministro-campo">
                                <label htmlFor="stock-minimo-suministro">
                                    Stock mínimo
                                </label>

                                <input
                                    id="stock-minimo-suministro"
                                    type="number"
                                    min="0"
                                    value={stockMinimoEditar}
                                    onChange={(evento) =>
                                        setStockMinimoEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoSuministro}
                                />
                            </div>

                            <div className="editar-suministro-campo">
                                <label htmlFor="detalles-suministro">
                                    Detalles
                                </label>

                                <textarea
                                    id="detalles-suministro"
                                    value={detallesEditar}
                                    onChange={(evento) =>
                                        setDetallesEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoSuministro}
                                />
                            </div>

                            {errorEditarSuministro && (
                                <p className="editar-suministro-error">
                                    {errorEditarSuministro}
                                </p>
                            )}

                            <div className="editar-suministro-botones">
                                <button
                                    type="submit"
                                    disabled={editandoSuministro}
                                >
                                    {editandoSuministro
                                        ? "Guardando..."
                                        : "Editar suministro"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarEditarSuministro}
                                    disabled={editandoSuministro}
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