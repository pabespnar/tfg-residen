import { useNavigate } from 'react-router-dom'
import fotoperfil from '../assets/fotoperfil_placeholder.png'
import logocentro from '../assets/logo_placeholder.png'
import { useEffect, useState } from 'react'
import axios from 'axios'
import logoSinTexto from '../assets/logoSinTexto.png'

function Navbar() {

    const [usuario, setUsuario] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('access')

        axios.get('http://127.0.0.1:8000/api/usuarios/datosperfil/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            setUsuario(response.data)
        })
        .catch((error) => {
            console.error('Error al obtener el perfil:', error)
        })
    }, [])

    const nombresRol = {
        residentes: 'Gestor de residentes',
        almacen: 'Gestor de almacén',
        administracion: 'Gestor de administración',
    }

    const navigate = useNavigate()

    return (
        <nav className="navbar">

            <div
                className="init"
                onClick={() => navigate('/')}
            >
                <img
                    src={logoSinTexto}
                    alt="Gestión residencial"
                />
            </div>

            <div className="center-info">
                <div>
                    <img
                        src={logocentro}
                        alt="Logo del centro"
                        className="foto"
                    />
                </div>

                <div>
                    Nombre del Centro
                </div>
            </div>

            <div
                className="user-info"
                onClick={() => navigate('/perfil')}
            >
                <div>
                    <div>
                        {usuario
                            ? `${usuario.nombre} ${usuario.apellido}`
                            : 'Cargando...'}
                    </div>

                    <div>
                        {usuario
                            ? nombresRol[usuario.rol]
                            : 'Cargando...'}
                    </div>
                </div>

                <div>
                    <img
                        src={usuario?.imagen_perfil || fotoperfil}
                        alt="Foto de perfil"
                        className="fotoperfil"
                    />
                </div>

            </div>

        </nav>
    )
}

export default Navbar