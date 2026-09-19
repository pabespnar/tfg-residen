import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Sidebar({ setAutenticado, rol }) {
    const [logOut, setLogOut] = useState(false)
    const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)
    const [usuario, setUsuario] = useState(null)
    const navigate = useNavigate()

    const cargarNotificaciones = async () => {
        const token = localStorage.getItem('access')

        if (!token) {
            return
        }

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/evento/notificaciones/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const pendientes = response.data.filter(
                (notificacion) => !notificacion.leida
            ).length

            setNotificacionesNoLeidas(pendientes)
        } catch (error) {
            setNotificacionesNoLeidas(0)
        }
    }

    const cargarUsuario = async () => {
        const token = localStorage.getItem('access')

        if (!token) {
            return
        }

        try {
            const response = await axios.get(
                'http://127.0.0.1:8000/api/usuarios/datosperfil/',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setUsuario(response.data)
        } catch (error) {
            setUsuario(null)
        }
    }

    useEffect(() => {
        cargarNotificaciones()
        cargarUsuario()
    }, [])

    const abrirNotificaciones = () => {
        setNotificacionesNoLeidas(0)
        navigate('/notificaciones')
    }

    const cerrarSesion = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

        setAutenticado(false)
    }

    const esSuperusuario = usuario?.is_staff && usuario?.is_superuser

    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    {rol === "residentes" && (
                        <>
                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/modulos')
                                }
                            >
                                Ocupación
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/residentes')
                                }
                            >
                                Residentes
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/suministrosResidentes')
                                }
                            >
                                Suministros
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/historico_residentes')
                                }
                            >
                                Histórico
                            </li>

                            <li
                                className="sideItem"
                                onClick={abrirNotificaciones}
                            >
                                <span className="alertas-item">
                                    Alertas
                                    {notificacionesNoLeidas > 0 && (
                                        <span className="alertas-contador">
                                            {notificacionesNoLeidas}
                                        </span>
                                    )}
                                </span>
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/historial')
                                }
                            >
                                Historial
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/dashboard_residentes')
                                }
                            >
                                Dashboard
                            </li>
                        </>
                    )}

                    {rol === "almacen" && (
                        <>
                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/suministros')
                                }
                            >
                                Suministros
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/packs')
                                }
                            >
                                Packs
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/almacen')
                                }
                            >
                                Almacén
                            </li>

                            <li
                                className="sideItem"
                                onClick={abrirNotificaciones}
                            >
                                <span className="alertas-item">
                                    Alertas
                                    {notificacionesNoLeidas > 0 && (
                                        <span className="alertas-contador">
                                            {notificacionesNoLeidas}
                                        </span>
                                    )}
                                </span>
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/historial')
                                }
                            >
                                Historial
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/dashboard_almacen')
                                }
                            >
                                Dashboard
                            </li>
                        </>
                    )}

                    {rol === "administracion" && (
                        <>
                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/expedientes')
                                }
                            >
                                Expedientes
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/pedidos')
                                }
                            >
                                Pedidos
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/proveedores')
                                }
                            >
                                Proveedores
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/suministrosAdministracion')
                                }
                            >
                                Suministros
                            </li>

                            <li
                                className="sideItem"
                                onClick={abrirNotificaciones}
                            >
                                <span className="alertas-item">
                                    Alertas
                                    {notificacionesNoLeidas > 0 && (
                                        <span className="alertas-contador">
                                            {notificacionesNoLeidas}
                                        </span>
                                    )}
                                </span>
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/historial')
                                }
                            >
                                Historial
                            </li>

                            <li
                                className="sideItem"
                                onClick={() =>
                                    navigate('/dashboard_administracion')
                                }
                            >
                                Dashboard
                            </li>
                        </>
                    )}

                    {esSuperusuario && (
                        <li
                            className="sideItem sidebar-administrador"
                            onClick={() =>
                                navigate('/admin')
                            }
                        >
                            SuperUser
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