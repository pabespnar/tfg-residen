import './Inicio.css'

function Inicio({ rol }) {

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
                },
                {
                    titulo: 'Módulos y habitaciones',
                    descripcion:
                        'Gestiona los módulos y habitaciones, su capacidad y la ocupación de los mismos.',
                },
                {
                    titulo: 'Histórico de residentes',
                    descripcion:
                        'Consulta las estancias finalizadas y el histórico de residentes dados de baja.',
                },
                {
                    titulo: 'Dashboard',
                    descripcion:
                        'Consulta información y estadísticas relacionadas con los residentes del centro.',
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