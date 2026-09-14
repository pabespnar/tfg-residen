import { useEffect, useState } from 'react'
import axios from 'axios'
import './Proveedores.css'

function Proveedores() {

    const [proveedores, setProveedores] = useState([])
    const [proveedorAbierto, setProveedorAbierto] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

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

    const cambiarProveedor = (id) => {

        if (proveedorAbierto === id) {
            setProveedorAbierto(null)
        } else {
            setProveedorAbierto(id)
        }
    }

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

                    {proveedores.map((proveedor) => (

                        <div
                            key={proveedor.id}
                            className={`proveedor-card ${
                                proveedorAbierto === proveedor.id
                                    ? 'proveedor-card-abierto'
                                    : ''
                            }`}
                        >

                            <button
                                type="button"
                                className="proveedor-cabecera"
                                onClick={() =>
                                    cambiarProveedor(proveedor.id)
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
                                    {proveedorAbierto === proveedor.id
                                        ? '⌄'
                                        : '›'}
                                </span>

                            </button>

                            {proveedorAbierto === proveedor.id && (

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
                                                                    ? 'expediente-estado activo'
                                                                    : 'expediente-estado finalizado'
                                                            }
                                                        >
                                                            {expediente.activo
                                                                ? 'Activo'
                                                                : 'Finalizado'}
                                                        </span>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}

                                </div>
                            )}

                        </div>

                    ))}

                </div>
            )}

        </div>
    )
}

export default Proveedores