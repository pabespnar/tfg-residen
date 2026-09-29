import { useState } from 'react'
import axios from 'axios'
import './CrearUsuario.css'
import { useNavigate } from 'react-router-dom'

function CrearUsuario() {

    const navigate = useNavigate()

    const [usuario, setUsuario] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        dni: '',
        rol: 'residentes',
        password: '',
        imagen_perfil: null,
        es_superusuario: false,
    })

    const [errores, setErrores] = useState({})
    const [mensaje, setMensaje] = useState('')
    const [guardando, setGuardando] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        setUsuario({
            ...usuario,
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

        if (!usuario.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre no puede estar vacío.'
        } else if (usuario.nombre.length > 100) {
            nuevosErrores.nombre =
                'El nombre no puede superar los 100 caracteres.'
        }

        if (!usuario.apellido.trim()) {
            nuevosErrores.apellido =
                'El apellido no puede estar vacío.'
        } else if (usuario.apellido.length > 100) {
            nuevosErrores.apellido =
                'El apellido no puede superar los 100 caracteres.'
        }

        if (!usuario.email.trim()) {
            nuevosErrores.email =
                'El correo electrónico no puede estar vacío.'
        } else if (usuario.email.length > 254) {
            nuevosErrores.email =
                'El correo electrónico es demasiado largo.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
            nuevosErrores.email =
                'Introduce un correo electrónico válido.'
        }

        if (!usuario.telefono.trim()) {
            nuevosErrores.telefono =
                'El teléfono no puede estar vacío.'
        } else if (!/^\d{9}$/.test(usuario.telefono)) {
            nuevosErrores.telefono =
                'El teléfono debe tener 9 dígitos numéricos.'
        }

        if (!usuario.dni.trim()) {
            nuevosErrores.dni = 'El DNI no puede estar vacío.'
        } else if (!/^\d{8}[A-Za-z]$/.test(usuario.dni)) {
            nuevosErrores.dni =
                'El DNI debe tener 8 dígitos y una letra.'
        }

        if (!usuario.password) {
            nuevosErrores.password =
                'La contraseña no puede estar vacía.'
        } else if (usuario.password.length < 8) {
            nuevosErrores.password =
                'La contraseña debe tener al menos 8 caracteres.'
        }

        if (!usuario.rol) {
            nuevosErrores.rol = 'Debes seleccionar un rol.'
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

        datos.append('nombre', usuario.nombre)
        datos.append('apellido', usuario.apellido)
        datos.append('email', usuario.email)
        datos.append('telefono', usuario.telefono)
        datos.append('dni', usuario.dni)
        datos.append('rol', usuario.rol)
        datos.append('password', usuario.password)
        datos.append(
            'es_superusuario',
            usuario.es_superusuario
        )

        if (usuario.imagen_perfil instanceof File) {
            datos.append(
                'imagen_perfil',
                usuario.imagen_perfil
            )
        }

        setGuardando(true)

        axios.post(
            '/api/usuarios/crearusuario/',
            datos,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then(() => {
            setErrores({})
            setMensaje('Usuario creado correctamente.')

            setTimeout(() => {
                navigate('/admin')
            }, 1500)
        })
        .catch((error) => {
            console.error(
                'Error al crear el usuario:',
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
                console.error(
                    'Error al conectar con el servidor.'
                )

                setMensaje(
                    'Error al conectar con el servidor.'
                )
            }

            setGuardando(false)
        })
    }

    return (
        <div className="crear-container">

            <div className="crear-header">

                <div className="crear-avatar">
                    <span>
                        {usuario.nombre?.charAt(0)}
                        {usuario.apellido?.charAt(0)}
                    </span>
                </div>

                <div className="crear-header-info">

                    <h1>
                        Crear usuario
                    </h1>

                    <span className="crear-rol">
                        Nuevo usuario
                    </span>

                </div>

            </div>

            <div className="crear-card">

                <h2>
                    Información del usuario
                </h2>

                <form onSubmit={handleSubmit}>

                    <div className="crear-grid">

                        <div className="crear-field">

                            <label htmlFor="nombre">
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                maxLength={100}
                                value={usuario.nombre}
                                onChange={handleChange}
                            />

                            {errores.nombre && (
                                <span className="crear-error">
                                    {Array.isArray(errores.nombre)
                                        ? errores.nombre[0]
                                        : errores.nombre}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="apellido">
                                Apellido
                            </label>

                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                maxLength={100}
                                value={usuario.apellido}
                                onChange={handleChange}
                            />

                            {errores.apellido && (
                                <span className="crear-error">
                                    {Array.isArray(errores.apellido)
                                        ? errores.apellido[0]
                                        : errores.apellido}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="email">
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                maxLength={254}
                                value={usuario.email}
                                onChange={handleChange}
                            />

                            {errores.email && (
                                <span className="crear-error">
                                    {Array.isArray(errores.email)
                                        ? errores.email[0]
                                        : errores.email}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="telefono">
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                name="telefono"
                                type="text"
                                maxLength={9}
                                value={usuario.telefono}
                                onChange={handleChange}
                            />

                            {errores.telefono && (
                                <span className="crear-error">
                                    {Array.isArray(errores.telefono)
                                        ? errores.telefono[0]
                                        : errores.telefono}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="dni">
                                DNI
                            </label>

                            <input
                                id="dni"
                                name="dni"
                                type="text"
                                maxLength={9}
                                value={usuario.dni}
                                onChange={handleChange}
                            />

                            {errores.dni && (
                                <span className="crear-error">
                                    {Array.isArray(errores.dni)
                                        ? errores.dni[0]
                                        : errores.dni}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="rol">
                                Rol
                            </label>

                            <select
                                id="rol"
                                name="rol"
                                value={usuario.rol}
                                onChange={handleChange}
                            >
                                <option value="residentes">
                                    Gestor de residentes
                                </option>

                                <option value="almacen">
                                    Gestor de almacén
                                </option>

                                <option value="administracion">
                                    Gestor de administración
                                </option>
                            </select>

                            {errores.rol && (
                                <span className="crear-error">
                                    {Array.isArray(errores.rol)
                                        ? errores.rol[0]
                                        : errores.rol}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="password">
                                Contraseña
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={usuario.password}
                                onChange={handleChange}
                            />

                            {errores.password && (
                                <span className="crear-error">
                                    {Array.isArray(errores.password)
                                        ? errores.password[0]
                                        : errores.password}
                                </span>
                            )}

                        </div>

                        <div className="crear-field">

                            <label htmlFor="imagen_perfil">
                                Foto de perfil
                            </label>

                            <input
                                id="imagen_perfil"
                                name="imagen_perfil"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                    const archivo = e.target.files[0]

                                    if (archivo) {
                                        setUsuario({
                                            ...usuario,
                                            imagen_perfil: archivo,
                                        })

                                        setErrores({
                                            ...errores,
                                            imagen_perfil: '',
                                        })
                                    }
                                }}
                            />

                            {errores.imagen_perfil && (
                                <span className="crear-error">
                                    {Array.isArray(errores.imagen_perfil)
                                        ? errores.imagen_perfil[0]
                                        : errores.imagen_perfil}
                                </span>
                            )}

                        </div>

                        <div className="crear-field crear-superusuario">

                            <label htmlFor="es_superusuario">
                                ¿Es superusuario?
                            </label>

                            <div className="crear-checkbox">

                                <input
                                    id="es_superusuario"
                                    name="es_superusuario"
                                    type="checkbox"
                                    checked={usuario.es_superusuario}
                                    onChange={(e) => {
                                        setUsuario({
                                            ...usuario,
                                            es_superusuario:
                                                e.target.checked,
                                        })

                                        setMensaje('')
                                    }}
                                />

                                <span>
                                    El usuario tendrá permisos de superusuario.
                                </span>

                            </div>

                        </div>

                    </div>

                    {mensaje && (
                        <p className="crear-mensaje">
                            {mensaje}
                        </p>
                    )}

                    {!guardando && (
                        <div className="crear-botones">

                            <button
                                type="button"
                                className="crear-boton cancelar"
                                onClick={() => navigate('/admin')}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="crear-boton"
                            >
                                Crear usuario
                            </button>

                        </div>
                    )}

                </form>

            </div>

        </div>
    )
}

export default CrearUsuario