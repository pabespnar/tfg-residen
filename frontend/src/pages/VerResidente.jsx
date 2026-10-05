import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerResidente.css'
import { FiEdit2, FiUserPlus, FiLogOut } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

function VerResidente() {
    const [residente, setResidente] = useState(null)
    const [packs, setPacks] = useState([])
    const [packSeleccionado, setPackSeleccionado] = useState(null)
    const [error, setError] = useState('')
    const [mostrarModalAlta, setMostrarModalAlta] = useState(false)
    const [mostrarModalBaja, setMostrarModalBaja] = useState(false)
    const [modulos, setModulos] = useState([])
    const [habitaciones, setHabitaciones] = useState([])
    const [moduloSeleccionado, setModuloSeleccionado] = useState('')
    const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('')
    const [errorAlta, setErrorAlta] = useState('')
    const [errorBaja, setErrorBaja] = useState('')
    const [procesando, setProcesando] = useState(false)

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            `/api/residentes/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setResidente(response.data)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos del residente:',
                error
            )

            if (error.response?.status === 404) {
                setError('El residente no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos del residente.'
                )
            }
        })
    }, [id])

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            '/api/suministros/packs/',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setPacks(response.data)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los packs:',
                error
            )
        })
    }, [])

    const abrirModalPack = (packRecibido) => {
        const pack = packs.find(
            (pack) =>
                String(pack.id) === String(packRecibido.id)
        )

        setPackSeleccionado({
            ...packRecibido,
            contenido: pack?.contenido || []
        })
    }

    const cerrarModalPack = () => {
        setPackSeleccionado(null)
    }

    const abrirModalAlta = async () => {
        setErrorAlta('')
        setModuloSeleccionado('')
        setHabitacionSeleccionada('')
        setHabitaciones([])
        setMostrarModalAlta(true)

        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                '/api/modulos/listadomodulos/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setModulos(response.data)
        } catch (error) {
            console.error(
                'Error al obtener los módulos:',
                error
            )

            setErrorAlta(
                'No se han podido cargar los módulos.'
            )
        }
    }

    const cerrarModalAlta = () => {
        if (procesando) {
            return
        }

        setMostrarModalAlta(false)
        setModuloSeleccionado('')
        setHabitacionSeleccionada('')
        setHabitaciones([])
        setErrorAlta('')
    }

    const seleccionarModulo = async (e) => {
        const moduloId = e.target.value

        setModuloSeleccionado(moduloId)
        setHabitacionSeleccionada('')
        setHabitaciones([])
        setErrorAlta('')

        if (!moduloId) {
            return
        }

        const token = localStorage.getItem('access')

        try {
            const response = await axios.get(
                `/api/modulos/${moduloId}/habitaciones/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setHabitaciones(response.data)
        } catch (error) {
            console.error(
                'Error al obtener las habitaciones:',
                error
            )

            setErrorAlta(
                'No se han podido cargar las habitaciones.'
            )
        }
    }

    const abrirModalBaja = () => {
        setErrorBaja('')
        setMostrarModalBaja(true)
    }

    const cerrarModalBaja = () => {
        if (procesando) {
            return
        }

        setMostrarModalBaja(false)
        setErrorBaja('')
    }

    const darDeBaja = async () => {
        const token = localStorage.getItem('access')

        setProcesando(true)
        setErrorBaja('')

        try {
            const response = await axios.post(
                `/api/residentes/${id}/baja/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            window.location.reload()

            setResidente(response.data)
            setMostrarModalBaja(false)
        } catch (error) {
            console.error(
                'Error al dar de baja al residente:',
                error
            )

            setErrorBaja(
                error.response?.data?.error ||
                'No se ha podido dar de baja al residente.'
            )
        } finally {
            setProcesando(false)
        }
    }

    const darDeAlta = async () => {
        if (!habitacionSeleccionada) {
            setErrorAlta(
                'Debes seleccionar una habitación.'
            )
            return
        }

        const token = localStorage.getItem('access')

        setProcesando(true)
        setErrorAlta('')

        try {
            const response = await axios.post(
                `/api/residentes/${id}/alta/`,
                {
                    habitacion: habitacionSeleccionada,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            window.location.reload()

            setResidente(response.data)
            setMostrarModalAlta(false)
            setModuloSeleccionado('')
            setHabitacionSeleccionada('')
            setHabitaciones([])
        } catch (error) {
            console.error(
                'Error al dar de alta al residente:',
                error
            )

            setErrorAlta(
                error.response?.data?.habitacion ||
                error.response?.data?.error ||
                'No se ha podido dar de alta al residente.'
            )
        } finally {
            setProcesando(false)
        }
    }

    const calcularEstanciaDias = (fechaAlta, fechaBaja) => {
        if (!fechaAlta || !fechaBaja) {
            return null
        }

        const alta = new Date(`${fechaAlta}T00:00:00`)
        const baja = new Date(`${fechaBaja}T00:00:00`)

        const diferencia = baja.getTime() - alta.getTime()

        return Math.round(
            diferencia / (1000 * 60 * 60 * 24)
        )
    }

    const formatearEstancia = (dias) => {
        if (dias === null) {
            return 'En curso'
        }

        if (dias < 30) {
            return `${dias} días`
        }

        const meses = Math.floor(dias / 30)

        if (meses < 12) {
            return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
        }

        const años = Math.floor(meses / 12)
        const mesesRestantes = meses % 12

        if (mesesRestantes === 0) {
            return `${años} ${años === 1 ? 'año' : 'años'}`
        }

        return `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${
            mesesRestantes === 1 ? 'mes' : 'meses'
        }`
    }

    if (error) {
        return (
            <div className="ver-residente-error">
                <h1>{error}</h1>

                <button
                    onClick={() => navigate('/residentes')}
                >
                    Volver a residentes
                </button>
            </div>
        )
    }

    if (!residente) {
        return (
            <div className="ver-residente-loading">
                <h1>Cargando residente...</h1>
            </div>
        )
    }

    return (
        <div className="ver-residente-container">

            <div className="ver-residente-contenido">

                <div className="ver-residente-cabecera">

                    <div className="ver-residente-avatar">
                        {residente.foto ? (
                            <img
                                src={residente.foto}
                                alt="Foto del residente"
                            />
                        ) : (
                            <span>
                                {residente.nombre?.charAt(0)}
                                {residente.apellido?.charAt(0)}
                            </span>
                        )}
                    </div>

                    <div className="ver-residente-cabecera-info">

                        <h1>
                            {residente.nombre} {residente.apellido}

                            <span className="ver-residente-acciones">

                                {residente.activo && (
                                    <button
                                        className="ver-residente-editar-icono"
                                        onClick={() =>
                                            navigate(
                                                `/residentes/${id}/editar`
                                            )
                                        }
                                        title="Editar residente"
                                    >
                                        <FiEdit2 />
                                    </button>
                                )}

                                {residente.activo ? (
                                    <button
                                        className="ver-residente-baja-icono"
                                        onClick={abrirModalBaja}
                                        disabled={procesando}
                                        title="Dar de baja"
                                    >
                                        <FiLogOut />
                                    </button>
                                ) : (
                                    <button
                                        className="ver-residente-alta-icono"
                                        onClick={abrirModalAlta}
                                        disabled={procesando}
                                        title="Dar de alta"
                                    >
                                        <FiUserPlus />
                                    </button>
                                )}

                            </span>
                        </h1>

                        <span
                            className={
                                residente.activo
                                    ? 'ver-residente-estado activo'
                                    : 'ver-residente-estado inactivo'
                            }
                        >
                            {residente.activo
                                ? 'Activo'
                                : 'Inactivo'}
                        </span>

                    </div>

                </div>

                <div className="ver-residente-card">
                    <h2>Datos personales</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Nombre
                            </span>
                            <span className="ver-residente-valor">
                                {residente.nombre}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Apellido
                            </span>
                            <span className="ver-residente-valor">
                                {residente.apellido}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                DNI/NIE
                            </span>
                            <span className="ver-residente-valor">
                                {residente.dni_nie}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Género
                            </span>
                            <span className="ver-residente-valor">
                                {residente.genero === 'M'
                                    ? 'Masculino'
                                    : residente.genero === 'F'
                                        ? 'Femenino'
                                        : 'Otro'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Fecha de nacimiento
                            </span>
                            <span className="ver-residente-valor">
                                {residente.f_nacimiento}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                País
                            </span>
                            <span className="ver-residente-valor">
                                {residente.pais}
                            </span>
                        </div>

                    </div>
                </div>

                <div className="ver-residente-card">
                    <h2>Datos de contacto</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Teléfono
                            </span>
                            <span className="ver-residente-valor">
                                {residente.telefono || 'No especificado'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Correo electrónico
                            </span>
                            <span className="ver-residente-valor">
                                {residente.email || 'No especificado'}
                            </span>
                        </div>

                    </div>
                </div>

                <div className="ver-residente-card">
                    <h2>Información adicional</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo ver-residente-campo-completo">
                            <span className="ver-residente-label">
                                Información
                            </span>

                            <span className="ver-residente-valor">
                                {residente.info || 'No especificada'}
                            </span>
                        </div>

                    </div>
                </div>

                <div className="ver-residente-card">
                    <h2>Estancia</h2>

                    <div className="ver-residente-grid">

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Módulo
                            </span>

                            <span className="ver-residente-valor">
                                {residente.habitacion_modulo_nombre || 'Sin módulo'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Habitación
                            </span>

                            <span className="ver-residente-valor">
                                {residente.habitacion_nombre || 'Sin habitación'}
                            </span>
                        </div>

                        <div className="ver-residente-campo">
                            <span className="ver-residente-label">
                                Fecha de alta
                            </span>

                            <span className="ver-residente-valor">
                                {residente.f_alta}
                            </span>
                        </div>

                        {!residente.activo && (
                            <>
                                <div className="ver-residente-campo">
                                    <span className="ver-residente-label">
                                        Fecha de baja
                                    </span>

                                    <span className="ver-residente-valor">
                                        {residente.f_baja || 'No tiene fecha de baja'}
                                    </span>
                                </div>

                                <div className="ver-residente-campo">
                                    <span className="ver-residente-label">
                                        Duración de la estancia
                                    </span>

                                    <span className="ver-residente-valor">
                                        {formatearEstancia(
                                            calcularEstanciaDias(
                                                residente.f_alta,
                                                residente.f_baja
                                            )
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="ver-residente-card">
                    <h2>Packs recibidos</h2>

                    {residente.packs_recibidos?.length > 0 ? (
                        <div className="ver-residente-packs">

                            {residente.packs_recibidos.map((pack) => (
                                <button
                                    className="ver-residente-pack"
                                    key={pack.id}
                                    onClick={() => abrirModalPack(pack)}
                                >
                                    <div className="ver-residente-pack-info">
                                        <span className="ver-residente-label">
                                            Pack
                                        </span>

                                        <span className="ver-residente-valor">
                                            {pack.nombre}
                                        </span>
                                    </div>

                                    <div className="ver-residente-pack-info">
                                        <span className="ver-residente-label">
                                            Fecha de entrega
                                        </span>

                                        <span className="ver-residente-valor">
                                            {pack.fecha_entrega}
                                        </span>
                                    </div>
                                </button>
                            ))}

                        </div>
                    ) : (
                        <p className="ver-residente-sin-packs">
                            No ha recibido ningún pack.
                        </p>
                    )}
                </div>

                <div className="ver-residente-botones">

                    <button
                        className="ver-residente-volver"
                        onClick={() => navigate('/residentes')}
                    >
                        Volver
                    </button>

                </div>

            </div>

            {packSeleccionado && (
                <div
                    className="ver-residente-pack-modal-overlay"
                    onClick={cerrarModalPack}
                >
                    <div
                        className="ver-residente-pack-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="ver-residente-pack-modal-cerrar"
                            onClick={cerrarModalPack}
                        >
                            ×
                        </button>

                        <h2>{packSeleccionado.nombre}</h2>

                        <div className="ver-residente-pack-modal-fecha">
                            <span className="ver-residente-label">
                                Fecha de recepción
                            </span>

                            <span className="ver-residente-valor">
                                {packSeleccionado.fecha_entrega}
                            </span>
                        </div>

                        <div className="ver-residente-pack-modal-contenido">
                            <h3>Suministros</h3>

                            {packSeleccionado.contenido.length > 0 ? (
                                <div className="ver-residente-pack-modal-suministros">

                                    {packSeleccionado.contenido.map(
                                        (contenido) => (
                                            <div
                                                className="ver-residente-pack-modal-suministro"
                                                key={contenido.id}
                                            >
                                                <span>
                                                    {contenido.suministro_nombre}
                                                </span>

                                                <span>
                                                    {contenido.cantidad}{' '}
                                                    {contenido.suministro_unidad || ''}
                                                </span>
                                            </div>
                                        )
                                    )}

                                </div>
                            ) : (
                                <p className="ver-residente-pack-modal-sin-suministros">
                                    No hay suministros asociados a este pack.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {mostrarModalBaja && (
                <div className="ver-residente-modal-overlay">

                    <div className="ver-residente-modal">

                        <h2>Dar de baja residente</h2>

                        <p>
                            ¿Estás seguro de que quieres dar de baja
                            a este residente?
                        </p>

                        {errorBaja && (
                            <p className="ver-residente-modal-error">
                                {errorBaja}
                            </p>
                        )}

                        <div className="ver-residente-modal-botones">

                            <button
                                type="button"
                                className="ver-residente-modal-cancelar"
                                onClick={cerrarModalBaja}
                                disabled={procesando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-residente-modal-confirmar ver-residente-modal-confirmar-baja"
                                onClick={darDeBaja}
                                disabled={procesando}
                            >
                                {procesando
                                    ? 'Procesando...'
                                    : 'Dar de baja'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {mostrarModalAlta && (
                <div className="ver-residente-modal-overlay">

                    <div className="ver-residente-modal">

                        <h2>Dar de alta residente</h2>

                        <p>
                            Selecciona la habitación que se
                            asignará al residente.
                        </p>

                        {errorAlta && (
                            <p className="ver-residente-modal-error">
                                {errorAlta}
                            </p>
                        )}

                        <div className="ver-residente-modal-campo">

                            <label>Módulo</label>

                            <select
                                value={moduloSeleccionado}
                                onChange={seleccionarModulo}
                                disabled={procesando}
                            >
                                <option value="">
                                    Selecciona un módulo
                                </option>

                                {modulos.map((modulo) => (
                                    <option
                                        key={modulo.id}
                                        value={modulo.id}
                                    >
                                        {modulo.nombre}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div className="ver-residente-modal-campo">

                            <label>Habitación</label>

                            <select
                                value={habitacionSeleccionada}
                                onChange={(e) =>
                                    setHabitacionSeleccionada(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !moduloSeleccionado ||
                                    habitaciones.length === 0 ||
                                    procesando
                                }
                            >
                                <option value="">
                                    Selecciona una habitación
                                </option>

                                {habitaciones.map((habitacion) => {

                                    const completa =
                                        habitacion.residentes_actuales >=
                                        habitacion.capacidad

                                    return (
                                        <option
                                            key={habitacion.id}
                                            value={habitacion.id}
                                            disabled={completa}
                                        >
                                            {habitacion.nombre} (
                                            {habitacion.residentes_actuales}/
                                            {habitacion.capacidad}
                                            )
                                            {completa
                                                ? ' - Completa'
                                                : ''}
                                        </option>
                                    )
                                })}

                            </select>

                        </div>

                        <div className="ver-residente-modal-botones">

                            <button
                                type="button"
                                className="ver-residente-modal-cancelar"
                                onClick={cerrarModalAlta}
                                disabled={procesando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="ver-residente-modal-confirmar"
                                onClick={darDeAlta}
                                disabled={
                                    !habitacionSeleccionada ||
                                    procesando
                                }
                            >
                                {procesando
                                    ? 'Procesando...'
                                    : 'Dar de alta'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    )
}

export default VerResidente
