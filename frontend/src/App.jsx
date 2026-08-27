import { useState, useEffect } from 'react'
import './App.css'
import Layout from './Layout'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import EditarPerfil from './pages/EditarPerfil'
import CambiarContrasena from './pages/CambiarContrasena'
import RecuperarContrasena from './pages/RecuperarContrasena'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

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

function App() {

    const [autenticado, setAutenticado] = useState(
        tokenValido()
    )

    useEffect(() => {

        const token = localStorage.getItem('access')

        if (!token) {
            return
        }

        try {

            const payload = JSON.parse(atob(token.split('.')[1]))
            const tiempoExpiracion = payload.exp * 1000
            const tiempoActual = Date.now()

            // Aviso cuando queda 1 minuto
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

            // Expiración de la sesión
            const expiracion = setTimeout(() => {

                localStorage.removeItem('access')
                localStorage.removeItem('refresh')

                // Permitimos mostrar el aviso en una nueva sesión
                sessionStorage.removeItem('aviso_sesion_mostrado')

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
                            <Layout setAutenticado={setAutenticado} />
                        }
                    >

                        <Route
                            path="/"
                            element={
                                <h1>Página principal</h1>
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

                    </Route>

                    <Route
                        path="*"
                        element={
                            <h1>Página no encontrada</h1>
                        }
                    />

                </Routes>

            )}

        </Router>
    )
}

export default App