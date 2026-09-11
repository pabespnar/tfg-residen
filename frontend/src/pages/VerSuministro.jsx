import { useEffect, useState } from 'react'
import axios from 'axios'
import './VerSuministro.css'
import { useNavigate, useParams } from 'react-router-dom'

function VerSuministro() {

    const [suministro, setSuministro] = useState(null)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {

        const token = localStorage.getItem('access')

        axios.get(
            `http://127.0.0.1:8000/api/suministros/${id}/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
            setSuministro(response.data)
        })
        .catch((error) => {

            console.error(
                'Error al obtener los datos del suministro:',
                error
            )

            if (error.response?.status === 404) {
                setError('El suministro no existe.')
            } else {
                setError(
                    'No se han podido cargar los datos del suministro.'
                )
            }
        })

    }, [id])

    if (error) {
        return (
            <div className="ver-suministro-error">

                <h1>{error}</h1>

                <button
                    onClick={() =>
                        navigate('/suministros')
                    }
                >
                    Volver a suministros
                </button>

            </div>
        )
    }

    if (!suministro) {
        return (
            <div className="ver-suministro-loading">

                <h1>Cargando suministro...</h1>

            </div>
        )
    }

    return (
        <div className="ver-suministro-container">

            <div className="ver-suministro-contenido">

                <div className="ver-suministro-cabecera">

                    <div className="ver-suministro-cabecera-info">

                        <h1>
                            {suministro.nombre}
                        </h1>

                        <span className="ver-suministro-categoria">
                            {suministro.categoria_nombre ||
                                'Sin categoría'}
                        </span>

                    </div>

                </div>

                <div className="ver-suministro-card">

                    <h2>Información del suministro</h2>

                    <div className="ver-suministro-informacion">

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Nombre
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.nombre}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Categoría
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.categoria_nombre ||
                                    'Sin categoría'}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Fecha de alta
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.f_alta}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Stock actual
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.stock}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Unidad
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.unidad}
                            </span>

                        </div>

                        <div className="ver-suministro-campo">

                            <span className="ver-suministro-label">
                                Stock mínimo
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.stock_minimo}
                            </span>

                        </div>

                        <div className="ver-suministro-campo ver-suministro-campo-completo">

                            <span className="ver-suministro-label">
                                Detalles
                            </span>

                            <span className="ver-suministro-valor">
                                {suministro.detalles ||
                                    'No especificados'}
                            </span>

                        </div>

                    </div>

                </div>

                <div className="ver-suministro-card">

                    <h2>Packs</h2>

                    {suministro.packs?.length > 0 ? (

                        <div className="ver-suministro-packs">

                            {suministro.packs.map((pack) => (

                                <div
                                    key={pack.id}
                                    className="ver-suministro-pack"
                                >

                                    <div className="ver-suministro-pack-info">

                                        <span className="ver-suministro-label">
                                            Pack
                                        </span>

                                        <span className="ver-suministro-valor">
                                            {pack.nombre}
                                        </span>

                                    </div>

                                    <div className="ver-suministro-pack-info">

                                        <span className="ver-suministro-label">
                                            Cantidad
                                        </span>

                                        <span className="ver-suministro-valor">
                                            {pack.cantidad} {suministro.unidad}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <p className="ver-suministro-sin-packs">
                            Este suministro no pertenece a ningún pack.
                        </p>

                    )}

                </div>

                <div className="ver-suministro-card">

                    <h2>Expedientes</h2>

                    <p className="ver-suministro-placeholder">
                        La información de los expedientes estará
                        disponible cuando se implemente su gestión.
                    </p>

                </div>

                <div className="ver-suministro-botones">

                    <button
                        className="ver-suministro-volver"
                        onClick={() =>
                            navigate('/suministros')
                        }
                    >
                        Volver
                    </button>

                </div>

            </div>

        </div>
    )
}

export default VerSuministro
