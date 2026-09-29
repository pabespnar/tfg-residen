import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './DashboardResidentes.css'
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from 'recharts'

function DashboardResidentes() {
    const [dashboard, setDashboard] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        const obtenerDashboard = async () => {
            try {
                const token = localStorage.getItem('access')

                const respuesta = await axios.get(
                    '/api/dashboards/residentes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                setDashboard(respuesta.data)
            } catch (error) {
                console.error(
                    'Error al obtener el dashboard:',
                    error
                )

                setError(
                    'No se ha podido cargar el dashboard.'
                )
            } finally {
                setCargando(false)
            }
        }

        obtenerDashboard()
    }, [])

    if (cargando) {
        return (
            <div className="dashboard-cargando">
                Cargando dashboard...
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard-error">
                {error}
            </div>
        )
    }

    if (!dashboard) {
        return null
    }

    const {
        resumen,
        residentes,
        habitaciones,
        modulos: modulosRecibidos,
        packs,
    } = dashboard

    const modulos = {
        ...(modulosRecibidos || {}),
        mas_ocupados: modulosRecibidos?.mas_ocupados || [],
        menos_ocupados: modulosRecibidos?.menos_ocupados || [],
        mas_poblados: modulosRecibidos?.mas_poblados || [],
        menos_poblados: modulosRecibidos?.menos_poblados || [],
    }

    const datosGenero = [
        {
            nombre: 'Masculino',
            valor: residentes.generos.M,
            codigo: 'M',
        },
        {
            nombre: 'Femenino',
            valor: residentes.generos.F,
            codigo: 'F',
        },
        {
            nombre: 'Otro',
            valor: residentes.generos.O,
            codigo: 'O',
        },
    ].filter((genero) => genero.valor > 0)

    const datosEdades = Object.entries(
        residentes.edades
    ).map(([intervalo, cantidad]) => ({
        intervalo,
        cantidad,
    }))

    const datosPaises = Object.entries(
        residentes.paises
    ).map(([pais, cantidad]) => ({
        pais,
        cantidad,
    }))

    const datosHabitaciones = [
        {
            nombre: 'Vacías',
            valor: habitaciones.vacias,
            filtro: 'sin_ocupacion',
        },
        {
            nombre: 'Ocupadas parcialmente',
            valor: habitaciones.parciales,
            filtro: 'parcial',
        },
        {
            nombre: 'Completas',
            valor: habitaciones.completas,
            filtro: 'completa',
        },
    ].filter((habitacion) => habitacion.valor > 0)

    const datosEstancias = Object.entries(
        residentes.estancias
    ).map(([intervalo, cantidad]) => ({
        intervalo,
        cantidad,
    }))

    const datosEvolucion = residentes.evolucion_mensual.map(
        (periodo) => ({
            mes: periodo.mes,
            altas: periodo.altas,
            bajas: periodo.bajas,
        })
    )

    const coloresGenero = [
        '#42A5F5',
        '#EC407A',
        '#9E9E9E',
    ]

    const coloresHabitaciones = [
        '#81C784',
        '#FBC02D',
        '#E53935',
    ]

    const formatearMes = (mes) => {
        const meses = {
            '01': 'Ene',
            '02': 'Feb',
            '03': 'Mar',
            '04': 'Abr',
            '05': 'May',
            '06': 'Jun',
            '07': 'Jul',
            '08': 'Ago',
            '09': 'Sep',
            '10': 'Oct',
            '11': 'Nov',
            '12': 'Dic',
        }

        const numeroMes = mes.split('-')[1]

        return meses[numeroMes] || mes
    }

    const obtenerFechaHace30Dias = () => {
        const hoy = new Date()

        const fechaHasta =
            hoy.toISOString().split('T')[0]

        const fechaDesde = new Date(hoy)

        fechaDesde.setDate(
            fechaDesde.getDate() - 30
        )

        const fechaDesdeFormateada =
            fechaDesde.toISOString().split('T')[0]

        return {
            fechaDesde: fechaDesdeFormateada,
            fechaHasta,
        }
    }

    const navegarGenero = (datos) => {
        if (!datos || !datos.codigo) {
            return
        }

        navigate('/residentes', {
            state: {
                genero: datos.codigo,
            },
        })
    }

    const navegarEdad = (datos) => {
        if (!datos || !datos.intervalo) {
            return
        }

        navigate('/residentes', {
            state: {
                edad: datos.intervalo,
            },
        })
    }

    const navegarPais = (datos) => {
        if (!datos || !datos.pais) {
            return
        }

        navigate('/residentes', {
            state: {
                pais: datos.pais,
            },
        })
    }

    const navegarAltas = () => {
        const fechas = obtenerFechaHace30Dias()

        navigate('/residentes', {
            state: {
                fechaDesde: fechas.fechaDesde,
                fechaHasta: fechas.fechaHasta,
            },
        })
    }

    const navegarBajas = () => {
        const fechas = obtenerFechaHace30Dias()

        navigate('/historico_residentes', {
            state: {
                fechaBajaDesde: fechas.fechaDesde,
                fechaBajaHasta: fechas.fechaHasta,
            },
        })
    }

    const navegarEstanciaMedia = () => {
        navigate('/historico_residentes')
    }

    const navegarEstancia = (datos) => {
        if (!datos || !datos.intervalo) {
            return
        }

        navigate('/historico_residentes', {
            state: {
                estancia: datos.intervalo,
            },
        })
    }

    const navegarEstadoHabitacion = (datos) => {
        if (!datos || !datos.filtro) {
            return
        }

        navigate('/modulos', {
            state: {
                filtroOcupacionHabitaciones: datos.filtro,
            },
        })
    }

    const navegarModulo = (orden) => {
        if (!orden) {
            return
        }

        navigate('/modulos', {
            state: {
                orden,
            },
        })
    }

    const navegarPack = (orden) => {
        if (!orden) {
            return
        }

        navigate('/suministrosResidentes', {
            state: {
                orden,
            },
        })
    }

    return (
        <div className="dashboard-residentes">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Resumen de la situación actual del centro
                    </p>
                </div>
            </div>

            <div className="dashboard-seccion-header">
                <h2>
                    General
                </h2>
            </div>

            <section className="dashboard-resumen">
                <div className="dashboard-card">
                    <span className="dashboard-card-titulo">
                        Residentes actuales
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.residentes_actuales}
                    </strong>
                </div>

                <div className="dashboard-card">
                    <span className="dashboard-card-titulo">
                        Capacidad total
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.capacidad_total}
                    </strong>

                    <span className="dashboard-card-unidad">
                        plazas
                    </span>
                </div>

                <div className="dashboard-card">
                    <span className="dashboard-card-titulo">
                        Ocupación
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.ocupacion_porcentaje}%
                    </strong>
                </div>

                <div className="dashboard-card">
                    <span className="dashboard-card-titulo">
                        Plazas libres
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.plazas_libres}
                    </strong>
                </div>
            </section>

            <section className="dashboard-seccion dashboard-seccion-movimientos">
                <div className="dashboard-seccion-header">
                    <h2>
                        Movimientos de residentes
                    </h2>
                </div>

                <div className="dashboard-resumen dashboard-resumen-secundario">
                    <div
                        className="dashboard-card"
                        onClick={navegarAltas}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="dashboard-card-titulo">
                            Altas último mes
                        </span>

                        <strong className="dashboard-card-valor">
                            {residentes.altas_ultimos_30_dias}
                        </strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={navegarBajas}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="dashboard-card-titulo">
                            Bajas último mes
                        </span>

                        <strong className="dashboard-card-valor">
                            {residentes.bajas_ultimos_30_dias}
                        </strong>
                    </div>

                    <div
                        className="dashboard-card"
                        onClick={navegarEstanciaMedia}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="dashboard-card-titulo">
                            Estancia media
                        </span>

                        <strong className="dashboard-card-valor">
                            {residentes.estancia_media_dias}
                        </strong>

                        <span className="dashboard-card-unidad">
                            días
                        </span>
                    </div>
                </div>

                <div className="dashboard-grafico-card dashboard-grafico-card-ancho dashboard-grafico-movimientos">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Altas y bajas de los últimos 12 meses
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosEvolucion.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >
                                <LineChart
                                    data={datosEvolucion}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="mes"
                                        tickFormatter={formatearMes}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip
                                        labelFormatter={formatearMes}
                                    />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="altas"
                                        name="Altas"
                                        stroke="#1B5E20"
                                        strokeWidth={2}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="bajas"
                                        name="Bajas"
                                        stroke="#E53935"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay movimientos registrados.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="dashboard-seccion-header">
                <h2>
                    Estadísticas de residentes
                </h2>
            </div>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Distribución por género
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosGenero.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <PieChart>
                                    <Pie
                                        data={datosGenero}
                                        dataKey="valor"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={55}
                                        paddingAngle={3}
                                        label={({ nombre, valor }) =>
                                            `${nombre} ${valor}%`
                                        }
                                        onClick={navegarGenero}
                                    >
                                        {datosGenero.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`genero-${index}`}
                                                    fill={
                                                        coloresGenero[
                                                            index %
                                                            coloresGenero.length
                                                        ]
                                                    }
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value) =>
                                            `${value}%`
                                        }
                                    />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay residentes actuales.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Distribución por edades
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosEdades.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart
                                    data={datosEdades}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="intervalo"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Residentes"
                                        fill="#1B5E20"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        onClick={(datos) => {
                                            navegarEdad(datos)
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay residentes actuales.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Distribución por país
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosPaises.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart
                                    data={datosPaises}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 20,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="pais"
                                        width={100}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Residentes"
                                        fill="#1B5E20"
                                        radius={[
                                            0,
                                            5,
                                            5,
                                            0,
                                        ]}
                                        onClick={navegarPais}
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay países registrados.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Duración de las estancias
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosEstancias.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart
                                    data={datosEstancias}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="intervalo"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Residentes"
                                        fill="#1B5E20"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        onClick={(datos) => {
                                            navegarEstancia(datos)
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay estancias registradas.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="dashboard-seccion-header">
                <h2>
                    Habitaciones
                </h2>
            </div>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Estado de las habitaciones
                        </h2>
                    </div>

                    <div className="dashboard-grafico">
                        {datosHabitaciones.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <PieChart>
                                    <Pie
                                        data={datosHabitaciones}
                                        dataKey="valor"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={55}
                                        paddingAngle={3}
                                        label
                                        onClick={navegarEstadoHabitacion}
                                    >
                                        {datosHabitaciones.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`habitacion-${index}`}
                                                    fill={
                                                        coloresHabitaciones[
                                                            index %
                                                            coloresHabitaciones.length
                                                        ]
                                                    }
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay habitaciones.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Resumen de habitaciones
                        </h2>
                    </div>

                    <div className="dashboard-estadisticas-habitaciones">
                        <div
                            className="dashboard-estadistica"
                            onClick={() =>
                                navegarEstadoHabitacion({
                                    filtro: 'todos',
                                })
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <span>
                                Total
                            </span>

                            <strong>
                                {habitaciones.totales}
                            </strong>
                        </div>

                        <div
                            className="dashboard-estadistica"
                            onClick={() =>
                                navegarEstadoHabitacion({
                                    filtro: 'sin_ocupacion',
                                })
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <span>
                                Vacías
                            </span>

                            <strong>
                                {habitaciones.vacias}
                            </strong>
                        </div>

                        <div
                            className="dashboard-estadistica"
                            onClick={() =>
                                navegarEstadoHabitacion({
                                    filtro: 'parcial',
                                })
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <span>
                                Parcialmente ocupadas
                            </span>

                            <strong>
                                {habitaciones.parciales}
                            </strong>
                        </div>

                        <div
                            className="dashboard-estadistica"
                            onClick={() =>
                                navegarEstadoHabitacion({
                                    filtro: 'completa',
                                })
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <span>
                                Completas
                            </span>

                            <strong>
                                {habitaciones.completas}
                            </strong>
                        </div>
                    </div>
                </div>
            </section>

            <div className="dashboard-seccion-header">
                <h2>
                    Situación de los módulos
                </h2>
            </div>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Módulos más ocupados
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {modulos.mas_ocupados.length > 0 ? (
                            modulos.mas_ocupados.map(
                                (modulo) => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarModulo(
                                                'ocupacion_desc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {modulo.nombre}
                                            </strong>

                                            <span>
                                                {modulo.residentes} residentes
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <span>
                                                {modulo.capacidad} plazas
                                            </span>

                                            <strong>
                                                {modulo.ocupacion_porcentaje}%
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay módulos.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Módulos menos ocupados
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {modulos.menos_ocupados.length > 0 ? (
                            modulos.menos_ocupados.map(
                                (modulo) => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarModulo(
                                                'ocupacion_asc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {modulo.nombre}
                                            </strong>

                                            <span>
                                                {modulo.residentes} residentes
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <span>
                                                {modulo.capacidad} plazas
                                            </span>

                                            <strong>
                                                {modulo.ocupacion_porcentaje}%
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay módulos.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Módulos con más residentes
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {modulos.mas_poblados.length > 0 ? (
                            modulos.mas_poblados.map(
                                (modulo) => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarModulo(
                                                'residentes_desc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {modulo.nombre}
                                            </strong>

                                            <span>
                                                {modulo.ocupacion_porcentaje}% ocupación
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <span>
                                                {modulo.capacidad} plazas
                                            </span>

                                            <strong>
                                                {modulo.residentes} residentes
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay módulos.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Módulos con menos residentes
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {modulos.menos_poblados.length > 0 ? (
                            modulos.menos_poblados.map(
                                (modulo) => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarModulo(
                                                'residentes_asc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {modulo.nombre}
                                            </strong>

                                            <span>
                                                {modulo.ocupacion_porcentaje}% ocupación
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <span>
                                                {modulo.capacidad} plazas
                                            </span>

                                            <strong>
                                                {modulo.residentes} residentes
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay módulos.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="dashboard-seccion-header">
                <h2>
                    Packs
                </h2>
            </div>

            <section className="dashboard-graficos">
                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Packs más entregados
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {packs?.mas_entregados?.length > 0 ? (
                            packs.mas_entregados.map(
                                (pack) => (
                                    <div
                                        key={pack.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarPack(
                                                'porcentaje_desc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {pack.nombre}
                                            </strong>

                                            <span>
                                                {pack.entregas} entregas
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <strong>
                                                {pack.porcentaje}%
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay entregas de packs.
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-grafico-card">
                    <div className="dashboard-grafico-header">
                        <h2>
                            Packs menos entregados
                        </h2>
                    </div>

                    <div className="dashboard-modulos-lista">
                        {packs?.menos_entregados?.length > 0 ? (
                            packs.menos_entregados.map(
                                (pack) => (
                                    <div
                                        key={pack.id}
                                        className="dashboard-modulo"
                                        onClick={() =>
                                            navegarPack(
                                                'porcentaje_asc'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="dashboard-modulo-info">
                                            <strong>
                                                {pack.nombre}
                                            </strong>

                                            <span>
                                                {pack.entregas} entregas
                                            </span>
                                        </div>

                                        <div className="dashboard-modulo-datos">
                                            <strong>
                                                {pack.porcentaje}%
                                            </strong>
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="dashboard-grafico-vacio">
                                No hay entregas de packs.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default DashboardResidentes