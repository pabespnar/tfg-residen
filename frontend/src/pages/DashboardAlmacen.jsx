import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';


function DashboardAlmacen() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const obtenerDashboard = async () => {

            try {

                const token = localStorage.getItem('access');

                const respuesta = await axios.get(
                    '/api/dashboards/almacen/',
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


    const navegarSuministros = () => {
        navigate('/suministros');
    };


    const navegarSuministrosSinStock = () => {
        navigate('/suministros', {
            state: {
                estadoStock: 'sin_stock',
            },
        });
    };


    const navegarSuministrosBajoMinimo = () => {
        navigate('/suministros', {
            state: {
                estadoStock: 'stock_bajo',
            },
        });
    };


    const navegarSuministrosStockNormal = () => {
        navigate('/suministros', {
            state: {
                estadoStock: 'stock_normal',
            },
        });
    };


    const navegarPacks = () => {
        navigate('/packs');
    };


    const navegarPacksMasEntregados = () => {
        navigate('/packs', {
            state: {
                orden: 'residentes_desc',
            },
        });
    };


    const navegarNuevaAlta = () => {
        navigate('/almacen', {
            state: {
                abrirNuevaAlta: true,
            },
        });
    };


    const navegarBajasPorServicio = (servicio) => {
        navigate('/almacen/bajas', {
            state: {
                servicio,
            },
        });
    };


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
        entradas,
        bajas,
        packs,
        consumo,
    } = dashboard;


    const datosStock = [
        {
            nombre: 'Sin stock',
            valor: stock.sin_stock,
            estado: 'sin_stock',
        },
        {
            nombre: 'Bajo mínimo',
            valor: stock.bajo_minimo,
            estado: 'stock_bajo',
        },
        {
            nombre: 'Correcto',
            valor: stock.correcto,
            estado: 'stock_normal',
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


    const datosPedidos = [
        {
            nombre: 'Correctos',
            cantidad: entradas.pedidos_correctos,
        },
        {
            nombre: 'Incorrectos',
            cantidad: entradas.pedidos_incorrectos,
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


    const datosSuministrosConsumidos =
        consumo.suministros_mas_consumidos.map(
            suministro => ({
                nombre: suministro.nombre,
                cantidad: suministro.cantidad,
                unidad: suministro.unidad,
            })
        );


    const datosSuministrosEntradas =
        entradas.suministros_mas_entradas.map(
            suministro => ({
                nombre: suministro.nombre,
                cantidad: suministro.cantidad,
                unidad: suministro.unidad,
            })
        );


    const datosCategorias = Object.entries(
        consumo.por_categoria
    ).map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
    }));


    const datosCategoriasEntradas = Object.entries(
        entradas.por_categoria
    ).map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
    }));


    const datosEvolucionConsumo =
        consumo.evolucion_principales.map(
            periodo => {

                const datosMes = {
                    mes: periodo.mes,
                };

                periodo.suministros.forEach(
                    (suministro, index) => {
                        datosMes[`suministro_${index}`] =
                            suministro.cantidad;
                    }
                );

                return datosMes;
            }
        );


    const nombresSuministros =
        consumo.suministros_mas_consumidos.map(
            (suministro, index) => ({
                dataKey: `suministro_${index}`,
                nombre: suministro.nombre,
                unidad: suministro.unidad,
            })
        );


    const datosEvolucionEntradas =
        entradas.evolucion_entradas_principales.map(
            periodo => {

                const datosMes = {
                    mes: periodo.mes,
                };

                periodo.suministros.forEach(
                    (suministro, index) => {
                        datosMes[`suministro_entrada_${index}`] =
                            suministro.cantidad;
                    }
                );

                return datosMes;
            }
        );


    const nombresSuministrosEntradas =
        entradas.suministros_mas_entradas.map(
            (suministro, index) => ({
                dataKey: `suministro_entrada_${index}`,
                nombre: suministro.nombre,
                unidad: suministro.unidad,
            })
        );


    const formatearMes = mes => {
        const [año, numeroMes] = mes.split('-');

        const meses = [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic',
        ];

        return `${meses[
            parseInt(numeroMes, 10) - 1
        ]} ${año}`;
    };


    const coloresStock = [
        '#E53935',
        '#FBC02D',
        '#81C784',
    ];


    return (

        <div className="dashboard-almacen">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

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

                <div
                    className="dashboard-card"
                    onClick={navegarSuministros}
                >

                    <span className="dashboard-card-titulo">
                        Suministros
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_totales}
                    </strong>

                </div>


                <div
                    className="dashboard-card"
                    onClick={navegarSuministrosSinStock}
                >

                    <span className="dashboard-card-titulo">
                        Suministros sin stock
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_sin_stock}
                    </strong>

                </div>


                <div
                    className="dashboard-card"
                    onClick={navegarSuministrosBajoMinimo}
                >

                    <span className="dashboard-card-titulo">
                        Suministros bajo mínimo
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.suministros_bajo_minimo}
                    </strong>

                </div>


                <div
                    className="dashboard-card"
                    onClick={navegarPacks}
                >

                    <span className="dashboard-card-titulo">
                        Packs disponibles
                    </span>

                    <strong className="dashboard-card-valor">
                        {resumen.packs_totales}
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
                                Actividad
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
                                                    onClick={() => {
                                                        if (
                                                            entry.estado ===
                                                            'sin_stock'
                                                        ) {
                                                            navegarSuministrosSinStock();
                                                        }

                                                        if (
                                                            entry.estado ===
                                                            'stock_bajo'
                                                        ) {
                                                            navegarSuministrosBajoMinimo();
                                                        }

                                                        if (
                                                            entry.estado ===
                                                            'stock_normal'
                                                        ) {
                                                            navegarSuministrosStockNormal();
                                                        }
                                                    }}
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
                                No hay suministros.
                            </div>

                        )}

                    </div>

                </div>


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
                                        onClick={
                                            navegarSuministrosBajoMinimo
                                        }
                                    >

                                        <span>
                                            {suministro.nombre}
                                        </span>

                                        <strong>
                                            {suministro.stock}
                                            {' '}
                                            {suministro.unidad}
                                        </strong>

                                        <small>
                                            Mínimo: {suministro.stock_minimo}
                                            {' '}
                                            {suministro.unidad}
                                        </small>

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
                            Suministros sin stock
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        {stock.suministros_sin_stock.length > 0 ? (

                            stock.suministros_sin_stock.map(
                                suministro => (

                                    <div
                                        className="dashboard-estadistica"
                                        key={suministro.id}
                                        onClick={
                                            navegarSuministrosSinStock
                                        }
                                    >

                                        <span>
                                            {suministro.nombre}
                                        </span>

                                        <strong>
                                            {suministro.stock}
                                            {' '}
                                            {suministro.unidad}
                                        </strong>

                                        <small>
                                            Mínimo: {suministro.stock_minimo}
                                            {' '}
                                            {suministro.unidad}
                                        </small>

                                    </div>

                                )
                            )

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay suministros sin stock.
                            </div>

                        )}

                    </div>

                </div>

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Entradas
                </h2>

                <span>
                    Pedidos recibidos
                </span>

            </div>


            <section className="dashboard-graficos">

                <div
                    className="dashboard-grafico-card"
                    onClick={navegarNuevaAlta}
                    style={{
                        cursor: 'pointer',
                    }}
                >

                    <div className="dashboard-grafico-header">

                        <h2>
                            Pedidos pendientes de alta
                        </h2>

                    </div>


                    <div className="dashboard-estadisticas-almacen">

                        <div className="dashboard-estadistica">

                            <span>
                                Pedidos pendientes
                            </span>

                            <strong>
                                {entradas.pedidos_pendientes_alta}
                            </strong>

                            <small>
                                Pendientes de registrar en almacén
                            </small>

                        </div>

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Pedidos correctos / incorrectos
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

            </section>


            <div className="dashboard-seccion-header">

                <h2>
                    Suministros con mas movimientos
                </h2>

                <span>
                    Últimos 30 días
                </span>

            </div>


            <section className="dashboard-graficos">

                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Suministros más consumidos
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosSuministrosConsumidos.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosSuministrosConsumidos}
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
                                        dataKey="nombre"
                                        width={100}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Cantidad"
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
                                No hay consumo de suministros.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Suministros más introducidos
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosSuministrosEntradas.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosSuministrosEntradas}
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
                                        dataKey="nombre"
                                        width={100}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="cantidad"
                                        name="Cantidad"
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
                                No hay entradas de suministros.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Consumo por categoría
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosCategorias.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosCategorias}
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
                                        dataKey="categoria"
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

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay consumo por categoría.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Altas por categoría
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosCategoriasEntradas.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={datosCategoriasEntradas}
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
                                        dataKey="categoria"
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

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay altas por categoría.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card dashboard-grafico-card-ancho">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Evolución del consumo de los principales
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosEvolucionConsumo.length > 0 &&
                        nombresSuministros.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <LineChart
                                    data={datosEvolucionConsumo}
                                    margin={{
                                        top: 10,
                                        right: 30,
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

                                    {nombresSuministros.map(
                                        suministro => (
                                            <Line
                                                key={suministro.dataKey}
                                                type="monotone"
                                                dataKey={suministro.dataKey}
                                                name={suministro.nombre}
                                                strokeWidth={2}
                                                dot={{
                                                    r: 3,
                                                }}
                                            />
                                        )
                                    )}

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay datos de evolución del consumo.
                            </div>

                        )}

                    </div>

                </div>


                <div className="dashboard-grafico-card dashboard-grafico-card-ancho">

                    <div className="dashboard-grafico-header">

                        <h2>
                            Evolución de las entradas de los principales
                        </h2>

                    </div>


                    <div className="dashboard-grafico">

                        {datosEvolucionEntradas.length > 0 &&
                        nombresSuministrosEntradas.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <LineChart
                                    data={datosEvolucionEntradas}
                                    margin={{
                                        top: 10,
                                        right: 30,
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

                                    {nombresSuministrosEntradas.map(
                                        suministro => (
                                            <Line
                                                key={suministro.dataKey}
                                                type="monotone"
                                                dataKey={suministro.dataKey}
                                                name={suministro.nombre}
                                                strokeWidth={2}
                                                dot={{
                                                    r: 3,
                                                }}
                                            />
                                        )
                                    )}

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="dashboard-grafico-vacio">
                                No hay datos de evolución de las entradas.
                            </div>

                        )}

                    </div>

                </div>

            </section>


            <section className="dashboard-seccion">

                <div className="dashboard-seccion-header">

                    <h2>
                        Salidas
                    </h2>

                    <span>
                        Últimos 30 días
                    </span>

                </div>


                <div className="dashboard-graficos">

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
                                            onClick={(datos) => {
                                                navegarBajasPorServicio(
                                                    datos.servicio
                                                );
                                            }}
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


                    <div className="dashboard-grafico-card">

                        <div className="dashboard-grafico-header">

                            <h2>
                                Packs más entregados
                            </h2>

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
                                            onClick={
                                                navegarPacksMasEntregados
                                            }
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

                </div>

            </section>

        </div>
    );
}


export default DashboardAlmacen;