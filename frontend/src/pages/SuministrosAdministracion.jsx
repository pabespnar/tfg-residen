import { useEffect, useState } from 'react'
import axios from 'axios'
import './SuministrosAdministracion.css'

function SuministrosAdministracion() {

    const [suministros, setSuministros] = useState([])
    const [suministrosAbiertos, setSuministrosAbiertos] = useState({})
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        obtenerSuministros()
    }, [])

    const obtenerSuministros = async () => {

        try {

            const token = localStorage.getItem('access')

            const respuesta = await axios.get(
                'http://127.0.0.1:8000/api/suministros/suministros/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setSuministros(respuesta.data)

        } catch (error) {

            console.error(error)
            setError('No se han podido cargar los suministros.')

        } finally {

            setCargando(false)
        }
    }

    const alternarSuministro = (suministroId) => {

        setSuministrosAbiertos((estadoAnterior) => ({
            ...estadoAnterior,
            [suministroId]: !estadoAnterior[suministroId],
        }))
    }

    return (
        <div className="suministros-administracion-container">

            <div className="suministros-administracion-titulo">

                <div>

                    <h1>Suministros</h1>

                    <p>
                        Consulta los suministros y los expedientes asociados.
                    </p>

                </div>

                <button
                    type="button"
                    className="suministros-administracion-boton-anadir"
                >
                    +
                </button>

            </div>

            {cargando && (
                <p className="suministros-administracion-mensaje">
                    Cargando suministros...
                </p>
            )}

            {error && (
                <p className="suministros-administracion-error">
                    {error}
                </p>
            )}

            {!cargando && !error && (

                <div className="suministros-administracion-lista">

                    {suministros.map((suministro) => {

                        const abierto =
                            suministrosAbiertos[suministro.id] || false

                        return (

                            <div
                                key={suministro.id}
                                className={
                                    abierto
                                        ? 'suministro-administracion-card suministro-administracion-card-abierto'
                                        : 'suministro-administracion-card'
                                }
                            >

                                <div className="suministro-administracion-cabecera">

                                    <button
                                        type="button"
                                        className="suministro-administracion-cabecera-boton"
                                        onClick={() =>
                                            alternarSuministro(
                                                suministro.id
                                            )
                                        }
                                    >

                                        <div className="suministro-administracion-informacion">

                                            <h2>
                                                {suministro.nombre}
                                            </h2>

                                            <p>
                                                Unidad: {suministro.unidad}
                                            </p>

                                        </div>

                                        <span className="suministro-administracion-flecha">
                                            {abierto
                                                ? '⌄'
                                                : '›'}
                                        </span>

                                    </button>

                                </div>

                                {abierto && (

                                    <div className="suministro-administracion-expedientes">

                                        <h3>
                                            Expedientes
                                        </h3>

                                        {suministro.expedientes.length === 0 ? (

                                            <p className="suministro-administracion-sin-expedientes">
                                                Este suministro no tiene expedientes asociados.
                                            </p>

                                        ) : (

                                            <div className="suministro-administracion-expedientes-lista">

                                                {suministro.expedientes.map(
                                                    (expediente) => (

                                                        <div
                                                            key={expediente.id}
                                                            className="suministro-administracion-expediente"
                                                        >

                                                            <div>

                                                                <h4>
                                                                    {expediente.nombre}
                                                                </h4>

                                                                <p>
                                                                    {expediente.proveedor_nombre}
                                                                    {' '}
                                                                    {expediente.precio_unidad} €/u
                                                                </p>

                                                            </div>

                                                            <span
                                                                className={
                                                                    expediente.activo
                                                                        ? 'suministro-administracion-estado activo'
                                                                        : 'suministro-administracion-estado finalizado'
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

        </div>
    )
}

export default SuministrosAdministracion