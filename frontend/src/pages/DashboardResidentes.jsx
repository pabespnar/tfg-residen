import { useEffect, useState } from 'react';
import axios from 'axios';

import './DashboardResidentes.css';

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
} from 'recharts';


function DashboardResidentes() {

    const [dashboard, setDashboard] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const obtenerDashboard = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/dashboards/residentes/',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setDashboard(respuesta.data);

            } catch (error) {

                console.error(
                    'Error al obtener el dashboard:',
                    error
                );

                setError(
                    'No se ha podido cargar el dashboard.'
                );

            } finally {

                setCargando(false);

            }
        };

        obtenerDashboard();

    }, []);


    if (cargando) {
        return (
            <div className="dashboard-cargando">
                Cargando dashboard...
            </div>
        );
    }


    if (error) {
        return (
            <div className="dashboard-error">
                {error}
            </div>
        );
    }


    if (!dashboard) {
        return null;
    }


    const {
        resumen,
        residentes,
        habitaciones,
        modulos,
    } = dashboard;


    const datosGenero = [
        {
            nombre: 'Masculino',
            valor: residentes.generos.M,
        },
        {
            nombre: 'Femenino',
            valor: residentes.generos.F,
        },
        {
            nombre: 'Otro',
            valor: residentes.generos.O,
        },
    ].filter(genero => genero.valor > 0);


    const datosEdades = Object.entries(
        residentes.edades
    ).map(([intervalo, cantidad]) => ({
        intervalo,
        cantidad,
    }));


    const datosPaises = Object.entries(
        residentes.paises
    ).map(([pais, cantidad]) => ({
        pais,
        cantidad,
    }));


    const datosHabitaciones = [
        {
            nombre: 'Vacías',
            valor: habitaciones.vacias,
        },
        {
            nombre: 'Ocupadas parcialmente',
            valor: habitaciones.parciales,
        },
        {
            nombre: 'Completas',
            valor: habitaciones.completas,
        },
    ].filter(habitacion => habitacion.valor > 0);


    const datosEstancias = Object.entries(
        residentes.estancias
    ).map(([intervalo, cantidad]) => ({
        intervalo,
        cantidad,
    }));


    const datosEvolucion = residentes.evolucion_mensual.map(
        periodo => ({
            mes: periodo.mes,
            altas: periodo.altas,
            bajas: periodo.bajas,
        })
    );


    const coloresGenero = [
        '#42A5F5',
        '#EC407A',
        '#9E9E9E',
    ];


    const coloresHabitaciones = [
        '#81C784',
        '#FBC02D',
        '#E53935',
    ];


    const formatearMes = mes => {

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
        };

        const numeroMes = mes.split('-')[1];

        return meses[numeroMes] || mes;
    };


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

                    <div className="dashboard-card">

                        <span className="dashboard-card-titulo">
                            Altas último mes
                        </span>

                        <strong className="dashboard-card-valor">
                            {residentes.altas_ultimos_30_dias}
                        </strong>

                    </div>


                    <div className="dashboard-card">

                        <span className="dashboard-card-titulo">
                            Bajas último mes
                        </span>

                        <strong className="dashboard-card-valor">
                            {residentes.bajas_ultimos_30_dias}
                        </strong>

                    </div>


                    <div className="dashboard-card">

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

                        <div className="dashboard-estadistica">

                            <span>
                                Total
                            </span>

                            <strong>
                                {habitaciones.totales}
                            </strong>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Vacías
                            </span>

                            <strong>
                                {habitaciones.vacias}
                            </strong>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Parcialmente ocupadas
                            </span>

                            <strong>
                                {habitaciones.parciales}
                            </strong>

                        </div>


                        <div className="dashboard-estadistica">

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
                            Módulos más poblados
                        </h2>

                    </div>


                    <div className="dashboard-modulos-lista">

                        {modulos.mas_poblados.length > 0 ? (

                            modulos.mas_poblados.map(
                                modulo => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
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
                            Módulos menos poblados
                        </h2>

                    </div>


                    <div className="dashboard-modulos-lista">

                        {modulos.menos_poblados.length > 0 ? (

                            modulos.menos_poblados.map(
                                modulo => (
                                    <div
                                        key={modulo.id}
                                        className="dashboard-modulo"
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

        </div>
    );
}


export default DashboardResidentes;