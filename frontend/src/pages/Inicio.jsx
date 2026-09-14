import { useNavigate } from 'react-router-dom'
import './Inicio.css'

function Inicio({ rol }) {

    const navigate = useNavigate()

    const contenido = {
        residentes: {
            titulo: 'Gestión de residentes',
            descripcion:
                'Desde este apartado podrás gestionar la información de los residentes y organizar su distribución dentro del centro.',
            funciones: [
                {
                    titulo: 'Residentes',
                    descripcion:
                        'Consulta, registra y modifica la información de los residentes del centro.',
                    ruta: '/residentes',
                },
                {
                    titulo: 'Módulos y habitaciones',
                    descripcion:
                        'Gestiona los módulos y habitaciones, su capacidad y la ocupación de los mismos.',
                    ruta: '/modulos',
                },
                {
                    titulo: 'Histórico de residentes',
                    descripcion:
                        'Consulta las estancias finalizadas y el histórico de residentes dados de baja.',
                    ruta: '/historico_residentes',
                },
                {
                    titulo: 'Dashboard',
                    descripcion:
                        'Consulta información y estadísticas relacionadas con los residentes del centro.',
                    ruta: '/dashboard_residentes',
                },
            ],
        },

        almacen: {
            titulo: 'Gestión de almacén',
            descripcion:
                'Desde este apartado podrás gestionar los suministros, packs y movimientos de almacén del centro.',
            funciones: [
                {
                    titulo: 'Suministros',
                    descripcion:
                        'Consulta y gestiona los suministros disponibles en el almacén, organizados por categorías.',
                    ruta: '/suministros',
                },
                {
                    titulo: 'Packs',
                    descripcion:
                        'Gestiona los packs de suministros y su asignación a los residentes.',
                    ruta: '/packs',
                },
                {
                    titulo: 'Almacén',
                    descripcion:
                        'Gestiona las entradas y salidas de suministros del almacén.',
                    ruta: '/almacen',
                },
                {
                    titulo: 'Dashboard',
                    descripcion:
                        'Consulta información y estadísticas relacionadas con el almacén y sus suministros.',
                    ruta: '/dashboard_almacen',
                },
            ],
        },

        administracion: {
            titulo: 'Gestión de administración',
            descripcion:
                'Desde este apartado podrás gestionar los expedientes, pedidos y proveedores del centro.',
            funciones: [
                {
                    titulo: 'Expedientes',
                    descripcion:
                        'Consulta y gestiona los expedientes del centro, sus proveedores, suministros y presupuesto.',
                    ruta: '/expedientes',
                },
                {
                    titulo: 'Pedidos',
                    descripcion:
                        'Consulta y gestiona los pedidos realizados, su estado y los expedientes asociados.',
                    ruta: '/pedidos',
                },
                {
                    titulo: 'Proveedores',
                    descripcion:
                        'Consulta y gestiona los proveedores con los que trabaja el centro.',
                    ruta: '/proveedores',
                },
                {
                    titulo: 'Suministros',
                    descripcion:
                        'Consulta los pedidos registrados en el sistema y a que expedientes pertenecen.',
                    ruta: '/suministrosAdministracion',
                },
                {
                    titulo: 'Dashboard',
                    descripcion:
                        'Consulta información y estadísticas relacionadas con la administración del centro.',
                    ruta: '/dashboard_administracion',
                },
            ],
        },
    }

    const datos = contenido[rol]

    if (!datos) {
        return null
    }

    return (
        <div className="inicio">

            <div className="inicio-cabecera">
                <h1>{datos.titulo}</h1>

                <p>{datos.descripcion}</p>
            </div>

            <div className="inicio-funciones">

                {datos.funciones.map((funcion) => (
                    <div
                        className="inicio-funcion"
                        key={funcion.titulo}
                        onClick={() => navigate(funcion.ruta)}
                        style={{
                            cursor: 'pointer'
                        }}
                    >
                        <h2>{funcion.titulo}</h2>

                        <p>{funcion.descripcion}</p>
                    </div>
                ))}

            </div>

        </div>
    )
}

export default Inicio
