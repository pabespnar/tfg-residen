import { useEffect, useState } from 'react';
import axios from 'axios';

import './DashboardAdministracion.css';

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


function DashboardAdministracion() {

    const [dashboard, setDashboard] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const obtenerDashboard = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    'http://127.0.0.1:8000/api/dashboards/administracion/',
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
        pedidos,
        proveedores,
    } = dashboard;


    const datosPresupuesto = [
        {
            nombre: 'Gastado',
            valor: Number(
                resumen.presupuesto_gastado_expedientes
            ),
        },
        {
            nombre: 'Restante',
            valor: Number(
                resumen.presupuesto_restante_expedientes
            ),
        },
    ].filter(
        estado => estado.valor > 0
    );


    const datosPedidos = [
        {
            nombre: 'Con expediente',
            cantidad: pedidos.con_expediente,
        },
        {
            nombre: 'Generales',
            cantidad: pedidos.generales,
        },
    ];


    const datosExpedientes = [
        {
            nombre: 'Activos',
            cantidad: resumen.expedientes_activos,
        },
        {
            nombre: 'Inactivos',
            cantidad:
                resumen.expedientes_totales -
                resumen.expedientes_activos,
        },
    ].filter(
        estado => estado.cantidad > 0
    );


    const coloresPresupuesto = [
        '#1B5E20',
        '#81C784',
    ];


    return (

        <div className="dashboard-administracion">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Resumen de la situación actual de la administración
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
                        Presupuesto de expedientes
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.presupuesto_total_expedientes} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Presupuesto gastado
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.presupuesto_gastado_expedientes} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Presupuesto restante
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.presupuesto_restante_expedientes} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Expedientes activos
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.expedientes_activos}
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Pedidos totales
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.pedidos_totales}
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Proveedores
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.proveedores_totales}
                    </strong>

                </div>

            </section>


            <section className="dashboard-seccion">

                <div className="dashboard-seccion-header">

                    <h2>
                        Situación económica
                    </h2>

                </div>


                <div className="dashboard-graficos">

                    <div className="dashboard-grafico-card">

                        <div className="dashboard-grafico-header">

                            <h2>
                                Presupuesto de expedientes
                            </h2>

                        </div>


                        <div className="dashboard-grafico">

                            {datosPresupuesto.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <PieChart>

                                        <Pie
                                            data={datosPresupuesto}
                                            dataKey="valor"
                                            nameKey="nombre"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={95}
                                            innerRadius={55}
                                            paddingAngle={3}
                                            label
                                        >

                                            {datosPresupuesto.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`presupuesto-${index}`}
                                                        fill={
                                                            coloresPresupuesto[
                                                                index %
                                                                coloresPresupuesto.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip
                                            formatter={
                                                value =>
                                                    `${value} €`
                                            }
                                        />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            ) : (

                                <div className="dashboard-grafico-vacio">
                                    No hay presupuesto de expedientes.
                                </div>

                            )}

                        </div>

                    </div>


                    <div className="dashboard-grafico-card">

                        <div className="dashboard-grafico-header">

                            <h2>
                                Gasto corriente
                            </h2>

                        </div>


                        <div className="dashboard-estadisticas-almacen">

                            <div className="dashboard-estadistica">

                                <span>
                                    Gasto corriente disponible
                                </span>

                                <strong>
                                    RELLENAR
                                </strong>

                                <small>
                                    Importe disponible para pedidos generales
                                </small>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Pedidos
                </h2>

            </div>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Pedidos por tipo
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <BarChart
                                data={datosPedidos}
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
                                    name="Pedidos"
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
                            Estado de los pedidos
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        <div className="dashboard-estadistica">

                            <span>
                                Pedidos pendientes de recibir
                            </span>

                            <strong>
                                {pedidos.pendientes}
                            </strong>

                            <small>
                                Pedidos todavía no recibidos
                            </small>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Pedidos últimos 30 días
                            </span>

                            <strong>
                                {pedidos.ultimos_30_dias}
                            </strong>

                            <small>
                                Pedidos realizados recientemente
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Expedientes
                </h2>

            </div>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Estado de los expedientes
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosExpedientes.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie
                                        data={datosExpedientes}
                                        dataKey="cantidad"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={55}
                                        paddingAngle={3}
                                        label
                                    >

                                        {datosExpedientes.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`expediente-${index}`}
                                                    fill={
                                                        index === 0
                                                            ? '#1B5E20'
                                                            : '#BDBDBD'
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
                                No hay expedientes.
                            </div>

                        )}

                    </div>

                </div>

            </section>

        </div>
    );
}


export default DashboardAdministracion;