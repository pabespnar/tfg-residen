import { useEffect, useState } from 'react'

import axios from 'axios'

import { useNavigate } from 'react-router-dom'

import './CrearResidente.css'

function CrearResidente() {

    const navigate = useNavigate()

    const [modulos, setModulos] = useState([])

    const [habitaciones, setHabitaciones] = useState([])

    const [error, setError] = useState('')

    const [errores, setErrores] = useState({})

    const [residente, setResidente] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        f_nacimiento: '',
        info: '',
        pais: '',
        dni_nie: '',
        habitacion: '',
        genero: '',
        foto: null,
    })

    useEffect(() => {

        const obtenerModulos = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/modulos/listadomodulos/',
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

                setError(
                    'No se han podido cargar los módulos.'
                )
            }
        }

        obtenerModulos()

    }, [])

    const cambiarCampo = (e) => {

        const { name, value } = e.target

        setResidente({
            ...residente,
            [name]: value,
        })

        setErrores({
            ...errores,
            [name]: '',
        })
    }

    const seleccionarModulo = async (e) => {

        const moduloId = e.target.value

        setResidente({
            ...residente,
            habitacion: '',
        })

        setErrores({
            ...errores,
            habitacion: '',
        })

        setHabitaciones([])

        if (!moduloId) {
            return
        }

        const token = localStorage.getItem('access')

        try {

            const response = await axios.get(
                `http://127.0.0.1:8000/api/modulos/${moduloId}/habitaciones/`,
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

            setError(
                'No se han podido cargar las habitaciones.'
            )
        }
    }

    const validarFormulario = () => {

        const nuevosErrores = {}

        if (!residente.nombre.trim()) {
            nuevosErrores.nombre =
                'El nombre es obligatorio.'
        }

        if (residente.nombre.length > 100) {
            nuevosErrores.nombre =
                'El nombre no puede tener más de 100 caracteres.'
        }

        if (!residente.apellido.trim()) {
            nuevosErrores.apellido =
                'El apellido es obligatorio.'
        }

        if (residente.apellido.length > 100) {
            nuevosErrores.apellido =
                'El apellido no puede tener más de 100 caracteres.'
        }

        if (
            residente.telefono &&
            !residente.telefono.trim()
        ) {
            nuevosErrores.telefono =
                'El teléfono no puede estar formado únicamente por espacios.'
        }

        if (
            residente.telefono &&
            residente.telefono.length > 9
        ) {
            nuevosErrores.telefono =
                'El teléfono no puede tener más de 9 caracteres.'
        }

        if (
            residente.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(residente.email)
        ) {
            nuevosErrores.email =
                'El email no tiene un formato válido.'
        }

        if (residente.email.length > 254) {
            nuevosErrores.email =
                'El email no puede tener más de 254 caracteres.'
        }

        if (!residente.f_nacimiento) {
            nuevosErrores.f_nacimiento =
                'La fecha de nacimiento es obligatoria.'
        }

        if (!residente.pais.trim()) {
            nuevosErrores.pais =
                'El país es obligatorio.'
        }

        if (residente.pais.length > 100) {
            nuevosErrores.pais =
                'El país no puede tener más de 100 caracteres.'
        }

        if (!residente.dni_nie.trim()) {
            nuevosErrores.dni_nie =
                'El DNI/NIE es obligatorio.'
        }

        if (residente.dni_nie.length > 20) {
            nuevosErrores.dni_nie =
                'El DNI/NIE no puede tener más de 20 caracteres.'
        }

        if (!residente.genero) {
            nuevosErrores.genero =
                'El género es obligatorio.'
        }

        if (!residente.habitacion) {
            nuevosErrores.habitacion =
                'La habitación es obligatoria.'
        }

        if (
            residente.info &&
            !residente.info.trim()
        ) {
            nuevosErrores.info =
                'La información no puede estar formada únicamente por espacios.'
        }

        setErrores(nuevosErrores)

        return Object.keys(nuevosErrores).length === 0
    }

    const crearResidente = async (e) => {

        e.preventDefault()

        setError('')

        setErrores({})

        if (!validarFormulario()) {
            return
        }

        const token = localStorage.getItem('access')

        const datos = new FormData()

        datos.append('nombre', residente.nombre)
        datos.append('apellido', residente.apellido)
        datos.append('telefono', residente.telefono)
        datos.append('email', residente.email)
        datos.append('f_nacimiento', residente.f_nacimiento)
        datos.append('info', residente.info)
        datos.append('pais', residente.pais)
        datos.append('dni_nie', residente.dni_nie)
        datos.append('habitacion', residente.habitacion)
        datos.append('genero', residente.genero)
        datos.append('activo', 'true')

        if (residente.foto instanceof File) {
            datos.append('foto', residente.foto)
        }

        console.log(
            'Datos enviados:',
            Object.fromEntries(datos.entries())
        )

        try {

            await axios.post(
                'http://127.0.0.1:8000/api/residentes/crearresidente/',
                datos,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            navigate('/residentes')

        } catch (error) {

            console.error(
                'Error al crear el residente:',
                error
            )

            console.error(
                'Respuesta del backend:',
                JSON.stringify(
                    error.response?.data,
                    null,
                    2
                )
            )

            console.error(
                'Código de error:',
                error.response?.status
            )

            const erroresBackend = error.response?.data

            if (erroresBackend?.dni_nie) {
                setErrores({
                    dni_nie:
                        'Ya existe un residente con ese DNI/NIE.'
                })

                return
            }

            if (erroresBackend?.foto) {
                setErrores({
                    foto: Array.isArray(erroresBackend.foto)
                        ? erroresBackend.foto[0]
                        : erroresBackend.foto,
                })

                return
            }

            if (erroresBackend?.habitacion) {
                setErrores({
                    habitacion: Array.isArray(
                        erroresBackend.habitacion
                    )
                        ? erroresBackend.habitacion[0]
                        : erroresBackend.habitacion,
                })
                return
            }

            setError(
                'No se ha podido crear el residente.'
            )
        }
    }

    return (
        <div className="crear-residente-container">

            <div className="crear-residente-contenido">

                <div className="crear-residente-cabecera">

                    <h1>Nuevo residente</h1>

                </div>

                {error && (
                    <p className="crear-residente-error">
                        {error}
                    </p>
                )}

                <form
                    className="crear-residente-formulario"
                    onSubmit={crearResidente}
                >

                    <div className="crear-residente-seccion">

                        <h2>Datos personales</h2>

                        <div className="crear-residente-grid">

                            <div className="crear-residente-campo">

                                <label>Nombre</label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value={residente.nombre}
                                    onChange={cambiarCampo}
                                />

                                {errores.nombre && (
                                    <p className="crear-residente-campo-error">
                                        {errores.nombre}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Apellido</label>

                                <input
                                    type="text"
                                    name="apellido"
                                    value={residente.apellido}
                                    onChange={cambiarCampo}
                                />

                                {errores.apellido && (
                                    <p className="crear-residente-campo-error">
                                        {errores.apellido}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Teléfono</label>

                                <input
                                    type="text"
                                    name="telefono"
                                    value={residente.telefono}
                                    onChange={cambiarCampo}
                                />

                                {errores.telefono && (
                                    <p className="crear-residente-campo-error">
                                        {errores.telefono}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    value={residente.email}
                                    onChange={cambiarCampo}
                                />

                                {errores.email && (
                                    <p className="crear-residente-campo-error">
                                        {errores.email}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Fecha de nacimiento</label>

                                <input
                                    type="date"
                                    name="f_nacimiento"
                                    value={residente.f_nacimiento}
                                    onChange={cambiarCampo}
                                />

                                {errores.f_nacimiento && (
                                    <p className="crear-residente-campo-error">
                                        {errores.f_nacimiento}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>País</label>

                                <input
                                    type="text"
                                    name="pais"
                                    value={residente.pais}
                                    onChange={cambiarCampo}
                                />

                                {errores.pais && (
                                    <p className="crear-residente-campo-error">
                                        {errores.pais}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>DNI/NIE</label>

                                <input
                                    type="text"
                                    name="dni_nie"
                                    value={residente.dni_nie}
                                    onChange={cambiarCampo}
                                />

                                {errores.dni_nie && (
                                    <p className="crear-residente-campo-error">
                                        {errores.dni_nie}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Género</label>

                                <select
                                    name="genero"
                                    value={residente.genero}
                                    onChange={cambiarCampo}
                                >

                                    <option value="">
                                        Selecciona un género
                                    </option>

                                    <option value="M">
                                        Masculino
                                    </option>

                                    <option value="F">
                                        Femenino
                                    </option>

                                    <option value="O">
                                        Otro
                                    </option>

                                </select>

                                {errores.genero && (
                                    <p className="crear-residente-campo-error">
                                        {errores.genero}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="crear-residente-seccion">

                        <h2>Información adicional</h2>

                        <div className="crear-residente-grid">

                            <div className="crear-residente-campo crear-residente-campo-completo">

                                <label>Información</label>

                                <textarea
                                    name="info"
                                    value={residente.info}
                                    onChange={cambiarCampo}
                                />

                                {errores.info && (
                                    <p className="crear-residente-campo-error">
                                        {errores.info}
                                    </p>
                                )}

                            </div>

                            <div className="crear-residente-campo">

                                <label>Foto</label>

                                <input
                                    id="foto"
                                    name="foto"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {

                                        const archivo = e.target.files[0]

                                        if (archivo) {

                                            setResidente({
                                                ...residente,
                                                foto: archivo,
                                            })

                                            setErrores({
                                                ...errores,
                                                foto: '',
                                            })
                                        }
                                    }}
                                />

                                {errores.foto && (
                                    <p className="crear-residente-campo-error">
                                        {errores.foto}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="crear-residente-seccion">

                        <h2>Ubicación</h2>

                        <div className="crear-residente-habitaciones">

                            <div className="crear-residente-campo">

                                <label>Módulo</label>

                                <select
                                    onChange={seleccionarModulo}
                                    defaultValue=""
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

                            <div className="crear-residente-campo">

                                <label>Habitación</label>

                                <select
                                    name="habitacion"
                                    value={residente.habitacion}
                                    onChange={cambiarCampo}
                                    disabled={habitaciones.length === 0}
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

                                {errores.habitacion && (
                                    <p className="crear-residente-campo-error">
                                        {errores.habitacion}
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                    <div className="crear-residente-botones">

                        <button
                            type="button"
                            className="crear-residente-cancelar"
                            onClick={() => navigate('/residentes')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="crear-residente-crear"
                        >
                            Crear residente
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default CrearResidente

