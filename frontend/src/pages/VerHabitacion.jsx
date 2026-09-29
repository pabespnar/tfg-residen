import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerHabitacion.css'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

function VerHabitacion() {
    const [habitacion, setHabitacion] = useState(null)
    const [error, setError] = useState('')

    const [mostrarEditar, setMostrarEditar] = useState(false)
    const [nombreEditar, setNombreEditar] = useState('')
    const [infoEditar, setInfoEditar] = useState('')
    const [capacidadEditar, setCapacidadEditar] = useState('')
    const [erroresEditar, setErroresEditar] = useState({})
    const [editando, setEditando] = useState(false)

    const [mostrarEliminar, setMostrarEliminar] = useState(false)
    const [errorEliminar, setErrorEliminar] = useState('')
    const [eliminando, setEliminando] = useState(false)

    const navigate = useNavigate()
    const { moduloId, habitacionId } = useParams()

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            `/api/modulos/${moduloId}/habitaciones/${habitacionId}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setHabitacion(response.data)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos de la habitación:',
                error
            )

            if (error.response?.status === 404) {
                setError('La habitación no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos de la habitación.'
                )
            }
        })
    }, [moduloId, habitacionId])

    const abrirEditar = () => {
        setNombreEditar(habitacion.nombre)
        setInfoEditar(habitacion.info || '')
        setCapacidadEditar(habitacion.capacidad)
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

        const nombre = nombreEditar.trim()
        const info = infoEditar.trim()
        const capacidad = Number(capacidadEditar)

        if (!nombre) {
            nuevosErrores.nombre = 'El nombre no puede estar vacío.'
        }

        if (
            nombre &&
            habitacion.residentes &&
            habitacion.residentes.some(
                () => false
            )
        ) 

        if (!Number.isInteger(capacidad) || capacidad < 1) {
            nuevosErrores.capacidad =
                'La capacidad debe ser como mínimo 1.'
        } else if (
            capacidad < habitacion.residentes_actuales
        ) {
            nuevosErrores.capacidad =
                'La capacidad no puede ser inferior al número de residentes actuales.'
        }

        if (infoEditar && !info) {
            nuevosErrores.info =
                'La información no puede estar formada únicamente por espacios.'
        }

        setErroresEditar(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const editarHabitacion = async () => {
        if (!validarEditar()) {
            return
        }

        const token = localStorage.getItem('access')

        setEditando(true)
        setErroresEditar({})

        try {
            const response = await axios.put(
                `/api/modulos/${moduloId}/habitaciones/${habitacionId}/editar/`,
                {
                    nombre: nombreEditar.trim(),
                    info: infoEditar.trim(),
                    capacidad: Number(capacidadEditar),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setHabitacion(response.data)
            setMostrarEditar(false)
            setErroresEditar({})
        } catch (error) {
            console.error(
                'Error al editar la habitación:',
                error
            )

            const erroresBackend = error.response?.data

            if (erroresBackend) {

                if (erroresBackend.error) {

                    setErroresEditar({
                        general: erroresBackend.error
                    })

                } else {

                    setErroresEditar(erroresBackend)

                }

            } else {

                setErroresEditar({
                    general:
                        'No se ha podido editar la habitación.',
                })

            }
        } finally {
            setEditando(false)
        }
    }

    const abrirEliminar = () => {
        setErrorEliminar('')
        setMostrarEliminar(true)
    }

    const cerrarEliminar = () => {
        if (eliminando) {
            return
        }

        setMostrarEliminar(false)
        setErrorEliminar('')
    }

    const eliminarHabitacion = async () => {
        const token = localStorage.getItem('access')

        setEliminando(true)
        setErrorEliminar('')

        try {
            await axios.delete(
                `/api/modulos/${moduloId}/habitaciones/${habitacionId}/eliminar/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            navigate('/modulos')
        } catch (error) {
            console.error(
                'Error al eliminar la habitación:',
                error
            )

            setErrorEliminar(
                error.response?.data?.error ||
                'No se ha podido eliminar la habitación.'
            )
        } finally {
            setEliminando(false)
        }
    }

    if (error) {
        return (
            <div className="ver-habitacion-error">
                <h1>{error}</h1>

                <button
                    onClick={() =>
                        navigate('/modulos')
                    }
                >
                    Volver a habitaciones
                </button>
            </div>
        )
    }

    if (!habitacion) {
        return (
            <div className="ver-habitacion-loading">
                <h1>Cargando habitación...</h1>
            </div>
        )
    }

    return (
        <div className="ver-habitacion-container">

            <div className="ver-habitacion-contenido">

                <div className="ver-habitacion-cabecera">

                    <div className="ver-habitacion-cabecera-info">

                        <h1>
                            {habitacion.nombre}

                            <span className="ver-habitacion-acciones">

                                <button
                                    className="ver-habitacion-editar-icono"
                                    onClick={abrirEditar}
                                    disabled={editando || eliminando}
                                    title="Editar habitación"
                                >
                                    <FiEdit2 />
                                </button>

                                <button
                                    className="ver-habitacion-eliminar-icono"
                                    onClick={abrirEliminar}
                                    disabled={editando || eliminando}
                                    title="Eliminar habitación"
                                >
                                    <FiTrash2 />
                                </button>

                            </span>
                        </h1>

                        <span className="ver-habitacion-modulo">
                            Módulo: {habitacion.modulo_nombre}
                        </span>

                    </div>

                    <div className="ver-habitacion-ocupacion">

                        <span className="ver-habitacion-ocupacion-label">
                            Ocupación
                        </span>

                        <span className="ver-habitacion-ocupacion-valor">
                            {habitacion.residentes_actuales} / {habitacion.capacidad}
                        </span>

                    </div>

                </div>

                <div className="ver-habitacion-card">

                    <h2>Información de la habitación</h2>

                    <div className="ver-habitacion-grid">

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Nombre
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.nombre}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Módulo
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.modulo_nombre}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Capacidad
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.capacidad}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Residentes actuales
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.residentes_actuales}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo">
                            <span className="ver-habitacion-label">
                                Fecha de alta
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.f_alta}
                            </span>
                        </div>

                        <div className="ver-habitacion-campo ver-habitacion-campo-completo">
                            <span className="ver-habitacion-label">
                                Información
                            </span>

                            <span className="ver-habitacion-valor">
                                {habitacion.info || 'No especificada'}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="ver-habitacion-residentes">

                    <h2>Residentes</h2>

                    <div className="ver-habitacion-residentes-lista">

                        {habitacion.residentes?.length > 0 ? (
                            habitacion.residentes.map((residente) => (
                                <div
                                    key={residente.id}
                                    className="ver-habitacion-residente-card"
                                    onClick={() =>
                                        navigate(`/residentes/${residente.id}`)
                                    }
                                >
                                    <div className="ver-habitacion-residente-foto">

                                        {residente.foto ? (
                                            <img
                                                src={residente.foto}
                                                alt={`Foto de ${residente.nombre}`}
                                            />
                                        ) : (
                                            <span>
                                                {residente.nombre?.charAt(0)}
                                                {residente.apellido?.charAt(0)}
                                            </span>
                                        )}

                                    </div>

                                    <div className="ver-habitacion-residente-info">
                                        <span className="ver-habitacion-residente-nombre">
                                            {residente.nombre} {residente.apellido}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="ver-habitacion-sin-residentes">
                                No hay residentes en esta habitación.
                            </p>
                        )}

                    </div>

                </div>

                <div className="ver-habitacion-botones">

                    <button
                        className="ver-habitacion-volver"
                        onClick={() =>
                            navigate('/modulos')
                        }
                    >
                        Volver
                    </button>

                </div>

            </div>

            {mostrarEditar && (
                <div className="ver-habitacion-modal-overlay">

                    <div className="ver-habitacion-modal">

                        <h2>Editar habitación</h2>

                        {erroresEditar.general && (
                            <p className="ver-habitacion-modal-error">
                                {erroresEditar.general}
                            </p>
                        )}

                        <div className="ver-habitacion-modal-campo">

                            <label>Nombre</label>

                            <input
                                type="text"
                                value={nombreEditar}
                                onChange={(e) => {
                                    setNombreEditar(e.target.value)

                                    if (erroresEditar.nombre) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            nombre: '',
                                        }))
                                    }
                                }}
                                disabled={editando}
                            />

                            {erroresEditar.nombre && (
                                <p className="ver-habitacion-modal-error">
                                    {Array.isArray(erroresEditar.nombre)
                                        ? erroresEditar.nombre[0]
                                        : erroresEditar.nombre}
                                </p>
                            )}

                        </div>

                        <div className="ver-habitacion-modal-campo">

                            <label>Información</label>

                            <textarea
                                value={infoEditar}
                                onChange={(e) => {
                                    setInfoEditar(e.target.value)

                                    if (erroresEditar.info) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            info: '',
                                        }))
                                    }
                                }}
                                disabled={editando}
                            />

                            {erroresEditar.info && (
                                <p className="ver-habitacion-modal-error">
                                    {Array.isArray(erroresEditar.info)
                                        ? erroresEditar.info[0]
                                        : erroresEditar.info}
                                </p>
                            )}

                        </div>

                        <div className="ver-habitacion-modal-campo">

                            <label>Capacidad</label>

                            <input
                                type="number"
                                min="1"
                                value={capacidadEditar}
                                onChange={(e) => {
                                    setCapacidadEditar(e.target.value)

                                    if (erroresEditar.capacidad) {
                                        setErroresEditar((errores) => ({
                                            ...errores,
                                            capacidad: '',
                                        }))
                                    }
                                }}
                                disabled={editando}
                            />

                            {erroresEditar.capacidad && (
                                <p className="ver-habitacion-modal-error">
                                    {Array.isArray(erroresEditar.capacidad)
                                        ? erroresEditar.capacidad[0]
                                        : erroresEditar.capacidad}
                                </p>
                            )}

                        </div>

                        <div className="ver-habitacion-modal-botones">

                            <button
                                type="button"
                                className="ver-habitacion-modal-cancelar"
                                onClick={cerrarEditar}
                                disabled={editando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-habitacion-modal-confirmar"
                                onClick={editarHabitacion}
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

            {mostrarEliminar && (
                <div className="ver-habitacion-modal-overlay">

                    <div className="ver-habitacion-modal">

                        <h2>Eliminar habitación</h2>

                        <p>
                            ¿Estás seguro de que quieres eliminar
                            la habitación <strong>{habitacion.nombre}</strong>?
                        </p>

                        <p>
                            Esta acción no se puede deshacer.
                        </p>

                        {errorEliminar && (
                            <p className="ver-habitacion-modal-error">
                                {errorEliminar}
                            </p>
                        )}

                        <div className="ver-habitacion-modal-botones">

                            <button
                                type="button"
                                className="ver-habitacion-modal-cancelar"
                                onClick={cerrarEliminar}
                                disabled={eliminando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-habitacion-modal-confirmar ver-habitacion-modal-confirmar-eliminar"
                                onClick={eliminarHabitacion}
                                disabled={eliminando}
                            >
                                {eliminando
                                    ? 'Eliminando...'
                                    : 'Eliminar'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default VerHabitacion