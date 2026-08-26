import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'
import Sidebar from './components/Sidebar'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import EditarPerfil from './pages/EditarPerfil'
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom'

function App() {

    const [autenticado, setAutenticado] = useState(
        localStorage.getItem('access') !== null
    )

    return (
        <Router>

            {!autenticado ? (

                <Routes>
                    <Route
                        path="/login"
                        element={<Login setAutenticado={setAutenticado} />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" />}
                    />

                </Routes>

            ) : (

                <div>
                    <Navbar />

                    <div className="main-container">
                        <Sidebar setAutenticado={setAutenticado} />

                        <main>
                            <Routes>

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
                                    path="*"
                                    element={
                                        <h1>Página no encontrada</h1>
                                    }
                                />

                            </Routes>
                        </main>
                    </div>
                </div>

            )}

        </Router>
    )
}

export default App