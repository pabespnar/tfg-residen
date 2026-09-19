import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';


function DashboardAdministracion() {

    const navigate = useNavigate();



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
        expedientes,
        pedidos,
        proveedores,
        suministros,
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
    ].filter(
        tipo => tipo.cantidad > 0
    );


    const datosExpedientes = [
        {
            nombre: 'Activos',
            cantidad: expedientes.activos,
        },
        {
            nombre: 'Inactivos',
            cantidad: expedientes.inactivos,
        },
    ].filter(
        estado => estado.cantidad > 0
    );


    const datosProveedores = proveedores.principales
        ? proveedores.principales.map(
            proveedor => ({
                nombre: proveedor.nombre,
                importe: Number(proveedor.importe),
            })
        )
        : [];


    const datosSuministros = suministros.principales
        ? suministros.principales.map(
            suministro => ({
                nombre: suministro.nombre,
                importe: Number(suministro.importe),
            })
        )
        : [];


    const evolucionPedidos = pedidos.evolucion
        ? pedidos.evolucion.map(
            periodo => ({
                ...periodo,
                mes: periodo.mes.substring(5),
            })
        )
        : [];


    const evolucionImporteGenerales =
        pedidos.evolucion_importe_generales
            ? pedidos.evolucion_importe_generales.map(
                periodo => ({
                    ...periodo,
                    importe: Number(periodo.importe),
                    mes: periodo.mes.substring(5),
                })
            )
            : [];


    const coloresPresupuesto = [
        '#1B5E20',
        '#81C784',
    ];


    const coloresExpedientes = [
        '#1B5E20',
        '#BDBDBD',
    ];


    const coloresPedidos = [
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
                        {Number(
                            resumen.presupuesto_total_expedientes
                        ).toLocaleString(
                            'es-ES',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Presupuesto gastado
                    </span>

                    <strong className="dashboard-card-valor">
                        {Number(
                            resumen.presupuesto_gastado_expedientes
                        ).toLocaleString(
                            'es-ES',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Presupuesto restante
                    </span>

                    <strong className="dashboard-card-valor">
                        {Number(
                            resumen.presupuesto_restante_expedientes
                        ).toLocaleString(
                            'es-ES',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )} €
                    </strong>

                </div>


                <div className="dashboard-card">

                    <span className="dashboard-card-titulo">
                        Presupuesto gasto corriente
                    </span>

                    <strong className="dashboard-card-valor">
                        {Number(
                            resumen.presupuesto_gasto_corriente
                        ).toLocaleString(
                            'es-ES',
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )} €
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
                                                    `${Number(value).toLocaleString(
                                                        'es-ES',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )} €`
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
                                    Presupuesto de referencia
                                </span>

                                <strong>
                                    {Number(
                                        resumen.presupuesto_referencia
                                    ).toLocaleString(
                                        'es-ES',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )} €
                                </strong>

                                <small>
                                    Presupuesto inicial de gasto corriente
                                </small>

                            </div>


                            <div className="dashboard-estadistica">

                                <span>
                                    Presupuesto gastado
                                </span>

                                <strong>
                                    {Number(
                                        resumen.presupuesto_gastado_gasto_corriente
                                    ).toLocaleString(
                                        'es-ES',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )} €
                                </strong>

                                <small>
                                    Importe utilizado del presupuesto de gasto corriente
                                </small>

                            </div>


                            <div className="dashboard-estadistica">

                                <span>
                                    Presupuesto disponible
                                </span>

                                <strong>
                                    {Number(
                                        resumen.presupuesto_gasto_corriente
                                    ).toLocaleString(
                                        'es-ES',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )} €
                                </strong>

                                <small>
                                    Importe actualmente disponible
                                </small>

                            </div>


                            <div className="dashboard-estadistica">

                                <span>
                                    Porcentaje gastado
                                </span>

                                <strong>
                                    {Number(
                                        resumen.porcentaje_gastado_gasto_corriente
                                    ).toLocaleString(
                                        'es-ES',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )} %
                                </strong>

                                <small>
                                    Porcentaje utilizado del presupuesto de referencia
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
                            Distribución de pedidos
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosPedidos.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie
                                        data={datosPedidos}
                                        dataKey="cantidad"
                                        nameKey="nombre"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={55}
                                        paddingAngle={3}
                                        label
                                    >

                                        {datosPedidos.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`pedido-${index}`}
                                                    fill={
                                                        coloresPedidos[
                                                            index %
                                                            coloresPedidos.length
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            '/pedidos',
                                                            {
                                                                state: {
                                                                    tipoPedido:
                                                                        entry.nombre === 'Con expediente'
                                                                            ? 'EXPEDIENTE'
                                                                            : 'GENERAL'
                                                                }
                                                            }
                                                        )
                                                    }
                                                    style={{
                                                        cursor: 'pointer'
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
                                No hay pedidos.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Estado de los pedidos
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        <div
                            className="dashboard-estadistica"
                            onClick={() =>
                                navigate(
                                    '/pedidos',
                                    {
                                        state: {
                                            estadoFiltro: 'pendiente'
                                        }
                                    }
                                )
                            }
                            style={{
                                cursor: 'pointer'
                            }}
                        >

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


                        <div className="dashboard-estadistica">

                            <span>
                                Importe de pedidos generales
                            </span>

                            <strong>
                                {Number(
                                    pedidos.importe_generales
                                ).toLocaleString(
                                    'es-ES',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )} €
                            </strong>

                            <small>
                                Importe acumulado de los pedidos generales
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card dashboard-grafico-card-ancho">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Evolución mensual de pedidos
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {evolucionPedidos.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <LineChart
                                    data={evolucionPedidos}
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
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Legend />

                                    <Line
                                        type="monotone"
                                        dataKey="con_expediente"
                                        name="Con expediente"
                                        stroke="#1B5E20"
                                        strokeWidth={2}
                                        dot
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="generales"
                                        name="Generales"
                                        stroke="#81C784"
                                        strokeWidth={2}
                                        dot
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay datos de pedidos.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card dashboard-grafico-card-ancho">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Evolución del importe de pedidos generales
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {evolucionImporteGenerales.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <LineChart
                                    data={evolucionImporteGenerales}
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
                                    />

                                    <YAxis />

                                    <Tooltip
                                        formatter={
                                            value =>
                                                `${Number(value).toLocaleString(
                                                    'es-ES',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )} €`
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="importe"
                                        name="Importe"
                                        stroke="#1B5E20"
                                        strokeWidth={2}
                                        dot
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay datos de pedidos generales.
                            </div>

                        )}

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
                                                        coloresExpedientes[
                                                            index %
                                                            coloresExpedientes.length
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            '/expedientes',
                                                            {
                                                                state: {
                                                                    estado:
                                                                        entry.nombre === 'Activos'
                                                                            ? 'activo'
                                                                            : 'inactivo'
                                                                }
                                                            }
                                                        )
                                                    }
                                                    style={{
                                                        cursor: 'pointer'
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
                                No hay expedientes.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Situación de los expedientes
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        <div className="dashboard-estadistica">

                            <span>
                                Expedientes activos
                            </span>

                            <strong>
                                {expedientes.activos}
                            </strong>

                            <small>
                                Expedientes actualmente en curso
                            </small>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Expedientes inactivos
                            </span>

                            <strong>
                                {expedientes.inactivos}
                            </strong>

                            <small>
                                Expedientes fuera de su periodo activo
                            </small>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Presupuesto gastado
                            </span>

                            <strong>
                                {Number(
                                    expedientes.presupuesto_gastado
                                ).toLocaleString(
                                    'es-ES',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )} €
                            </strong>

                            <small>
                                Importe utilizado en los expedientes
                            </small>

                        </div>


                        <div className="dashboard-estadistica">

                            <span>
                                Presupuesto restante
                            </span>

                            <strong>
                                {Number(
                                    expedientes.presupuesto_restante
                                ).toLocaleString(
                                    'es-ES',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )} €
                            </strong>

                            <small>
                                Importe disponible en los expedientes
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Mayores importes
                </h2>

            </div>


            <section className="dashboard-graficos">

                <div
                    className="dashboard-grafico-card"
                    onClick={() =>
                        navigate(
                            '/proveedores',
                            {
                                state: {
                                    orden: 'importe_desc'
                                }
                            }
                        )
                    }                    
                    style={{
                        cursor: 'pointer'
                    }}
                >

                    <div className="dashboard-grafico-header">

                        <h2>
                            Proveedores con mayor importe
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosProveedores.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosProveedores}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 20,
                                        bottom: 10,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="nombre"
                                        width={120}
                                    />

                                    <Tooltip
                                        formatter={
                                            value =>
                                                `${Number(value).toLocaleString(
                                                    'es-ES',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )} €`
                                        }
                                    />

                                    <Bar
                                        dataKey="importe"
                                        name="Importe"
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
                                No hay pedidos asociados a proveedores.
                            </div>

                        )}

                    </div>

                </div>


                <div
                    className="dashboard-grafico-card"
                    onClick={() =>
                        navigate(
                            '/suministrosAdministracion',
                            {
                                state: {
                                    orden: 'importe_desc'
                                }
                            }
                        )
                    }           
                    style={{
                        cursor: 'pointer'
                    }}
                >

                    <div className="dashboard-grafico-header">

                        <h2>
                            Suministros con mayor importe
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosSuministros.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosSuministros}
                                    layout="vertical"
                                    margin={{
                                        top: 10,
                                        right: 30,
                                        left: 20,
                                        bottom: 10,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="nombre"
                                        width={120}
                                    />

                                    <Tooltip
                                        formatter={
                                            value =>
                                                `${Number(value).toLocaleString(
                                                    'es-ES',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )} €`
                                        }
                                    />

                                    <Bar
                                        dataKey="importe"
                                        name="Importe"
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
                                No hay pedidos asociados a suministros.
                            </div>

                        )}

                    </div>

                </div>

            </section>


        </div>
    );
}


export default DashboardAdministracion;