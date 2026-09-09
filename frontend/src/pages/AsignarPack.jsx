import { useEffect, useState } from 'react'
import axios from 'axios'
import './AsignarPack.css'
import { useNavigate, useParams } from 'react-router-dom'

function AsignarPack() {

    const { packId } = useParams()
    const navigate = useNavigate()

    const [residentes, setResidentes] = useState([])
    const [residentesSeleccionados, setResidentesSeleccionados] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const obtenerResidentes = async () => {

        const token = localStorage.getItem('access')

        try {

            const response = await axios.get(
                `http://127.0.0.1:8000/api/residentes/listaresidentes/?pack_id=${packId}`,
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

        }
    }

    useEffect(() => {

        const cargarResidentes = async () => {

            setLoading(true)

            await obtenerResidentes()

            setLoading(false)

        }

        cargarResidentes()

    }, [packId])

    const cambiarSeleccionResidente = (id) => {

        setResidentesSeleccionados((seleccionados) => {

            if (seleccionados.includes(id)) {

                return seleccionados.filter(
                    (residenteId) => residenteId !== id
                )

            }

            return [
                ...seleccionados,
                id
            ]

        })

    }

    const asignarPack = async () => {

        const token = localStorage.getItem('access')

        try {

            await axios.post(
                `http://127.0.0.1:8000/api/suministros/packs/${packId}/crearentrega/`,
                {
                    residentes: residentesSeleccionados,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            navigate('/packs', {
                state: {
                    mensaje: 'Pack asignado correctamente.'
                }
            })

        } catch (error) {

            console.error(
                'Error al asignar el pack:',
                error.response?.data
            )

            setError(
                'Ha ocurrido un error al asignar el pack.'
            )

        }

    }

    if (loading) {

        return (
            <div className="residentes-container">

                <p>
                    Cargando residentes...
                </p>

            </div>
        )

    }


    return (
        <div className="residentes-container">

            <div className="residentes-header">

                <div>

                    <h1>
                        Asignar pack
                    </h1>

                    <p>
                        Selecciona los residentes a los que se asignará el pack
                    </p>

                </div>

                <button
                    type="button"
                    className="asignar-pack-boton"
                    onClick={asignarPack}
                    disabled={residentesSeleccionados.length === 0}
                >
                    Asignar pack
                </button>

            </div>

            {error && (
                <p className="residentes-error">
                    {error}
                </p>
            )}

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

                                <th>
                                    Residente
                                </th>

                                <th>
                                    Seleccionar
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {residentes.map((residente) => (

                                <tr
                                    key={residente.id}
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
                                        {residente.pack_recibido ? (
                                            <span className="asignar-pack-recibido">
                                                Ya recibido
                                            </span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                className="asignar-pack-checkbox"
                                                checked={residentesSeleccionados.includes(
                                                    residente.id
                                                )}
                                                onChange={() =>
                                                    cambiarSeleccionResidente(
                                                        residente.id
                                                    )
                                                }
                                            />
                                        )}
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

export default AsignarPack