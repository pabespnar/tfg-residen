import { useEffect, useState } from 'react'
import axios from 'axios'
import './Proveedores.css'
import { FaPencilAlt } from "react-icons/fa";

function Proveedores() {

    const [proveedores, setProveedores] = useState([])
    const [proveedoresAbiertos, setProveedoresAbiertos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [mostrarEditarProveedor, setMostrarEditarProveedor] = useState(false);
    const [proveedorEditando, setProveedorEditando] = useState(null);

    const [nombreEditar, setNombreEditar] = useState("");
    const [cifEditar, setCifEditar] = useState("");
    const [correoEditar, setCorreoEditar] = useState("");

    const [errorEditarProveedor, setErrorEditarProveedor] = useState(null);
    const [editandoProveedor, setEditandoProveedor] = useState(false);

    useEffect(() => {
        obtenerProveedores()
    }, [])

    const obtenerProveedores = async () => {

        try {

            const token = localStorage.getItem('access')

            const respuesta = await axios.get(
                'http://127.0.0.1:8000/api/expedientes/proveedores/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setProveedores(respuesta.data)

        } catch (error) {

            console.error(error)
            setError('No se han podido cargar los proveedores.')

        } finally {

            setCargando(false)
        }
    }

    const alternarProveedor = (proveedorId) => {

        setProveedoresAbiertos((estadoAnterior) => ({
            ...estadoAnterior,
            [proveedorId]: !estadoAnterior[proveedorId],
        }))
    }

    const abrirEditarProveedor = (proveedor) => {

        setProveedorEditando(proveedor);

        setNombreEditar(proveedor.nombre || "");
        setCifEditar(proveedor.cif || "");
        setCorreoEditar(proveedor.correo || "");

        setErrorEditarProveedor(null);
        setMostrarEditarProveedor(true);
    };

    const cerrarEditarProveedor = () => {

        if (editandoProveedor) {
            return;
        }

        setMostrarEditarProveedor(false);
        setProveedorEditando(null);

        setNombreEditar("");
        setCifEditar("");
        setCorreoEditar("");
        setErrorEditarProveedor(null);
    };

    const editarProveedor = async (evento) => {

        evento.preventDefault();

        setErrorEditarProveedor(null);

        if (!nombreEditar.trim()) {
            setErrorEditarProveedor(
                "El nombre del proveedor es obligatorio."
            );
            return;
        }

        if (!cifEditar.trim()) {
            setErrorEditarProveedor(
                "El CIF del proveedor es obligatorio."
            );
            return;
        }

        if (!correoEditar.trim()) {
            setErrorEditarProveedor(
                "El correo del proveedor es obligatorio."
            );
            return;
        }

        try {

            setEditandoProveedor(true);

            const token = localStorage.getItem("access");

            const datos = {
                nombre: nombreEditar.trim(),
                cif: cifEditar.trim(),
                correo: correoEditar.trim(),
            };

            await axios.patch(
                `http://127.0.0.1:8000/api/expedientes/proveedores/${proveedorEditando.id}/editar/`,
                datos,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await obtenerProveedores();

            setMostrarEditarProveedor(false);
            setProveedorEditando(null);

            setNombreEditar("");
            setCifEditar("");
            setCorreoEditar("");
            setErrorEditarProveedor(null);

        } catch (error) {

            console.error(
                "Error al editar el proveedor:",
                error
            );

            if (error.response?.data) {

                const errores = error.response.data;

                if (errores.nombre) {
                    setErrorEditarProveedor(
                        Array.isArray(errores.nombre)
                            ? errores.nombre[0]
                            : errores.nombre
                    );
                } else if (errores.cif) {
                    setErrorEditarProveedor(
                        Array.isArray(errores.cif)
                            ? errores.cif[0]
                            : errores.cif
                    );
                } else if (errores.correo) {
                    setErrorEditarProveedor(
                        Array.isArray(errores.correo)
                            ? errores.correo[0]
                            : errores.correo
                    );
                } else if (errores.error) {
                    setErrorEditarProveedor(
                        errores.error
                    );
                } else {
                    setErrorEditarProveedor(
                        "No se ha podido editar el proveedor."
                    );
                }

            } else {

                setErrorEditarProveedor(
                    "No se ha podido editar el proveedor."
                );
            }

        } finally {

            setEditandoProveedor(false);
        }
    };

    return (
        <div className="proveedores-container">

            <div className="proveedores-titulo">

                <div>

                    <h1>Proveedores</h1>

                    <p>
                        Consulta los proveedores y los expedientes asociados.
                    </p>

                </div>

            </div>

            {cargando && (
                <p className="proveedores-mensaje">
                    Cargando proveedores...
                </p>
            )}

            {error && (
                <p className="proveedores-error">
                    {error}
                </p>
            )}

            {!cargando && !error && (
                <div className="proveedores-lista">

                    {proveedores.map((proveedor) => {

                        const abierto =
                            proveedoresAbiertos[proveedor.id] || false

                        return (
                            <div
                                key={proveedor.id}
                                className={`proveedor-card ${
                                    abierto
                                        ? 'proveedor-card-abierto'
                                        : ''
                                }`}
                            >

                                <div className="proveedor-cabecera">

                                    <button
                                        type="button"
                                        className="proveedor-cabecera-boton"
                                        onClick={() =>
                                            alternarProveedor(proveedor.id)
                                        }
                                    >

                                        <div className="proveedor-foto">
                                            {proveedor.foto ? (
                                                <img
                                                    src={proveedor.foto}
                                                    alt={proveedor.nombre}
                                                />
                                            ) : (
                                                <span>
                                                    {proveedor.nombre?.charAt(0)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="proveedor-informacion">

                                            <h2>
                                                {proveedor.nombre}
                                            </h2>

                                            <p>
                                                {proveedor.cif}
                                            </p>

                                            <p>
                                                {proveedor.correo}
                                            </p>

                                        </div>

                                        <span className="proveedor-flecha">
                                            {abierto
                                                ? '⌄'
                                                : '›'}
                                        </span>

                                    </button>

                                    <div className="proveedor-acciones">

                                        <button
                                            type="button"
                                            className="proveedor-editar"
                                            onClick={(evento) => {
                                                evento.stopPropagation();
                                                abrirEditarProveedor(proveedor);
                                            }}
                                            disabled={editandoProveedor}
                                        >
                                            <FaPencilAlt />
                                        </button>

                                    </div>

                                </div>

                                {abierto && (

                                    <div className="proveedor-expedientes">

                                        <h3>
                                            Expedientes
                                        </h3>

                                        {proveedor.expedientes.length === 0 ? (

                                            <p className="proveedor-sin-expedientes">
                                                Este proveedor no tiene expedientes.
                                            </p>

                                        ) : (

                                            <div className="expedientes-lista">

                                                {proveedor.expedientes.map(
                                                    (expediente) => (

                                                        <div
                                                            key={expediente.id}
                                                            className="expediente-card"
                                                        >

                                                            <div>
                                                                <h4>
                                                                    {expediente.nombre}
                                                                </h4>

                                                                <p>
                                                                    {expediente.fecha_inicio}
                                                                    {' - '}
                                                                    {expediente.fecha_final}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={
                                                                    expediente.activo
                                                                        ? 'ver-expediente-estado activo'
                                                                        : 'ver-expediente-estado finalizado'
                                                                }
                                                            >
                                                                {expediente.activo
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        )
                    })}

                </div>
            )}

            {mostrarEditarProveedor && proveedorEditando && (

                <div className="editar-proveedor-overlay">

                    <div className="editar-proveedor-confirmacion">

                        <h2>
                            Editar proveedor
                        </h2>

                        <form onSubmit={editarProveedor}>

                            <div className="editar-proveedor-campo">

                                <label htmlFor="nombre-proveedor">
                                    Nombre
                                </label>

                                <input
                                    id="nombre-proveedor"
                                    type="text"
                                    value={nombreEditar}
                                    onChange={(evento) =>
                                        setNombreEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoProveedor}
                                    autoFocus
                                />

                            </div>

                            <div className="editar-proveedor-campo">

                                <label htmlFor="cif-proveedor">
                                    CIF
                                </label>

                                <input
                                    id="cif-proveedor"
                                    type="text"
                                    value={cifEditar}
                                    onChange={(evento) =>
                                        setCifEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoProveedor}
                                />

                            </div>

                            <div className="editar-proveedor-campo">

                                <label htmlFor="correo-proveedor">
                                    Correo
                                </label>

                                <input
                                    id="correo-proveedor"
                                    type="email"
                                    value={correoEditar}
                                    onChange={(evento) =>
                                        setCorreoEditar(
                                            evento.target.value
                                        )
                                    }
                                    disabled={editandoProveedor}
                                />

                            </div>

                            {errorEditarProveedor && (

                                <p className="editar-proveedor-error">
                                    {errorEditarProveedor}
                                </p>

                            )}

                            <div className="editar-proveedor-botones">

                                <button
                                    type="submit"
                                    disabled={editandoProveedor}
                                >
                                    {editandoProveedor
                                        ? "Guardando..."
                                        : "Editar proveedor"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarEditarProveedor}
                                    disabled={editandoProveedor}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Proveedores