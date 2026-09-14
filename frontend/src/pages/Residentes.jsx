import { useEffect, useState } from 'react'
import axios from 'axios'
import './Residentes.css'
import { FaPencilAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function Residentes() {

    const [residentes, setResidentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    useEffect(() => {

        const obtenerResidentes = async () => {

            const token = localStorage.getItem('access')

            try {

                const response = await axios.get(
                    'http://127.0.0.1:8000/api/residentes/listaresidentes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setResidentes(response.data)

            } catch (error) {

                console.error(
                    'Error al obtener los residentes:',
                    error
                )

                setError(
                    'No se han podido cargar los residentes.'
                )

            } finally {

                setLoading(false)

            }
        }

        obtenerResidentes()

    }, [])

    if (loading) {
        return (
            <div className="residentes-container">
                <p>Cargando residentes...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="residentes-container">
                <p className="residentes-error">
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className="residentes-container">

            <div className="residentes-header">

                <div>
                    <h1>Residentes</h1>

                    <p>
                        Gestión de los residentes activos del centro
                    </p>
                </div>

                <button
                    type="button"
                    className="residentes-anadir"
                    onClick={() => navigate('/residentes/nuevo')}
                >
                    +
                </button>

            </div>

            {residentes.length === 0 ? (

                <div className="residentes-vacio">
                    <p>
                        No hay residentes activos registrados.
                    </p>
                </div>

            ) : (

                <div className="tabla-residentes-container">

                    <table className="tabla-residentes">

                        <thead>

                            <tr>
                                <th>Residente</th>
                                <th>DNI/NIE</th>
                                <th>País</th>
                                <th>Habitación</th>
                                <th>Fecha de alta</th>
                                <th>Acciones</th>
                            </tr>

                        </thead>

                        <tbody>

                            {residentes.map((residente) => (

                                <tr
                                    key={residente.id}
                                    onClick={() =>
                                        navigate(`/residentes/${residente.id}`)
                                    }
                                >

                                    <td>
                                        <div className="residente-nombre">

                                            <strong>
                                                {residente.nombre}{' '}
                                                {residente.apellido}
                                            </strong>

                                        </div>
                                    </td>

                                    <td>
                                        {residente.dni_nie}
                                    </td>

                                    <td>
                                        {residente.pais}
                                    </td>

                                    <td>
                                        {residente.habitacion_nombre
                                            ? residente.habitacion_nombre
                                            : 'Sin habitación'}
                                    </td>

                                    <td>
                                        {residente.f_alta}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            className="residentes-editar-icono"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(
                                                    `/residentes/${residente.id}/editar`
                                                )
                                            }}
                                            title="Editar residente"
                                        >
                                            <FaPencilAlt />
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    )
}

export default Residentes