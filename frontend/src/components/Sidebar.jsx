import { useState } from 'react'

function Sidebar({ setAutenticado }) {
    const [logOut, setLogOut] = useState(false)    
    const cerrarSesion = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

        setAutenticado(false)
    }

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    <li className="sideItem">Pantalla 0</li>
                    <li className="sideItem">Pantalla 1</li>
                    <li className="sideItem">Pantalla 2</li>
                    <li className="sideItem">Pantalla 3</li>
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