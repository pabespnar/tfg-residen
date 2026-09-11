import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerSuministro.css'
import { FiEdit2 } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

function VerSuministro() {

    const [suministro, setSuministro] = useState(null)
    const [error, setError] = useState('')

    const [categorias, setCategorias] = useState([])

    const [mostrarEditar, setMostrarEditar] = useState(false)
    const [categoriaEditar, setCategoriaEditar] = useState('')
    const [stockMinimoEditar, setStockMinimoEditar] = useState('')
    const [detallesEditar, setDetallesEditar] = useState('')
    const [erroresEditar, setErroresEditar] = useState({})
    const [editando, setEditando] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {

        const token = localStorage.getItem('access')

        axios.get(
            `http://127.0.0.1:8000/api/suministros/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setSuministro(response.data)
        })
        .catch((error) => {

            console.error(
                'Error al obtener los datos del suministro:',
                error
            )

            if (error.response?.status === 404) {
                setError('El suministro no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos del suministro.'
                )
            }
        })

    }, [id])

    useEffect(() => {

        const obtenerCategorias = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/suministros/categorias/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (Array.isArray(response.data)) {
                    setCategorias(response.data)
                }

            } catch (error) {

                console.error(
                    'Error al obtener las categorías:',
                    error
                )

            }
        }

        obtenerCategorias()

    }, [])

    const abrirEditar = () => {

        const categoriaActual = categorias.find(
            (categoria) =>
                categoria.nombre === suministro.categoria_nombre
        )

        setCategoriaEditar(
            categoriaActual
                ? String(categoriaActual.id)
                : ''
        )

        setStockMinimoEditar(
            suministro.stock_minimo ?? ''
        )

        setDetallesEditar(
            suministro.detalles || ''
        )

        setErroresEditar({})
        setMostrarEditar(true)
    }

    const cerrarEditar = () => {

        if (editando) {
            return
        }

        setMostrarEditar(false)
        setErroresEditar({})
    }

    const validarEditar = () => {

        const nuevosErrores = {}

        const stockMinimo = Number(stockMinimoEditar)

        if (
            !Number.isInteger(stockMinimo) ||
            stockMinimo < 0
        ) {
            nuevosErrores.stock_minimo =
                'El stock mínimo debe ser un número entero igual o superior a 0.'
        }

        if (detallesEditar && !detallesEditar.trim()) {
            nuevosErrores.detalles =
                'Los detalles no pueden estar formados únicamente por espacios.'
        }

        setErroresEditar(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const editarSuministro = async () => {

        if (!validarEditar()) {
            return
        }

        const token = localStorage.getItem('access')

        setEditando(true)
        setErroresEditar({})

        try {

            const response = await axios.patch(
                `http://127.0.0.1:8000/api/suministros/${id}/editar/`,
                {
                    categoria: categoriaEditar
                        ? Number(categoriaEditar)
                        : null,
                    stock_minimo: Number(stockMinimoEditar),
                    detalles: detallesEditar.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setSuministro(response.data)

            setMostrarEditar(false)
            setErroresEditar({})

        } catch (error) {

            console.error(
                'Error al editar el suministro:',
                error
            )

            const erroresBackend = error.response?.data

            if (erroresBackend) {
                setErroresEditar(erroresBackend)
            } else {
                setErroresEditar({
                    general:
                        'No se ha podido editar el suministro.',
                })
            }

        } finally {

            setEditando(false)

        }
    }

    if (error) {
        return (
            <div className="ver-suministro-error">

                <h1>{error}</h1>

                <button
                    onClick={() =>
                        navigate('/suministros')
                    }
                >
                    Volver a suministros
                </button>

            </div>
        )
    }

    if (!suministro) {
        return (
            <div className="ver-suministro-loading">

                <h1>Cargando suministro...</h1>

            </div>
        )
    }

    return (
        <div className="ver-suministro-container">

            <div className="ver-suministro-contenido">

                <div className="ver-suministro-cabecera">

                    <div className="ver-suministro-cabecera-info">

                        <h1>

                            {suministro.nombre}

                            <span className="ver-suministro-acciones">

                                <button
                                    className="ver-suministro-editar-icono"
                                    onClick={abrirEditar}
                                    disabled={editando}
                                    title="Editar suministro"
                                >
                                    <FiEdit2 />
                                </button>

                            </span>

                        </h1>

                        <span className="ver-suministro-categoria">
                            {suministro.categoria_nombre ||
                                'Sin categoría'}
                        </span>

                    </div>

                </div>

                <div className="ver-suministro-card">

                    <h2>Información del suministro</h2>

                    <div className="ver-suministro-informacion">

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Nombre
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.nombre}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Categoría
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.categoria_nombre ||
                                    'Sin categoría'}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Fecha de alta
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.f_alta}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Stock actual
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.stock}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Unidad
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.unidad}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Stock mínimo
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.stock_minimo}
                            </span>

                        </div>

                        <div className="ver-suministro-campo ver-suministro-campo-completo">

                            <span className="ver-suministro-label">
                                Detalles
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.detalles ||
                                    'No especificados'}
                            </span>

                        </div>

                    </div>

                </div>

                <div className="ver-suministro-card">

                    <h2>Packs</h2>

                    {suministro.packs?.length > 0 ? (

                        <div className="ver-suministro-packs">

                            {suministro.packs.map((pack) => (

                                <div
                                    key={pack.id}
                                    className="ver-suministro-pack"
                                >

                                    <div className="ver-suministro-pack-info">

                                        <span className="ver-suministro-label">
                                            Pack
                                        </span>

                                        <span className="ver-suministro-valor">
                                            {pack.nombre}
                                        </span>

                                    </div>

                                    <div className="ver-suministro-pack-info">

                                        <span className="ver-suministro-label">
                                            Cantidad
                                        </span>

                                        <span className="ver-suministro-valor">
                                            {pack.cantidad} {suministro.unidad}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="ver-suministro-sin-packs">
                            Este suministro no pertenece a ningún pack.
                        </p>

                    )}

                </div>

                <div className="ver-suministro-card">

                    <h2>Expedientes</h2>

                    <p className="ver-suministro-placeholder">
                        La información de los expedientes estará
                        disponible cuando se implemente su gestión.
                    </p>

                </div>

                <div className="ver-suministro-botones">

                    <button
                        className="ver-suministro-volver"
                        onClick={() =>
                            navigate('/suministros')
                        }
                    >
                        Volver
                    </button>

                </div>

            </div>

            {mostrarEditar && (

                <div className="ver-suministro-modal-overlay">

                    <div className="ver-suministro-modal">

                        <h2>Editar suministro</h2>

                        {erroresEditar.general && (
                            <p className="ver-suministro-modal-error">
                                {erroresEditar.general}
                            </p>
                        )}

                        <div className="ver-suministro-modal-campo">

                            <label>
                                Categoría
                            </label>

                            <select
                                value={categoriaEditar}
                                onChange={(e) => {

                                    setCategoriaEditar(
                                        e.target.value
                                    )

                                    if (erroresEditar.categoria) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            categoria: '',
                                        }))
                                    }

                                }}
                                disabled={editando}
                            >

                                <option value="">
                                    Sin categoría
                                </option>

                                {categorias.map((categoria) => (

                                    <option
                                        key={categoria.id}
                                        value={categoria.id}
                                    >
                                        {categoria.nombre}
                                    </option>

                                ))}

                            </select>

                            {erroresEditar.categoria && (
                                <p className="ver-suministro-modal-error">
                                    {Array.isArray(erroresEditar.categoria)
                                        ? erroresEditar.categoria[0]
                                        : erroresEditar.categoria}
                                </p>
                            )}

                        </div>

                        <div className="ver-suministro-modal-campo">

                            <label>
                                Stock mínimo
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={stockMinimoEditar}
                                onChange={(e) => {

                                    setStockMinimoEditar(
                                        e.target.value
                                    )

                                    if (erroresEditar.stock_minimo) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            stock_minimo: '',
                                        }))
                                    }

                                }}
                                disabled={editando}
                            />

                            {erroresEditar.stock_minimo && (
                                <p className="ver-suministro-modal-error">
                                    {Array.isArray(erroresEditar.stock_minimo)
                                        ? erroresEditar.stock_minimo[0]
                                        : erroresEditar.stock_minimo}
                                </p>
                            )}

                        </div>

                        <div className="ver-suministro-modal-campo">

                            <label>
                                Detalles
                            </label>

                            <textarea
                                value={detallesEditar}
                                onChange={(e) => {

                                    setDetallesEditar(
                                        e.target.value
                                    )

                                    if (erroresEditar.detalles) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            detalles: '',
                                        }))
                                    }

                                }}
                                disabled={editando}
                            />

                            {erroresEditar.detalles && (
                                <p className="ver-suministro-modal-error">
                                    {Array.isArray(erroresEditar.detalles)
                                        ? erroresEditar.detalles[0]
                                        : erroresEditar.detalles}
                                </p>
                            )}

                        </div>

                        <div className="ver-suministro-modal-botones">

                            <button
                                type="button"
                                className="ver-suministro-modal-cancelar"
                                onClick={cerrarEditar}
                                disabled={editando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-suministro-modal-confirmar"
                                onClick={editarSuministro}
                                disabled={editando}
                            >
                                {editando
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default VerSuministro