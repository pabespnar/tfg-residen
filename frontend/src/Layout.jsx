import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function Layout({ setAutenticado }) {
    return (
        <div>
            <Navbar />

            <div className="main-container">
                <Sidebar setAutenticado={setAutenticado} />

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout