import { useNavigate } from 'react-router-dom'
import fotoperfil from '../assets/fotoperfil_placeholder.png'
import logocentro from '../assets/logo_placeholder.png'

function Navbar() {
    const navigate = useNavigate()

    return (
        <nav className="navbar">
            <div
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
            >
                Gestión residencial
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
                        Nombre de Usuario
                    </div>

                    <div>
                        Rol de Usuario
                    </div>
                </div>

                <div>
                    <img
                        src={fotoperfil}
                        alt="Foto de perfil"
                        className="fotoperfil"
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar