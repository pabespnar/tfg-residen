import { useNavigate } from 'react-router-dom'
import './Almacen.css'

function Almacen() {

    const navigate = useNavigate()

    return (
        <div className="almacen-container">

            <h1>Gestión de almacén</h1>

            <div className="almacen-seccion">

                <h2>Gestionar movimientos</h2>

                <div className="almacen-botones">

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/nueva-baja')}
                    >
                        <span className="almacen-boton-titulo">
                            Nueva baja
                        </span>

                        <span className="almacen-boton-descripcion">
                            Registrar una salida extraordinaria de almacén
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/nueva-alta')}
                    >
                        <span className="almacen-boton-titulo">
                            Nueva alta
                        </span>

                        <span className="almacen-boton-descripcion">
                            Registrar una entrada de suministros
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/bajas')}
                    >
                        <span className="almacen-boton-titulo">
                            Ver bajas
                        </span>

                        <span className="almacen-boton-descripcion">
                            Consultar las salidas registradas en el almacén
                        </span>
                    </button>

                    <button
                        className="almacen-boton"
                        onClick={() => navigate('/almacen/altas')}
                    >
                        <span className="almacen-boton-titulo">
                            Ver altas
                        </span>

                        <span className="almacen-boton-descripcion">
                            Consultar las entradas registradas en el almacén
                        </span>
                    </button>

                </div>

            </div>

        </div>
    )
}

export default Almacen