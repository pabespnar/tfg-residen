import { useEffect, useState } from 'react'
import axios from 'axios'
import './HistoricoResidentes.css'
import { useNavigate } from 'react-router-dom'

function HistoricoResidentes() {
    const [residentes, setResidentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const obtenerResidentes = async () => {
            const token = localStorage.getItem('access')
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/api/residentes/historicoresidentes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                setResidentes(response.data)
            } catch (error) {
                console.error(
                    'Error al obtener el histórico de residentes:',
                    error
                )
                setError(
                    'No se ha podido cargar el histórico de residentes.'
                )
            } finally {
                setLoading(false)
            }
        }
        obtenerResidentes()
    }, [])

    const obtenerGenero = (genero) => {
        if (genero === 'M') {
            return 'Masculino'
        }
        if (genero === 'F') {
            return 'Femenino'
        }
        if (genero === 'O') {
            return 'Otro'
        }
        return 'Sin especificar'
    }

    if (loading) {
        return (
            <div className="residentes-container">
                <p>Cargando histórico de residentes...</p>
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
                    <h1>Histórico de residentes</h1>
                    <p>
                        Consulta de los residentes dados de baja del centro
                    </p>
                </div>
            </div>
            {residentes.length === 0 ? (
                <div className="residentes-vacio">
                    <p>
                        No hay residentes dados de baja registrados.
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
                                <th>Género</th>
                                <th>Fecha de alta</th>
                                <th>Fecha de baja</th>
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
                                        {obtenerGenero(residente.genero)}
                                    </td>
                                    <td>
                                        {residente.f_alta}
                                    </td>
                                    <td>
                                        {residente.f_baja}
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

export default HistoricoResidentes