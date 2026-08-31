import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Sidebar({ setAutenticado, rol }) {
    const [logOut, setLogOut] = useState(false)
    const navigate = useNavigate()
    const cerrarSesion = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

        setAutenticado(false)
    }

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {rol === "residentes" && (
                        <li
                            className="sideItem"
                            onClick={() =>
                                navigate('/modulos-habitaciones')
                            }
                        >
                            Ocupación
                        </li>

                    )}
                </ul>
            </nav>
            <div className="logout" onClick={() => setLogOut(true)}>
                Cerrar sesión
            </div>
            {logOut && (
                <div className="logout-overlay">
                    <div className="logout-confirmacion">
                        <p>¿Seguro que desea cerrar sesión?</p>

                        <button onClick={cerrarSesion}>
                            Sí, cerrar sesión
                        </button>

                        <button onClick={() => setLogOut(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default Sidebar