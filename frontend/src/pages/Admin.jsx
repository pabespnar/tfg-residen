import { useNavigate } from 'react-router-dom'
import './Admin.css'

function Admin() {

    const navigate = useNavigate()

    const funciones = [
        {
            titulo: 'Crear usuario',
            descripcion:
                'Registra un nuevo usuario del sistema y configura sus datos y rol.',
            accion: () => navigate('/crear_usuario'),
        },
        {
            titulo: 'Editar centro',
            descripcion:
                'Consulta y modifica la información del centro gestionado por la aplicación.',
            accion: () => navigate('/editar_centro'),
        },
        {
            titulo: 'Administración total',
            descripcion:
                'Accede al panel de administración desde la propia base de datos.',
            accion: () => window.open('http://127.0.0.1:8000/admin/', '_blank'),
        },
    ]

    return (
        <div className="admin">

            <div className="admin-cabecera">
                <h1>SuperUsuario</h1>

                <p>
                    Desde este apartado podrás gestionar los usuarios, la información
                    del centro y acceder al panel de administración del sistema.
                </p>
            </div>

            <div className="admin-funciones">

                {funciones.map((funcion) => (
                    <div
                        className="admin-funcion"
                        key={funcion.titulo}
                        onClick={funcion.accion}
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

export default Admin