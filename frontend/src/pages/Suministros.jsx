import { useEffect, useState } from "react";
import axios from "axios";

import "./Suministros.css";

const Suministros = () => {
    const [categorias, setCategorias] = useState([]);
    const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
    const [error, setError] = useState(null);

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

    return (
        <div className="suministros-container">
            <div className="suministros-titulo">
                <div>
                    <h1>Suministros</h1>

                    <p>
                        Gestión de los suministros del centro
                    </p>
                </div>
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
        </div>
    );
};

export default Suministros;