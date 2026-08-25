import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'
import Sidebar from './components/Sidebar'
import Perfil from './pages/Perfil'
import Login from './pages/Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {

    const [autenticado, setAutenticado] = useState(
        localStorage.getItem('access') !== null
    )

    if (!autenticado) {
        return <Login setAutenticado={setAutenticado} />
    }

    return (
        <Router>
            <div>
                <Navbar />

                <div className="main-container">
                    <Sidebar />

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
                                path="*"
                                element={
                                    <h1>Página no encontrada</h1>
                                }
                            />

                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    )
}

export default App