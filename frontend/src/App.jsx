import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Inicio from "./pages/Inicio";
import Layout from './Layout'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import EditarPerfil from './pages/EditarPerfil'
import CambiarContrasena from './pages/CambiarContrasena'
import RecuperarContrasena from './pages/RecuperarContrasena'
import RestablecerContrasena from './pages/RestablecerContrasena'
import ModulosYHabitaciones from "./pages/ModulosYHabitaciones";
import Residentes from "./pages/Residentes";
import CrearResidente from "./pages/CrearResidente";
import VerResidente from "./pages/VerResidente";
import EditarResidente from "./pages/EditarResidente";
import VerHabitacion from "./pages/VerHabitacion";
import VerHistoricoResidentes from "./pages/HistoricoResidentes";
import DashboardResidentes from "./pages/DashboardResidentes";
import Suministros from "./pages/Suministros";
import Packs from "./pages/Packs";
import AsignarPack from "./pages/AsignarPack";
import Almacen from './pages/Almacen';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BajasAlmacen from './pages/BajasAlmacen';
import AltasAlmacen from './pages/AltasAlmacen';
import VerSuministro from './pages/VerSuministro';
import DashboardAlmacen from "./pages/DashboardAlmacen";
import Expedientes from "./pages/Expedientes";


function tokenValido() {

    const token = localStorage.getItem('access')

    if (!token) {
        return false
    }

    try {

        const payload = JSON.parse(atob(token.split('.')[1]))

        return payload.exp > Date.now() / 1000

    } catch {

        return false

    }
}

async function obtenerRol() {

    const token = localStorage.getItem('access')

    if (!token) {
        return null
    }

    try {

        const respuesta = await axios.get(
            "http://127.0.0.1:8000/api/usuarios/datosperfil/",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        return respuesta.data.rol

    } catch (error) {

        console.error(
            "Error al obtener el rol del usuario:",
            error
        )

        return null

    }
}

function App() {

    const [autenticado, setAutenticado] = useState(
        tokenValido()
    )

    const [rol, setRol] = useState(null)

    useEffect(() => {

        const cargarRol = async () => {

            if (!autenticado) {

                setRol(null)
                return

            }

            const rolUsuario = await obtenerRol()

            setRol(rolUsuario)

        }

        cargarRol()

    }, [autenticado])

    useEffect(() => {

        const token = localStorage.getItem('access')

        if (!token) {
            return
        }

        try {

            const payload = JSON.parse(atob(token.split('.')[1]))
            const tiempoExpiracion = payload.exp * 1000
            const tiempoActual = Date.now()

            const tiempoAviso = tiempoExpiracion - tiempoActual - 60000

            const aviso = setTimeout(() => {

                if (!sessionStorage.getItem('aviso_sesion_mostrado')) {

                    alert(
                        'Su sesión expirará en 1 minuto. Guarde su trabajo y reinicie la sesión en caso de continuar trabajando.'
                    )

                    sessionStorage.setItem(
                        'aviso_sesion_mostrado',
                        'true'
                    )
                }

            }, Math.max(tiempoAviso, 0))

            const expiracion = setTimeout(() => {

                localStorage.removeItem('access')
                localStorage.removeItem('refresh')

                sessionStorage.removeItem('aviso_sesion_mostrado')

                setRol(null)
                setAutenticado(false)

            }, Math.max(tiempoExpiracion - tiempoActual, 0))

            return () => {
                clearTimeout(aviso)
                clearTimeout(expiracion)
            }

        } catch {

            localStorage.removeItem('access')
            localStorage.removeItem('refresh')
            sessionStorage.removeItem('aviso_sesion_mostrado')

            setRol(null)
            setAutenticado(false)
        }

    }, [autenticado])

    if (!autenticado) {

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

    }

    return (
        <Router>

            {!autenticado ? (

                <Routes>

                    <Route
                        path="/login"
                        element={
                            <Login setAutenticado={setAutenticado} />
                        }
                    />

                    <Route
                        path="/recuperar-contrasena"
                        element={<RecuperarContrasena />}
                    />

                    <Route
                        path="/restablecer-contrasena/:uid/:token"
                        element={<RestablecerContrasena />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate to="/login" replace />
                        }
                    />

                </Routes>

            ) : (

                <Routes>

                    <Route
                        element={
                            <Layout
                                setAutenticado={setAutenticado}
                                rol={rol}
                            />
                        }
                    >

                        <Route
                            path="/"
                            element={
                                <Inicio rol={rol} />
                            }
                        />

                        <Route
                            path="/perfil"
                            element={<Perfil />}
                        />

                        <Route
                            path="/editar-perfil"
                            element={<EditarPerfil />}
                        />

                        <Route
                            path="/cambiar-contrasena"
                            element={<CambiarContrasena />}
                        />

                        {rol === "residentes" && (
                            <>
                                <Route
                                    path="/modulos"
                                    element={<ModulosYHabitaciones />}
                                />

                                <Route
                                    path="/residentes"
                                    element={<Residentes />}
                                />

                                <Route
                                    path="/residentes/nuevo"
                                    element={<CrearResidente />}
                                />

                                <Route
                                    path="/residentes/:id"
                                    element={<VerResidente />}
                                />

                                <Route
                                    path="/residentes/:id/editar"
                                    element={<EditarResidente />}
                                />

                                <Route
                                    path="/modulos/:moduloId/habitacion/:habitacionId"
                                    element={<VerHabitacion />}
                                />
                                <Route
                                    path="/historico_residentes"
                                    element={<VerHistoricoResidentes />}
                                />
                                <Route
                                    path="/dashboard_residentes"
                                    element={<DashboardResidentes />}
                                />
                            </>
                        )}

                        {rol === "almacen" && (
                            <>
                                <Route
                                    path="/suministros"
                                    element={<Suministros />}
                                />

                                <Route
                                    path="/suministros/:id"
                                    element={<VerSuministro />}
                                />

                                <Route
                                    path="/packs"
                                    element={<Packs />}
                                />

                                <Route
                                    path="/packs/asignar/:packId"
                                    element={<AsignarPack />}
                                />

                                <Route
                                    path="/almacen"
                                    element={<Almacen />}
                                />

                                <Route
                                    path="/almacen/bajas"
                                    element={<BajasAlmacen />}
                                />

                                <Route
                                    path="/almacen/altas"
                                    element={<AltasAlmacen />}
                                />
                                <Route
                                    path="/dashboard_almacen"
                                    element={<DashboardAlmacen />}
                                />
                            </>
                        )}

                        {rol === "administracion" && (
                            <>
                                <Route
                                    path="/expedientes"
                                    element={<Expedientes />}
                                />
                            </>
                        )}

                        {rol !== null && (
                            <Route
                                path="*"
                                element={
                                    <h1>Página no encontrada</h1>
                                }
                            />
                        )}

                    </Route>

                </Routes>

            )}

        </Router>
    )
}

export default App