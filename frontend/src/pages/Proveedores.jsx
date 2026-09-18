import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Proveedores.css'
import { FaPencilAlt, FaTrash, FaSearch, FaFilter } from "react-icons/fa";

function Proveedores() {

    const navigate = useNavigate()

    const [proveedores, setProveedores] = useState([])
    const [proveedoresAbiertos, setProveedoresAbiertos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    const [paginaProveedores, setPaginaProveedores] = useState(1)
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    const [orden, setOrden] = useState('nombre_asc')

    const [tieneExpediente, setTieneExpediente] = useState('')
    const [tieneExpedienteActivo, setTieneExpedienteActivo] = useState('')
    const [tienePedidos, setTienePedidos] = useState('')
    const [categoriaSuministro, setCategoriaSuministro] = useState('')
    const [suministroPedido, setSuministroPedido] = useState('')
    const [mostrarFiltros, setMostrarFiltros] = useState(false)

    const normalizarTexto = (texto) =>
        texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

    const categoriasSuministros = proveedores
        .flatMap((proveedor) =>
            Array.isArray(proveedor.suministros_pedidos)
                ? proveedor.suministros_pedidos
                : []
        )
        .reduce((acumulado, suministro) => {

            const categoriaId =
                suministro.categoria_id === null
                    ? 'sin-asignar'
                    : suministro.categoria_id

            const categoriaNombre =
                suministro.categoria_id === null
                    ? 'Sin asignar'
                    : suministro.categoria_nombre

            if (
                !acumulado.some(
                    (categoria) =>
                        categoria.id === categoriaId
                )
            ) {
                acumulado.push({
                    id: categoriaId,
                    nombre: categoriaNombre
                })
            }

            return acumulado
        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        )

    const suministrosFiltrables = proveedores
        .flatMap((proveedor) =>
            Array.isArray(proveedor.suministros_pedidos)
                ? proveedor.suministros_pedidos
                : []
        )
        .filter((suministro) => {

            if (categoriaSuministro === '') {
                return true
            }

            if (categoriaSuministro === 'sin-asignar') {
                return suministro.categoria_id === null
            }

            return (
                suministro.categoria_id ===
                Number(categoriaSuministro)
            )
        })
        .reduce((acumulado, suministro) => {

            if (
                !acumulado.some(
                    (item) => item.id === suministro.id
                )
            ) {
                acumulado.push({
                    id: suministro.id,
                    nombre: suministro.nombre
                })
            }

            return acumulado
        }, [])
        .sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        )

    const proveedoresFiltrados = proveedores.filter((proveedor) => {

        const texto = normalizarTexto(terminoBusqueda)

        const nombreProveedor = normalizarTexto(
            proveedor.nombre || ''
        )

        const cifProveedor = normalizarTexto(
            proveedor.cif || ''
        )

        const correoProveedor = normalizarTexto(
            proveedor.correo || ''
        )

        const expedientes = Array.isArray(proveedor.expedientes)
            ? proveedor.expedientes
            : []

        const suministrosProveedor =
            Array.isArray(proveedor.suministros_pedidos)
                ? proveedor.suministros_pedidos
                : []

        const tieneExpedientes =
            expedientes.length > 0

        const tieneActivo =
            expedientes.some(
                (expediente) => expediente.activo
            )

        const tienePedidosProveedor =
            suministrosProveedor.length > 0

        const coincideBusqueda =
            texto === '' ||
            nombreProveedor.includes(texto) ||
            cifProveedor.includes(texto) ||
            correoProveedor.includes(texto)

        const coincideExpediente =
            tieneExpediente === '' ||
            (tieneExpediente === 'si' && tieneExpedientes) ||
            (tieneExpediente === 'no' && !tieneExpedientes)

        const coincideExpedienteActivo =
            tieneExpedienteActivo === '' ||
            (tieneExpedienteActivo === 'si' && tieneActivo) ||
            (tieneExpedienteActivo === 'no' && !tieneActivo)

        const coincidePedidos =
            tienePedidos === '' ||
            (tienePedidos === 'si' && tienePedidosProveedor) ||
            (tienePedidos === 'no' && !tienePedidosProveedor)

        const coincideCategoria =
            categoriaSuministro === '' ||
            suministrosProveedor.some((suministro) => {

                if (categoriaSuministro === 'sin-asignar') {
                    return suministro.categoria_id === null
                }

                return (
                    suministro.categoria_id ===
                    Number(categoriaSuministro)
                )
            })

        const coincideSuministro =
            suministroPedido === '' ||
            suministrosProveedor.some(
                (suministro) =>
                    suministro.id ===
                    Number(suministroPedido)
            )

        return (
            coincideBusqueda &&
            coincideExpediente &&
            coincideExpedienteActivo &&
            coincidePedidos &&
            coincideCategoria &&
            coincideSuministro
        )
    })

    const proveedoresOrdenados = [...proveedoresFiltrados].sort((a, b) => {

        const nombreA = normalizarTexto(
            a.nombre || ''
        )

        const nombreB = normalizarTexto(
            b.nombre || ''
        )

        const cifA = normalizarTexto(
            a.cif || ''
        )

        const cifB = normalizarTexto(
            b.cif || ''
        )

        const correoA = normalizarTexto(
            a.correo || ''
        )

        const correoB = normalizarTexto(
            b.correo || ''
        )

        const expedientesA = Array.isArray(a.expedientes)
            ? a.expedientes.length
            : 0

        const expedientesB = Array.isArray(b.expedientes)
            ? b.expedientes.length
            : 0

        if (orden === 'nombre_asc') {
            return nombreA.localeCompare(nombreB)
        }

        if (orden === 'nombre_desc') {
            return nombreB.localeCompare(nombreA)
        }

        if (orden === 'cif_asc') {
            return cifA.localeCompare(cifB)
        }

        if (orden === 'cif_desc') {
            return cifB.localeCompare(cifA)
        }

        if (orden === 'correo_asc') {
            return correoA.localeCompare(correoB)
        }

        if (orden === 'correo_desc') {
            return correoB.localeCompare(correoA)
        }

        if (orden === 'expedientes_asc') {
            return expedientesA - expedientesB
        }

        if (orden === 'expedientes_desc') {
            return expedientesB - expedientesA
        }

        return 0
    })

    useEffect(() => {
        setPaginaProveedores(1)
    }, [
        terminoBusqueda,
        orden,
        tieneExpediente,
        tieneExpedienteActivo,
        tienePedidos,
        categoriaSuministro,
        suministroPedido
    ])

    const restablecerFiltros = () => {
        setTieneExpediente('')
        setTieneExpedienteActivo('')
        setTienePedidos('')
        setCategoriaSuministro('')
        setSuministroPedido('')
    }

    const proveedoresPorPagina = 4
    const indiceUltimoProveedor = paginaProveedores * proveedoresPorPagina
    const indicePrimerProveedor = indiceUltimoProveedor - proveedoresPorPagina

    const proveedoresActuales = proveedoresOrdenados.slice(
        indicePrimerProveedor,
        indiceUltimoProveedor
    )

    const totalPaginasProveedores = Math.ceil(
        proveedoresOrdenados.length / proveedoresPorPagina
    )

    const [mostrarEditarProveedor, setMostrarEditarProveedor] = useState(false);
    const [proveedorEditando, setProveedorEditando] = useState(null);

    const [nombreEditar, setNombreEditar] = useState("");
    const [cifEditar, setCifEditar] = useState("");
    const [correoEditar, setCorreoEditar] = useState("");
    const [fotoEditar, setFotoEditar] = useState(null);

    const [errorEditarProveedor, setErrorEditarProveedor] = useState(null);
    const [editandoProveedor, setEditandoProveedor] = useState(false);

    const [mostrarEliminarProveedor, setMostrarEliminarProveedor] = useState(false);
    const [proveedorEliminando, setProveedorEliminando] = useState(null);

    const [errorEliminarProveedor, setErrorEliminarProveedor] = useState(null);
    const [eliminandoProveedor, setEliminandoProveedor] = useState(false);

    const [mostrarCrearProveedor, setMostrarCrearProveedor] = useState(false);

    const [nombreCrear, setNombreCrear] = useState("");
    const [cifCrear, setCifCrear] = useState("");
    const [correoCrear, setCorreoCrear] = useState("");
    const [fotoCrear, setFotoCrear] = useState(null);

    const [errorCrearProveedor, setErrorCrearProveedor] = useState(null);
    const [creandoProveedor, setCreandoProveedor] = useState(false);

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
        setFotoEditar(null);

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
        setFotoEditar(null);
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

            const datos = new FormData();

            datos.append("nombre", nombreEditar.trim());
            datos.append("cif", cifEditar.trim());
            datos.append("correo", correoEditar.trim());

            if (fotoEditar instanceof File) {
                datos.append("foto", fotoEditar);
            }

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
            setFotoEditar(null);
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
                } else if (errores.foto) {
                    setErrorEditarProveedor(
                        Array.isArray(errores.foto)
                            ? errores.foto[0]
                            : errores.foto
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

    const abrirEliminarProveedor = (proveedor) => {

        setProveedorEliminando(proveedor);

        setErrorEliminarProveedor(null);
        setMostrarEliminarProveedor(true);
    };

    const cerrarEliminarProveedor = () => {

        if (eliminandoProveedor) {
            return;
        }

        setMostrarEliminarProveedor(false);
        setProveedorEliminando(null);

        setErrorEliminarProveedor(null);
    };

    const eliminarProveedor = async () => {

        setErrorEliminarProveedor(null);

        try {

            setEliminandoProveedor(true);

            const token = localStorage.getItem("access");

            await axios.delete(
                `http://127.0.0.1:8000/api/expedientes/proveedores/${proveedorEliminando.id}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await obtenerProveedores();

            setMostrarEliminarProveedor(false);
            setProveedorEliminando(null);
            setErrorEliminarProveedor(null);

        } catch (error) {

            console.error(
                "Error al eliminar el proveedor:",
                error
            );

            if (error.response?.data) {

                const errores = error.response.data;

                if (errores.error) {
                    setErrorEliminarProveedor(
                        errores.error
                    );
                } else {
                    setErrorEliminarProveedor(
                        "No se ha podido eliminar el proveedor."
                    );
                }

            } else {

                setErrorEliminarProveedor(
                    "No se ha podido eliminar el proveedor."
                );
            }

        } finally {

            setEliminandoProveedor(false);
        }
    };

    const abrirCrearProveedor = () => {

        setNombreCrear("");
        setCifCrear("");
        setCorreoCrear("");
        setFotoCrear(null);

        setErrorCrearProveedor(null);
        setMostrarCrearProveedor(true);
    };

    const cerrarCrearProveedor = () => {

        if (creandoProveedor) {
            return;
        }

        setMostrarCrearProveedor(false);

        setNombreCrear("");
        setCifCrear("");
        setCorreoCrear("");
        setFotoCrear(null);
        setErrorCrearProveedor(null);
    };

    const crearProveedor = async (evento) => {

        evento.preventDefault();

        setErrorCrearProveedor(null);

        if (!nombreCrear.trim()) {
            setErrorCrearProveedor(
                "El nombre del proveedor es obligatorio."
            );
            return;
        }

        if (!cifCrear.trim()) {
            setErrorCrearProveedor(
                "El CIF del proveedor es obligatorio."
            );
            return;
        }

        if (!correoCrear.trim()) {
            setErrorCrearProveedor(
                "El correo del proveedor es obligatorio."
            );
            return;
        }

        try {

            setCreandoProveedor(true);

            const token = localStorage.getItem("access");

            const datos = new FormData();

            datos.append("nombre", nombreCrear.trim());
            datos.append("cif", cifCrear.trim());
            datos.append("correo", correoCrear.trim());

            if (fotoCrear instanceof File) {
                datos.append("foto", fotoCrear);
            }

            await axios.post(
                'http://127.0.0.1:8000/api/expedientes/proveedores/crear/',
                datos,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await obtenerProveedores();

            setMostrarCrearProveedor(false);

            setNombreCrear("");
            setCifCrear("");
            setCorreoCrear("");
            setFotoCrear(null);
            setErrorCrearProveedor(null);

        } catch (error) {

            console.error(
                "Error al crear el proveedor:",
                error
            );

            if (error.response?.data) {

                const errores = error.response.data;

                if (errores.nombre) {
                    setErrorCrearProveedor(
                        Array.isArray(errores.nombre)
                            ? errores.nombre[0]
                            : errores.nombre
                    );
                } else if (errores.cif) {
                    setErrorCrearProveedor(
                        Array.isArray(errores.cif)
                            ? errores.cif[0]
                            : errores.cif
                    );
                } else if (errores.correo) {
                    setErrorCrearProveedor(
                        Array.isArray(errores.correo)
                            ? errores.correo[0]
                            : errores.correo
                    );
                } else if (errores.foto) {
                    setErrorCrearProveedor(
                        Array.isArray(errores.foto)
                            ? errores.foto[0]
                            : errores.foto
                    );
                } else if (errores.error) {
                    setErrorCrearProveedor(
                        errores.error
                    );
                } else {
                    setErrorCrearProveedor(
                        "No se ha podido crear el proveedor."
                    );
                }

            } else {

                setErrorCrearProveedor(
                    "No se ha podido crear el proveedor."
                );
            }

        } finally {

            setCreandoProveedor(false);
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

                <button
                    type="button"
                    className="proveedores-boton-anadir"
                    onClick={abrirCrearProveedor}
                >
                    +
                </button>

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

            {!cargando && !error && proveedores.length > 0 && (

                <div className="proveedores-controles">

                    <div className="proveedores-controles-principales">

                        <div className="proveedores-buscador">

                            <div className="proveedores-buscador-input">

                                <FaSearch className="proveedores-buscador-icono" />

                                <input
                                    type="text"
                                    placeholder="Buscar por proveedor, CIF o correo..."
                                    value={terminoBusqueda}
                                    onChange={(evento) =>
                                        setTerminoBusqueda(evento.target.value)
                                    }
                                />

                            </div>

                        </div>

                        <button
                            type="button"
                            className="proveedores-boton-filtros"
                            onClick={() =>
                                setMostrarFiltros(!mostrarFiltros)
                            }
                        >
                            <FaFilter />
                            {mostrarFiltros
                                ? 'Ocultar filtros'
                                : 'Mostrar filtros'}
                        </button>

                        <div className="proveedores-ordenacion">

                            <label htmlFor="orden-proveedores">
                                Ordenar por:
                            </label>

                            <select
                                id="orden-proveedores"
                                value={orden}
                                onChange={(evento) =>
                                    setOrden(evento.target.value)
                                }
                            >
                                <option value="nombre_asc">
                                    Proveedor A-Z
                                </option>

                                <option value="nombre_desc">
                                    Proveedor Z-A
                                </option>

                                <option value="cif_asc">
                                    CIF A-Z
                                </option>

                                <option value="cif_desc">
                                    CIF Z-A
                                </option>

                                <option value="correo_asc">
                                    Correo A-Z
                                </option>

                                <option value="correo_desc">
                                    Correo Z-A
                                </option>

                                <option value="expedientes_asc">
                                    Número de expedientes: menor a mayor
                                </option>

                                <option value="expedientes_desc">
                                    Número de expedientes: mayor a menor
                                </option>
                            </select>

                        </div>

                    </div>

                    {mostrarFiltros && (

                        <div className="proveedores-panel-filtros">

                            <div className="proveedores-filtro">

                                <label htmlFor="filtro-expediente">
                                    Expedientes
                                </label>

                                <select
                                    id="filtro-expediente"
                                    value={tieneExpediente}
                                    onChange={(evento) =>
                                        setTieneExpediente(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    <option value="si">
                                        Con expedientes
                                    </option>

                                    <option value="no">
                                        Sin expedientes
                                    </option>
                                </select>

                            </div>

                            <div className="proveedores-filtro">

                                <label htmlFor="filtro-expediente-activo">
                                    Expediente activo
                                </label>

                                <select
                                    id="filtro-expediente-activo"
                                    value={tieneExpedienteActivo}
                                    onChange={(evento) =>
                                        setTieneExpedienteActivo(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    <option value="si">
                                        Con expediente activo
                                    </option>

                                    <option value="no">
                                        Sin expediente activo
                                    </option>
                                </select>

                            </div>

                            <div className="proveedores-filtro">

                                <label htmlFor="filtro-pedidos">
                                    Pedidos
                                </label>

                                <select
                                    id="filtro-pedidos"
                                    value={tienePedidos}
                                    onChange={(evento) =>
                                        setTienePedidos(
                                            evento.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    <option value="si">
                                        Con pedidos
                                    </option>

                                    <option value="no">
                                        Sin pedidos
                                    </option>
                                </select>

                            </div>

                            <div className="proveedores-filtro">

                                <label htmlFor="filtro-categoria-suministro">
                                    Categoría del suministro
                                </label>

                                <select
                                    id="filtro-categoria-suministro"
                                    value={categoriaSuministro}
                                    onChange={(evento) => {
                                        setCategoriaSuministro(
                                            evento.target.value
                                        )
                                        setSuministroPedido('')
                                    }}
                                >
                                    <option value="">
                                        Todas
                                    </option>

                                    {categoriasSuministros.map(
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

                            </div>

                            <div className="proveedores-filtro">

                                <label htmlFor="filtro-suministro-pedido">
                                    Suministro pedido
                                </label>

                                <select
                                    id="filtro-suministro-pedido"
                                    value={suministroPedido}
                                    onChange={(evento) =>
                                        setSuministroPedido(
                                            evento.target.value
                                        )
                                    }
                                    disabled={
                                        categoriaSuministro !== '' &&
                                        suministrosFiltrables.length === 0
                                    }
                                >
                                    <option value="">
                                        Todos
                                    </option>

                                    {suministrosFiltrables.map(
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

                            </div>

                            <button
                                type="button"
                                className="proveedores-restablecer-filtros"
                                onClick={restablecerFiltros}
                            >
                                Restablecer filtros
                            </button>

                        </div>

                    )}

                </div>

            )}

            {!cargando && !error && (
                <div className="proveedores-lista">

                    {proveedoresActuales.length === 0 ? (

                        <div className="proveedores-vacio">
                            No se han encontrado proveedores que coincidan con la búsqueda.
                        </div>

                    ) : (

                        proveedoresActuales.map((proveedor) => {

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
                                                        src={`http://127.0.0.1:8000${proveedor.foto}`}
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
                                                disabled={editandoProveedor || eliminandoProveedor}
                                            >
                                                <FaPencilAlt />
                                            </button>

                                            <button
                                                type="button"
                                                className="proveedor-eliminar"
                                                onClick={(evento) => {
                                                    evento.stopPropagation();
                                                    abrirEliminarProveedor(proveedor);
                                                }}
                                                disabled={editandoProveedor || eliminandoProveedor}
                                            >
                                                <FaTrash />
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
                                                                onClick={() => navigate(`/expedientes/${expediente.id}`)}
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
                        })
                    )}

                </div>
            )}

            {totalPaginasProveedores > 1 && (
                <div className="proveedores-paginacion">

                    <button
                        type="button"
                        disabled={paginaProveedores === 1}
                        onClick={() =>
                            setPaginaProveedores(
                                (paginaActual) => paginaActual - 1
                            )
                        }
                    >
                        Anterior
                    </button>

                    <span>
                        Página {paginaProveedores} de {totalPaginasProveedores}
                    </span>

                    <button
                        type="button"
                        disabled={
                            paginaProveedores === totalPaginasProveedores
                        }
                        onClick={() =>
                            setPaginaProveedores(
                                (paginaActual) => paginaActual + 1
                            )
                        }
                    >
                        Siguiente
                    </button>

                </div>
            )}

            {mostrarCrearProveedor && (

                <div className="crear-proveedor-overlay">

                    <div className="crear-proveedor-confirmacion">

                        <h2>
                            Crear proveedor
                        </h2>

                        <form onSubmit={crearProveedor}>

                            <div className="crear-proveedor-campo">

                                <label htmlFor="nombre-crear-proveedor">
                                    Nombre
                                </label>

                                <input
                                    id="nombre-crear-proveedor"
                                    type="text"
                                    value={nombreCrear}
                                    onChange={(evento) =>
                                        setNombreCrear(
                                            evento.target.value
                                        )
                                    }
                                    disabled={creandoProveedor}
                                    autoFocus
                                />

                            </div>

                            <div className="crear-proveedor-campo">

                                <label htmlFor="cif-crear-proveedor">
                                    CIF
                                </label>

                                <input
                                    id="cif-crear-proveedor"
                                    type="text"
                                    value={cifCrear}
                                    onChange={(evento) =>
                                        setCifCrear(
                                            evento.target.value
                                        )
                                    }
                                    disabled={creandoProveedor}
                                />

                            </div>

                            <div className="crear-proveedor-campo">

                                <label htmlFor="correo-crear-proveedor">
                                    Correo
                                </label>

                                <input
                                    id="correo-crear-proveedor"
                                    type="email"
                                    value={correoCrear}
                                    onChange={(evento) =>
                                        setCorreoCrear(
                                            evento.target.value
                                        )
                                    }
                                    disabled={creandoProveedor}
                                />

                            </div>

                            <div className="crear-proveedor-campo">

                                <label htmlFor="foto-crear-proveedor">
                                    Foto
                                </label>

                                <input
                                    id="foto-crear-proveedor"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(evento) =>
                                        setFotoCrear(
                                            evento.target.files[0] || null
                                        )
                                    }
                                    disabled={creandoProveedor}
                                />

                            </div>

                            {errorCrearProveedor && (

                                <p className="crear-proveedor-error">
                                    {errorCrearProveedor}
                                </p>

                            )}

                            <div className="crear-proveedor-botones">

                                <button
                                    type="submit"
                                    disabled={creandoProveedor}
                                >
                                    {creandoProveedor
                                        ? "Creando..."
                                        : "Crear proveedor"}
                                </button>

                                <button
                                    type="button"
                                    onClick={cerrarCrearProveedor}
                                    disabled={creandoProveedor}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </form>

                    </div>

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

                            <div className="editar-proveedor-campo">

                                <label htmlFor="foto-proveedor">
                                    Foto
                                </label>

                                <input
                                    id="foto-proveedor"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(evento) =>
                                        setFotoEditar(
                                            evento.target.files[0] || null
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

            {mostrarEliminarProveedor && proveedorEliminando && (

                <div className="eliminar-proveedor-overlay">

                    <div className="eliminar-proveedor-confirmacion">

                        <h2>
                            Eliminar proveedor
                        </h2>

                        <p>
                            ¿Estás seguro de que quieres eliminar el proveedor
                            <strong>
                                {' '}{proveedorEliminando.nombre}
                            </strong>?
                        </p>

                        {errorEliminarProveedor && (

                            <p className="eliminar-proveedor-error">
                                {errorEliminarProveedor}
                            </p>

                        )}

                        <div className="eliminar-proveedor-botones">

                            <button
                                type="button"
                                onClick={cerrarEliminarProveedor}
                                disabled={eliminandoProveedor}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={eliminarProveedor}
                                disabled={eliminandoProveedor}
                            >
                                {eliminandoProveedor
                                    ? "Eliminando..."
                                    : "Eliminar proveedor"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Proveedores