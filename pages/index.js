import React, { useEffect, useState } from "react";
import LayoutApp from "src/layout";
import { Row, Spin, notification } from "antd";
import { makeRequest } from "src/helpers";
import { useSelector } from "react-redux";
import { PageHeaderComponent, ChartCardComponent } from "@components";

const Home = (props) => {
    const { dataUser, loadingGeneral } = useSelector((stateData) => stateData.global);

    const initialButtonsHeader = [
        {
            type: "primary",
            name: "Guardar Configuración",
            disabled: true,
            onClick: () => handleCompartion(),
        }
    ];

    const [loading, setLoading] = useState(false);
    const [listaIndicadoresMostrar, setListaIndicadoresMostrar] = useState([]);
    const [listaIndicadores, setListaIndicadores] = useState([]);
    const [buttonsHeader, setButtonsHeader] = useState(initialButtonsHeader);

    const handleGetListaIndicadores = async () => {
        setLoading(true);
        const { idUsuario, idPerfil } = dataUser;

        const response = await makeRequest({
            method: "POST",
            path: "/indican/listagraficosasociados.php",
            body: {
                idusuario: idUsuario,
                idperfil: idPerfil,
            },
        });

        if (response.Estatus === 1) {
            const { ListaIndicadoresMostrar, ListaIndicadores } = response;
            setListaIndicadores(ListaIndicadores);
            setListaIndicadoresMostrar(ListaIndicadoresMostrar);
            setLoading(false);
        } else {
            notification.error({
                message: response.mensaje,
                placement: "bottomRight",
            });
            setLoading(false);
        }
    };

    const handleUpdate = (posicion, idIndicador) => {
        initialButtonsHeader[0].disabled = false;
        setButtonsHeader([...initialButtonsHeader]);
        listaIndicadoresMostrar.map((item) => {
            if (item.Posicion == posicion) {
                item.id_indicador = idIndicador;
            }
        });
        setListaIndicadoresMostrar([...listaIndicadoresMostrar]);
    }

    const handleCompartion = async () => {
        setLoading(true);
        const confIndicadorMostrar = listaIndicadoresMostrar.map((item) => ({
            idNumCuadro: parseInt(item.Posicion),
            idIndicador: parseInt(item.id_indicador)
        }));

        const response = await makeRequest({
            method: "POST",
            path: "/indican/configcuadro.php",
            body: {
                idVistaMando: "2",
                idGerencia: dataUser.idGerencia,
                confIndicadorMostrar
            },
        });

        if (response.Estatus === 1) {
            notification.success({
                message: response.mensaje,
                placement: "bottomRight",
            });
            setLoading(false);
        } else {
            notification.error({
                message: response.mensaje,
                placement: "bottomRight",
            });
            setLoading(false);
        }
    }

    useEffect(() => {
        !loadingGeneral && dataUser.idUsuario && handleGetListaIndicadores();
    }, [loadingGeneral]);

    return (
        <LayoutApp {...props}>
            <PageHeaderComponent
                title={""}
                reload={false}
                button={true}
                dataButton={buttonsHeader}
                loading={loading}
                navigation={false}
            />

            <Spin tip="Cargando..." spinning={loading}>
                {!loading && (
                    <Row gutter={[24, 24]}>
                        {listaIndicadoresMostrar.length > 0 && listaIndicadoresMostrar.map((item) => (
                            <ChartCardComponent indicadorMostrar={item} listaIndicadores={listaIndicadores} handleUpdate={handleUpdate} />
                        ))}
                    </Row>
                )}
            </Spin>
        </LayoutApp>
    );
};

export default Home;
