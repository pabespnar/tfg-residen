import { useEffect, useState } from 'react';
import axios from 'axios';

import './DashboardAlmacen.css';

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
} from 'recharts';


function DashboardAlmacen() {

    const [dashboard, setDashboard] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const obtenerDashboard = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/dashboards/almacen/',
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
        actividad,
        stock,
        bajas,
        packs,
    } = dashboard;


    const datosStock = [
        {
            nombre: 'Sin stock',
            valor: stock.sin_stock,
        },
        {
            nombre: 'Bajo mínimo',
            valor: stock.bajo_minimo,
        },
        {
            nombre: 'Correcto',
            valor: stock.correcto,
        },
    ].filter(estado => estado.valor > 0);


    const datosActividad = [
        {
            nombre: 'Altas',
            cantidad: actividad.altas_ultimos_30_dias,
        },
        {
            nombre: 'Bajas',
            cantidad: actividad.bajas_ultimos_30_dias,
        },
        {
            nombre: 'Packs entregados',
            cantidad: actividad.entregas_ultimos_30_dias,
        },
    ];


    const datosServicios = Object.entries(
        bajas.por_servicio
    ).map(([servicio, cantidad]) => ({
        servicio,
        cantidad,
    })).filter(servicio => servicio.cantidad > 0);


    const datosPacks = Object.entries(
        packs.entregas_por_pack
    ).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
    }));


    const coloresStock = [
        '#E53935',
        '#FBC02D',
        '#81C784',
    ];


    return (

        <div className="dashboard-almacen">

            <div className="dashboard-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Resumen de la situación actual del almacén
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
                        Tipos de suministros
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_totales}
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Categorías de clasificación
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.categorias_totales}
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Suministros bajo mínimo
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_bajo_minimo}
                    </strong>

                </div>

                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Suministros sin stock
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_sin_stock}
                    </strong>

                </div>


            </section>


            <section className="dashboard-seccion">

                <div className="dashboard-seccion-header">

                    <h2>
                        Actividad del almacén
                    </h2>

                    <span>
                        Últimos 30 días
                    </span>

                </div>


                <div className="dashboard-graficos">

                    <div className="dashboard-grafico-card">

                        <div className="dashboard-grafico-header">

                            <h2>
                                Movimientos
                            </h2>

                        </div>


                        <div className="dashboard-grafico">

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosActividad}
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
                                        dataKey="nombre"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Cantidad"
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

                        </div>

                    </div>


                    <div className="dashboard-grafico-card">

                        <div className="dashboard-grafico-header">

                            <h2>
                                Estado del stock
                            </h2>

                        </div>


                        <div className="dashboard-grafico">

                            {datosStock.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <PieChart>

                                        <Pie
                                            data={datosStock}
                                            dataKey="valor"
                                            nameKey="nombre"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={95}
                                            innerRadius={55}
                                            paddingAngle={3}
                                            label
                                        >

                                            {datosStock.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`stock-${index}`}
                                                        fill={
                                                            coloresStock[
                                                                index %
                                                                coloresStock.length
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
                                    No hay suministros.
                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Stock
                </h2>

            </div>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Suministros bajo mínimo
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        {stock.suministros_bajo_minimo.length > 0 ? (

                            stock.suministros_bajo_minimo.map(
                                suministro => (

                                    <div
                                        className="dashboard-estadistica"
                                        key={suministro.id}
                                    >

                                        <span>
                                            {suministro.nombre}
                                        </span>

                                        <strong>
                                            {suministro.stock}
                                            {' '}
                                            {suministro.unidad}
                                        </strong>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay suministros bajo mínimo.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Bajas por servicio
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosServicios.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosServicios}
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
                                        dataKey="servicio"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Bajas"
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
                                No hay bajas por servicio.
                            </div>

                        )}

                    </div>

                </div>

            </section>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Packs más entregados
                        </h2>

                        <span>
                            Últimos 30 días
                        </span>

                    </div>


                    <div className="dashboard-grafico">

                        {datosPacks.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosPacks}
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
                                        dataKey="nombre"
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Entregas"
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
                                No hay entregas de packs.
                            </div>

                        )}

                    </div>

                </div>

            </section>

        </div>
    );
}


export default DashboardAlmacen;