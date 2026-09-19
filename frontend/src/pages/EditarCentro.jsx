import { useEffect, useState } from 'react'
import axios from 'axios'
import './EditarCentro.css'
import { useNavigate } from 'react-router-dom'

function EditarCentro() {

    const navigate = useNavigate()

    const [centro, setCentro] = useState({
        nombre: '',
        logo: null,
        presupuesto_referencia: '',
        presupuesto: '',
        correo: '',
    })

    const [logoActual, setLogoActual] = useState(null)
    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get(
            'http://127.0.0.1:8000/api/centro/',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setCentro({
                nombre: response.data.nombre || '',
                logo: null,
                presupuesto_referencia:
                    response.data.presupuesto_referencia ?? '',
                presupuesto:
                    response.data.presupuesto ?? '',
                correo: response.data.correo || '',
            })

            setLogoActual(response.data.logo || null)
            setCargando(false)
        })
        .catch((error) => {
            console.error(
                'Error al obtener los datos del centro:',
                error
            )

            setMensaje(
                'Error al cargar los datos del centro.'
            )

            setCargando(false)
        })
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setCentro({
            ...centro,
            [name]: value,
        })

        setErrores({
            ...errores,
            [name]: '',
        })

        setMensaje('')
    }

    const validarFormulario = () => {
        const nuevosErrores = {}

        if (!centro.nombre.trim()) {
            nuevosErrores.nombre =
                'El nombre no puede estar vacío.'
        } else if (centro.nombre.length > 100) {
            nuevosErrores.nombre =
                'El nombre no puede superar los 100 caracteres.'
        }

        if (!centro.correo.trim()) {
            nuevosErrores.correo =
                'El correo electrónico no puede estar vacío.'
        } else if (centro.correo.length > 254) {
            nuevosErrores.correo =
                'El correo electrónico es demasiado largo.'
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                centro.correo
            )
        ) {
            nuevosErrores.correo =
                'Introduce un correo electrónico válido.'
        }

        if (
            centro.presupuesto === '' ||
            Number.isNaN(Number(centro.presupuesto))
        ) {
            nuevosErrores.presupuesto =
                'El presupuesto debe ser un número válido.'
        } else if (Number(centro.presupuesto) < 0) {
            nuevosErrores.presupuesto =
                'El presupuesto no puede ser negativo.'
        }

        if (
            centro.presupuesto_referencia === '' ||
            Number.isNaN(
                Number(centro.presupuesto_referencia)
            )
        ) {
            nuevosErrores.presupuesto_referencia =
                'El presupuesto de referencia debe ser un número válido.'
        } else if (
            Number(centro.presupuesto_referencia) < 0
        ) {
            nuevosErrores.presupuesto_referencia =
                'El presupuesto de referencia no puede ser negativo.'
        }

        if (
            centro.presupuesto !== '' &&
            centro.presupuesto_referencia !== '' &&
            Number(centro.presupuesto_referencia) <
                Number(centro.presupuesto)
        ) {
            nuevosErrores.presupuesto_referencia =
                'El presupuesto de referencia no puede ser menor que el presupuesto.'
        }

        setErrores(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setMensaje('')

        if (!validarFormulario()) {
            return
        }

        const token = localStorage.getItem('access')
        const datos = new FormData()

        datos.append('nombre', centro.nombre)
        datos.append(
            'presupuesto_referencia',
            centro.presupuesto_referencia
        )
        datos.append(
            'presupuesto',
            centro.presupuesto
        )
        datos.append('correo', centro.correo)

        if (centro.logo instanceof File) {
            datos.append('logo', centro.logo)
        }

        setGuardando(true)

        axios.patch(
            'http://127.0.0.1:8000/api/centro/',
            datos,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then(() => {
            setErrores({})
            setMensaje(
                'Centro actualizado correctamente.'
            )

        setTimeout(() => {
            window.location.reload()
        }, 1500)
        })
        .catch((error) => {
            console.error(
                'Error al actualizar el centro:',
                error
            )

            if (error.response) {
                console.error(
                    'Respuesta del backend:',
                    error.response.data
                )

                console.error(
                    'Código de error:',
                    error.response.status
                )

                setErrores(error.response.data)
            } else {
                setMensaje(
                    'Error al conectar con el servidor.'
                )
            }

            setGuardando(false)
        })
    }

    if (cargando) {
        return (
            <div className="editar-centro-container">
                <p className="editar-centro-cargando">
                    Cargando datos del centro...
                </p>
            </div>
        )
    }

    return (
        <div className="editar-centro-container">

            <div className="editar-centro-header">

                <div className="editar-centro-avatar">

                    {logoActual ? (
                        <img
                            src={
                                logoActual.startsWith('http')
                                    ? logoActual
                                    : `http://127.0.0.1:8000${logoActual}`
                            }
                            alt="Logo del centro"
                        />
                    ) : (
                        <span>
                            {centro.nombre?.charAt(0)}
                        </span>
                    )}

                </div>

                <div className="editar-centro-header-info">

                    <h1>
                        Editar centro
                    </h1>

                    <span className="editar-centro-rol">
                        Información del centro
                    </span>

                </div>

            </div>

            <div className="editar-centro-card">

                <h2>
                    Información del centro
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="editar-centro-grid">

                        <div className="editar-centro-field">

                            <label htmlFor="nombre">
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                maxLength={100}
                                value={centro.nombre}
                                onChange={handleChange}
                            />

                            {errores.nombre && (
                                <span className="editar-centro-error">
                                    {Array.isArray(
                                        errores.nombre
                                    )
                                        ? errores.nombre[0]
                                        : errores.nombre}
                                </span>
                            )}

                        </div>

                        <div className="editar-centro-field">

                            <label htmlFor="correo">
                                Correo electrónico
                            </label>

                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                maxLength={254}
                                value={centro.correo}
                                onChange={handleChange}
                            />

                            {errores.correo && (
                                <span className="editar-centro-error">
                                    {Array.isArray(
                                        errores.correo
                                    )
                                        ? errores.correo[0]
                                        : errores.correo}
                                </span>
                            )}

                        </div>

                        <div className="editar-centro-field">

                            <label htmlFor="presupuesto_referencia">
                                Presupuesto de referencia
                            </label>

                            <input
                                id="presupuesto_referencia"
                                name="presupuesto_referencia"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    centro.presupuesto_referencia
                                }
                                onChange={handleChange}
                            />

                            {errores.presupuesto_referencia && (
                                <span className="editar-centro-error">
                                    {Array.isArray(
                                        errores.presupuesto_referencia
                                    )
                                        ? errores.presupuesto_referencia[0]
                                        : errores.presupuesto_referencia}
                                </span>
                            )}

                        </div>

                        <div className="editar-centro-field">

                            <label htmlFor="presupuesto">
                                Presupuesto
                            </label>

                            <input
                                id="presupuesto"
                                name="presupuesto"
                                type="number"
                                min="0"
                                step="0.01"
                                value={centro.presupuesto}
                                onChange={handleChange}
                            />

                            {errores.presupuesto && (
                                <span className="editar-centro-error">
                                    {Array.isArray(
                                        errores.presupuesto
                                    )
                                        ? errores.presupuesto[0]
                                        : errores.presupuesto}
                                </span>
                            )}

                        </div>

                        <div className="editar-centro-field">

                            <label htmlFor="logo">
                                Logo
                            </label>

                            <input
                                id="logo"
                                name="logo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                    const archivo =
                                        e.target.files[0]

                                    if (archivo) {
                                        setCentro({
                                            ...centro,
                                            logo: archivo,
                                        })

                                        setLogoActual(
                                            URL.createObjectURL(
                                                archivo
                                            )
                                        )

                                        setErrores({
                                            ...errores,
                                            logo: '',
                                        })

                                        setMensaje('')
                                    }
                                }}
                            />

                            {errores.logo && (
                                <span className="editar-centro-error">
                                    {Array.isArray(
                                        errores.logo
                                    )
                                        ? errores.logo[0]
                                        : errores.logo}
                                </span>
                            )}

                        </div>

                    </div>

                    {mensaje && (
                        <p className="editar-centro-mensaje">
                            {mensaje}
                        </p>
                    )}

                    {!guardando && (
                        <div className="editar-centro-botones">

                            <button
                                type="button"
                                className="editar-centro-boton cancelar"
                                onClick={() => navigate('/admin')}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="editar-centro-boton"
                            >
                                Guardar cambios
                            </button>

                        </div>
                    )}

                </form>

            </div>

        </div>
    )
}

export default EditarCentro