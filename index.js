//const fs = require('fs');
const http = require('http');
const https = require('https');
const oracledb = require('oracledb');
const express = require('express');
const cors = require('cors');
//const bodyParser = require('body-parser');
const app = express();
app.use(express.json());


const port = 8015;


// Configuracion del pool de conexiones
const dbConfig = {
    enableStatistics: true,   // default is false
    user: "TRSRV",
    password: "2Ueded6Jd@6S5W$C",
    connectString: "192.168.11.68:1521/pdb1?expire_time=7&connect_timeout=30",
    poolAlias: 'pool_wscatapi',
    encoding: "UTF-8",
    poolMin: 5,
    poolMax: 19,
    poolIncrement: 1,
    poolTimeout: 20, //30
    queueTimeout: 30000     //60000
};

let pool;
let poolClosed = false; // Nueva bandera para rastrear si el pool est  cerrado

async function initializePool() {
    try {
        pool = await oracledb.createPool(dbConfig);
        console.log('Pool de conexiones de Oracle inicializado');
        startServer();
    } catch (err) {
        console.error('Error al inicializar el pool de conexiones:', err);
        process.exit(1);
    }
}

const options = {
    /*     key: fs.readFileSync('./certificado/wildcard_fanasa_com.key'),
        cert: fs.readFileSync('./certificado/wildcard_fanasa_com.crt'),
        ca: [fs.readFileSync('/bd/software/certificado25/transfer.pem')], */
};
// Listen
// Función para iniciar el servidor Express.js
function startServer() {
    const server = http.createServer(app);
    server.headersTimeout = 25000; //60000
    server.requestTimeout = 15000; //30000
    server.keepAliveTimeout = 7000; //5000
    server.maxHeadersCount = 1100; // Limitar a 100 encabezados (2000)
    // Manejo de conexiones de clientes
    let clientes = {};

    server.on('connection', (socket) => {
        console.log(Date() + ' | ' + socket.remoteAddress + ' | Nueva conexion establecida');
        console.log('  Local Address:', socket.localAddress);
        console.log('  Local Port:', socket.localPort);
        console.log('  Remote Port:', socket.remotePort);
        const ip = socket.remoteAddress;
        clientes[ip] = {
            tiempoUltimoPeticion: Date.now(),
            socket: socket,
        };
        socket.on('close', () => {
            console.log(` Conexion de ${ip} :` + socket.remotePort + ' cerrada');
            delete clientes[ip];
        });
    });
    socket.setTimeout(60000, () => {
        console.log(Date() + '|' + socket.remoteAddress + '|Socket inactivo durante 20 segundos, cerrando.');
        socket.end(); // Cierra la conexión ordenadamente
    });
    socket.on('end', () => {
        console.log(Date() + '|' + socket.remoteAddress + '|El cliente cerro la conexión del socket.');
    });

    socket.on('close', (hadError) => {
        console.log(Date() + '|' + socket.remoteAddress + '|Socket cerrado. Error:', hadError);
    });

    socket.on('error', (err) => {
        console.error(Date() + '|' + socket.remoteAddress + '|Error en el socket:', err);
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////


    app.get('/', function (req, res) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write("Ningun dato solicitado, en espera");
        res.end();
    });

    app.get('/pool-stats', async (req, res) => {
        if (pool) {
            const poolstatistics = pool.getStatistics();

            res.json(poolstatistics);
        } else {
            res.status(500).send('El pool de conexiones no est  inicializado.');
        }
    });


    //HolaMundo
    app.get('/HelloWorld', function (req, res) {
        gethell(req, res);
    });
    app.get('/auten/:usuario/:password', function (req, res) {
        auten(req, res);
    });
    //app.use(fauthorization)

    //UsuarioZonaAmbiente
    app.get('/usuarioambiente/:vusuario', function (req, res) {
        usuamb(req, res);
    });
    //GetCategoryFarmacia
    app.get('/categoryfarmacia/:idfarmacia', function (req, res) {
        getcategoryfar(req, res);
    });
    //Parametros
    app.get('/parametro', function (req, res) {
        parametro(req, res);
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////// SERVICIOS EXTERNOS EDA CARRITO//////////////////////////////////////////
    //CampanaEnc
    app.get('/ecscampanaenc/:idori/:idcli', cors(), function (req, res) {
        ecsclicampanaenc(req, res);
    });
    //CampanaEnc
    app.get('/ecscampanaencV2/:idori/:idcli', function (req, res) {
        getswitchapp(req, res);
    });
    //CampanaDetalle
    app.get('/ecscampanadet/:idori/:idcli', cors(), function (req, res) {
        ecsclicampanadet(req, res);
    });
    //CampanaDetalle
    app.get('/ecscampanadetV2/:idori/:idcli', function (req, res) {
        getswitchappdet(req, res);
    });
    //ArticuloBloqueado
    app.get('/artbloqueado/:idfar', function (req, res) {
        artbloqueado(req, res);
    });
    //Lista precios X Cliente Campana
    app.get('/listapreciofar/:idfar', function (req, res) {
        obtlistapreciofar(req, res);
    });
    //Catalogo lista precios AppTransfer
    app.get('/catlistaprecio/', function (req, res) {
        obtcatlistaprecio(req, res);
    });
    //Seguimineto de pedido detalle facturas
    app.get('/detpedseguimiento/:idpedido', function (req, res) {
        detpedidoseg(req, res);
    });
    //Consulta de pedido Encabezado
    app.get('/pedidoenc/:idped', function (req, res) {
        conspedidoenc(req, res);
    });
    //Estatus de pedidos por zona
    app.get('/estatuspedcli/:zona', function (req, res) {
        pedidoestatuscli(req, res);
    });

    app.get('/test/:idcli', function (req, res) {
        test(req, res);
    });

    //Envio de Pedido
    app.post('/enviopedidoecs/', function (req, res) {
        ecsenviopedido(req, res);
    });
    //historico
    app.get('/historicopedido/:vzona', function (req, res) {
        history(req, res);
    });

    //topvendidos
    app.get('/topvendidos/:fechaini/:fechafin', function (req, res) {
        topventas(req, res);
    });

    //ValidaCampaaasActualizadas
    app.get('/CampanasActualizadas', function (req, res) {
        ValDateActCamp(req, res);
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Inicio del servidor
    server.listen(port, function () {
        console.log('Servicio Ejecutandose... ws_carrito on port ' + port);
    });

    // Rutas Express.js y otras funciones...
    // ...

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



}


/* function HolaMundo(request, response) {
    handleDatabaseOperation(request, response, function (request, response, connection) {
        connection.execute("select 'Hola Mundo' as TEST from dual", [], {
            maxRows: 30000
        },
            function (err, result) {
                if (err) {
                    console.log('Error in execution of select statement 2  ' + err.message);
                    response.writeHead(500, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        status: 500,
                        message: "Error en consulta Oracle",
                        detailed_message: err.message
                    }));
                } else {
                    console.log('Servicio... Test HolaMundo');
                    response.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(JSON.stringify(result.rows), 'utf8')
                    });
                    response.end(JSON.stringify(result.rows));
                }
                doRelease(connection);
            }
        );

    });
} */

function gethell(request, response) {

    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {

            //connection.callTimeout = 200;
            const result = await connection.execute(
                "select 'Hello, World | Ambiente: PROD' as TEST from dual",
                []
                , { maxRows: 100 }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            console.log('Servicio... Test HolaMundo');
            response.end(JSON.stringify(result.rows));
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta ecsclicampanadet:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

const errorResponder = (error, request, response, next) => {
    response.status(error.status || 400).json({
        status: error.status,
        message: error.message,
        detailed_message: error.stack
    });
    next(error);
};

app.use(errorResponder);
async function fauthorization(request, response, next) {
    try {
        const authheaders = request.headers.authorization;
        if (!authheaders) {
            return response
                .status(401)
                .json({ "status": "error", "response": { "message": "Tu petición no tiene Autorizacion, Basic Auth" } });
        }
        var auth = new Buffer.from(authheaders.split(' ')[1], 'base64').toString().split(':');
        var user = auth[0];
        var pass = auth[1];
        if (user == 'ecsprod' && pass == 'FF854CD0-0144-44F2-BE13-37126AD8EC0B') {
            next();
        } else {
            return response
                .status(403)
                .json({ "status": "error", "response": { "message": "Tu peticion no coincide con los par?metros de autorizacion, Basic Auth" } });
        }
    } catch (error) {
        next(error);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//Login
function auten(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const binvars = {
                usuario: request.params.usuario,
                password: request.params.password,
                respuesta: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 1567
                }
            }
            //connection.callTimeout = 200;
            const result = await connection.execute(
                " BEGIN TRAPP.SEGURIDAD.Login_v2(:usuario,:password,:respuesta); END;",
                binvars
                , { maxRows: 100 }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            response.end(JSON.stringify(result.outBinds));
        } catch (err) {
            //console.log('lOGIN .... iduser: ' + JSON.stringify(binvars.usuario));
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion auten:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}//login

/////////////////////////////////////////////////////////////////////////////////////////////////
//UsuarioZonaAmbiente
function usuamb(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const binvars = {
                vusuario: request.params.vusuario,
                status: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 100
                },
                idusuario: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },
                zona: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },
                ambiente: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 500
                },
                url: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 1400
                }
            }
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN TRAPP.SEGURIDAD.ECS_GETAMBIENTE(:vusuario,:status,:idusuario,:zona,:ambiente,:url); END;",
                binvars
                , { maxRows: 1400 }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            response.end(JSON.stringify({
                metadata: "Servicio Usuario-Ambiente",
                description: "Retorna el Ambiente asignado al usuario",
                response: result.outBinds
            }));

        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | usuamb:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////
//GetCategoryFarmacia
function getcategoryfar(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const binvars = {
                vidfar: request.params.idfarmacia,
                status: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 150
                },
                idfarmacia: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },
                idlistaprecio: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },
                categorycode: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 200
                }
            }
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN TRAPP.ECS_FARCATEGORY(:vidfar,:status,:idfarmacia,:idlistaprecio,:categorycode); END;",
                binvars
                , { maxRows: 1000 }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            response.end(JSON.stringify({
                metadata: "Servicio Categoria farmacia",
                description: "Retorna Categoria de lista de precio",
                response: result.outBinds
            }));
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta  :', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function parametro(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            var cuenta = request.params.cuenta;
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT PO.IDPARAMETRO, PO.DESCRIPCION, PO.PARAMETRO, PO.ACTIVO, PO.FECHA  FROM TRDATA.PARAMETRO PO WHERE PO.IDPARAMETRO >= 2000",
                []
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            response.end(JSON.stringify({
                metadata: "Servicio listado de parametros",
                description: "listado de URL y valores",
                rows: result.rows
            }));
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | parametro:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ecsclicampanaenc(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION  FROM TRDATA.ECS_CLIECAMP_ENC WHERE IDFARMACIA =:idcli",
                [idcli]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            //console.log('Servicio... ecscampanaenc|idfarm: ' + idcli + ' ['+ datesys + ']' );                     
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | :', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}


function getswitchapp(request, response) {
    //console.log(request.params.idori);
    switch (request.params.idori) {
        case "1":
            //console.log("get app: AppTransfer");
            GetCampApptransfer(request, response);
            break;
        case "2":
            //console.log("get app: Fanasis");
            GetCheckFarFanasis(request, response);
            break;
        case "3":
            //console.log("get app: Carrito");
            GetCheckFarCarrito(request, response);
            break;
        default:
            console.log("No app");
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({
                metadata: "Servicio Campana-Farmacia",
                description: "listado de campanas a farmacia",
                response: "IdOrigen no encontrado"
            }));
            break;
    }
}

function GetCheckFarFanasis(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;", {
                idcli: request.params.idcli,
                OUT_CHECKAPP: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
            },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            if (JSON.stringify(result.outBinds.OUT_CHECKAPP) == '"OK_TRANSFER"') {
                //console.log("get GetCheckFarFanasis enc camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                GetCampFanasis(request, response);
            }
            else {
                const outchecke = (result.outBinds.OUT_CHECKAPP);
                const checkfare = "Consulta Realizada, " + outchecke;
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                //console.log("get GetCheckFarFanasis idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: checkfare
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCheckFarFanasis :', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCheckFarCarrito(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                " BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;",
                {
                    idcli: request.params.idcli,
                    OUT_CHECKAPP: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            if (JSON.stringify(result.outBinds.OUT_CHECKAPP) == '"OK_TRANSFER"') {
                //console.log("get GetCheckFarCarrito enc camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP));
                GetCampCarrito(request, response);
            }
            else {
                const outchecke = (result.outBinds.OUT_CHECKAPP);
                const checkfare = "Consulta Realizada, " + outchecke;
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                //console.log("get GetCheckFarCarrito idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP));
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: checkfare
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCheckFarCarrito:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampApptransfer(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            const datesys = new Date();
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPAPPTRANSFER UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPAPPTRANSFER_CLI WHERE IDFARMACIA =:idcli",
                [idcli]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            console.log('Servicio... GetCampApptransfer|idfarm: ' + idcli + ' [' + datesys + ']');
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampApptransfer:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}


function GetCampFanasis(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            const datesys = new Date();
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPFANASIS UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPFANASIS_CLI WHERE IDFARMACIA =:idcli",
                [idcli]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            console.log('Servicio... GetCampFanasis|idfarm: ' + idcli + ' [' + datesys + ']');
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampFanasis:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampCarrito(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPCARRITO UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPCARRITO_CLI WHERE IDFARMACIA =:idcli",
                [idcli]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... GetCampCarrito|idfarm: ' + idcli + ' ['+ datesys + ']' );                    
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampCarrito:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function ecsclicampanadet(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT JSONQ campana FROM TRDATA.ECS_CAMP_DET where idfarmacia =:idcli",
                [idcli]
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... ecscampanaDET|idfarm: ' + idcli + ' ['+ datesys + ']' );                     
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    rows: result.rows
                }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | ecsclicampanadet:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function getswitchappdet(request, response) {
    //console.log(request.params.idori);
    switch (request.params.idori) {
        case "1":
            //console.log("get det app: AppTransfer");
            GetCampDetApptransfer(request, response);
            break;
        case "2":
            //console.log("get det app: Fanasis");
            GetCheckFardetFanasis(request, response);
            break;
        case "3":
            //console.log("get det app: Carrito");
            GetCheckFardetCarrito(request, response);
            break;
        default:
            console.log("No app");
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({
                metadata: "Servicio Campana-Farmacia",
                description: "listado de campanas a farmacia",
                response: "IdOrigen no encontrado"
            }));
            break;
    }
}


/* function GetCheckFardetFanasis(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;",
                {
                    idcli: request.params.idcli,
                    OUT_CHECKAPP: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                }
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (JSON.stringify(result.outBinds.OUT_CHECKAPP) == '"OK_TRANSFER"') {
                console.log("get GetCheckFardetFanasis det camp idfar: "+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | ");
                //GetCampDetFanasis(request, response);
                try {
                    const idcli = request.params.idcli;
                    oracledb.fetchAsString = [oracledb.CLOB];
                    //connection.callTimeout = 200;
                    const result1 = await connection.execute(
                        "SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPFANASISDET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPFANASISDET_CLI where idfarmacia =:idcli",
                        [idcli]
                        , { outFormat: oracledb.OUT_FORMAT_OBJECT }
                    );
                    console.log('Servicio... GetCampDetFanasis|idfarm: ' + idcli + ' []' );                        
                    if (result1.rows.length) {
                        //const getrest = (result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}');
                        response.writeHead(200, {
                            'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                        });
                        response.end(JSON.stringify({
                            metadata: "Servicio CampanaDet-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            rows: result1.rows
                        }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
        
                    } else {
                        response.writeHead(200, {
                            'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                        });
                        response.end(JSON.stringify({
                            metadata: "Servicio CampanaDet-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            response: "Consulta Realizada, No se han obtenido filas."
                        }));
                    }
                    ///////////////////////////////////////////
                } catch (err) {
                    console.error('Error al obtener o usar la conexion del pool:', err);
                    let errorMessage = 'Error al interactuar con la base de datos';
                    if (err.message && err.message.includes('NJS-005')) {
                        errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
                    }
                    console.error('Error en la ejecucion de la consulta | GetCampDetFanasis:', err);
                    response.writeHead(500, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({
                        status: 500,
                        message: errorMessage,
                        detailed_message: err.message
                    }));
        
                }
            }
            else {
                const outcheck = (result.outBinds.OUT_CHECKAPP);
                const checkfar = "Consulta Realizada, " + outcheck;
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                //console.log("get GetCheckFardetFanasis idfar: " + idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    response: checkfar
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCheckFardetFanasis:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
} */

async function GetCheckFardetFanasis(request, response) {
    try {
        await handleDatabaseOperation(request, response, async function (request, response, connection) {
            oracledb.fetchAsString = [oracledb.CLOB]; // Mover la configuración aquí
            try {
                const result = await connection.execute(
                    "BEGIN TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;",
                    {
                        idcli: request.params.idcli,
                        OUT_CHECKAPP: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                    },
                    { outFormat: oracledb.OUT_FORMAT_OBJECT }
                );
                if (result.outBinds.OUT_CHECKAPP === 'OK_TRANSFER') { // Comparación directa de cadenas
                    console.log("get GetCheckFardetFanasis det camp idfar: " + " | " + result.outBinds.OUT_CHECKAPP + " | ");
                    try {
                        const idcli = request.params.idcli;
                        const result1 = await connection.execute(
                            "SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPFANASISDET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPFANASISDET_CLI where idfarmacia =:idcli",
                            [idcli],
                            { outFormat: oracledb.OUT_FORMAT_OBJECT }
                        );
                        console.log('Servicio... GetCampDetFanasis|idfarm: ' + idcli + ' []');

                        if (result1.rows.length) {
                            response.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Transfer-Encoding': 'chunked'
                            });
                            response.end(JSON.stringify({
                                metadata: "Servicio CampanaDet-Farmacia",
                                description: "listado de campanas-detalle a farmacia",
                                rows: result1.rows
                            }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                        } else {
                            response.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Transfer-Encoding': 'chunked'
                            });
                            response.end(JSON.stringify({
                                metadata: "Servicio CampanaDet-Farmacia",
                                description: "listado de campanas-detalle a farmacia",
                                response: "Consulta Realizada, No se han obtenido filas."
                            }));
                        }
                    } catch (err) {
                        handleError(response, err, 'result1: GetCampDetFanasis');
                    }
                } else {
                    const outcheck = result.outBinds.OUT_CHECKAPP;
                    const checkfar = "Consulta Realizada, " + outcheck;
                    response.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Transfer-Encoding': 'chunked'
                    });
                    response.end(JSON.stringify({
                        metadata: "Servicio Campana-Farmacia",
                        description: "listado de campanas-detalle a farmacia",
                        response: checkfar
                    }));
                }
            } catch (err) {
                handleError(response, err, 'result :GetCheckFardetFanasis');
            }
        });
    } catch (err) {
        handleError(response, err, 'GetCheckFardetFanasis');
    }
}





function GetCheckFardetCarrito(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;",
                {
                    idcli: request.params.idcli,
                    OUT_CHECKAPP: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                }
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (JSON.stringify(result.outBinds.OUT_CHECKAPP) == '"OK_TRANSFER"') {
                //console.log("get GetCheckFardetCarrito det camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                GetLPcampDetCarrito(request, response);
            }
            else {
                const outcheck = (result.outBinds.OUT_CHECKAPP);
                const checkfar = "Consulta Realizada, " + outcheck;
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                //console.log("get GetCheckFardetCarrito idfar: " + idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                response.end(JSON.stringify({
                    metadata: "Servicio Campana-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    response: checkfar
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCheckFardetCarrito:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampDetApptransfer(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPAPPTRANSFERDET UNION SELECT JSONQ campana FROM TRDATA.ECS_CAMPAPPTRANSFERDET_CLI where idfarmacia =:idcli",
                [idcli]
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... GetCampDetApptransfer|idfarm: ' + idcli + ' ['+ datesys + ']' );                        
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    rows: result.rows
                }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampDetApptransfer:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampDetFanasis(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPFANASISDET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPFANASISDET_CLI where idfarmacia =:idcli",
                [idcli]
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            console.log('Servicio... GetCampDetFanasis|idfarm: ' + idcli + ' []');
            if (result.rows.length) {
                //const getrest = (result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}');
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    rows: result.rows
                }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));

            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio CampanaDet-Farmacia",
                    description: "listado de campanas-detalle a farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampDetFanasis:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetLPcampDetCarrito(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN  TRAPP.SEGURIDAD.ECS_GETCAMPDETCARRITO (:idcli,:OUTAPPLISTA ); END;",
                {
                    idcli: request.params.idcli,
                    OUTAPPLISTA: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
                }
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (JSON.stringify(result.outBinds.OUTAPPLISTA) == '"OK"') {
                //console.log("get det listaPrecio: APPTRANSFER");
                GetCampDetCarritolistaAppT(request, response);
            } else {
                //console.log("get det listaPrecio: Otros");
                GetCampDetCarritoListaOtros(request, response);
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetLPcampDetCarrito:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampDetCarritoListaOtros(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idcli = request.params.idcli;
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET_CLI where idfarmacia =:idcli",
                [idcli]
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... GetCampDetCarritoListaOtros|idfarm: ' + idcli + ' ['+ datesys + ']' );
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampDetCarritoListaOtros:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function GetCampDetCarritolistaAppT(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPCARRITODET_LP WHERE IDFARMACIA = :idfarm UNION ALL SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPCARRITODET_CLI_LP WHERE IDFARMACIA = :idfarm",
                { idfarm: request.params.idcli }
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... GetCampDetCarritolistaAppT |idfarm: ' + idcli + ' ['+ datesys + ']' );                        
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampDetCarritolistaAppT:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function artbloqueado(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idfar = request.params.idfar;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "select id as idarticulo from trerp.articulobloqueado  where idfarmacia =:idfar",
                [idfar]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... Artbloqueado |idfar:'+ idfar + ' ['+ datesys + ']' );                           
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Articulo Bloqueado",
                    description: "listado de articulos para la no venta por farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Articulo Bloqueado",
                    description: "listado de articulos para la no venta por farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | artbloqueado:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function obtlistapreciofar(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idfar = request.params.idfar;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT  IDLISTAPRECIO, IDARTICULO, PRECIO,IVA,IDCAMPANA,IDFARMACIA FROM TRERP.ECS_FARMPRECIODESCUENTO WHERE IDFARMACIA = :idfar",
                [idfar]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... obtlistapreciofar|idFar: '+ idfar +  '|['+ fecha + ']');                         
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Lista Precios",
                    description: "listado de precios por Farmacia",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Lista Precios",
                    description: "listado de precios por Farmacia",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | obtlistapreciofar:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function obtcatlistaprecio(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDLISTAPRECIO, IDARTICULO, PRECIO FROM TRERP.ECS_CATLISTAPRECIO",
                []
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... catlistaprecio |['+ fecha + ']');                            
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Lista Precios",
                    description: "listado de precios AppTransfer",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Lista Precios",
                    description: "listado de precios AppTransfer",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | obtcatlistaprecio:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function detpedidoseg(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idpedido = request.params.idpedido;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT SE.IDPEDIDO,IDARTICULO,IDPEDPORTAL,IDPEDERP,NUMFACTURA,SE.CANTIDAD,ESTATUS,PRECIOFACTURA,SE.OFERTA,DESCUENTO,IVA,IEPS,CANTSURTIDA,SUBTOTALFACT,FECHAPEDPORTAL,FECHAPEDERP, DE.IDCAMPANA FROM TRDATA.PEDIDORESPUESTADET SE JOIN TRDATA.PEDIDOAPPDET DE ON SE.IDPEDIDO = DE.IDPEDIDO AND SE.IDARTICULO = DE.IDPRODUCTO WHERE SE.IDPEDIDO = :pedido",
                [idpedido]
                , {
                    maxRows: 1000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... detpedidoseg:' + idpedido );                       
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Seguimiento Pedido",
                    description: "Seguimiento de pedido, detalle de articulos facturados, estatus",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Seguimiento Pedido",
                    description: "Seguimiento de pedido, detalle de articulos facturados, estatus",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | detpedidoseg:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}
////////////Consulta Pedido Encabezado
function conspedidoenc(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const idped = request.params.idped;
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "select IDPEDIDOAPP, IDUSERAPP, FARMACIA, NUMCUENTA, FECHA, PIEZAS, MONTO, ESTATUS, KEYPEDIDO from trdata.PEDIDOAPP where IDPEDIDO =:idped",
                [idped]
                , {
                    maxRows: 1000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Servicio... pedidoenc|IdPedido: ' + idped+ ' |['+ currentTime + ']' );                    
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Pedido Encabezado",
                    description: "Retorna pedido a nivel encabezado",
                    rows: result.rows
                }));
            }
            else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Pedido Encabezado",
                    description: "Retorna pedido a nivel encabezado",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | conspedidoenc:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));
        }
    });
}

////////////Consulta Pedido ESTATUS por cliente zona
function pedidoestatuscli(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const vzona = request.params.zona;
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT PE.IDPEDIDO, PE.ESTATUS FROM TRDATA.PEDIDOAPP PE JOIN TRERP.FARMACIAS_TRANSFER FT ON PE.NUMCUENTA = FT.IDFARMACIA WHERE FT.ZONA = :vzona",
                [vzona]
                , {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );
            //console.log('Consulta PedEstatus... vzona:' + vzona + ' ['+ currentTime + ']' );
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Estatus de Pedidos",
                    description: "Retorna listado de estatus de pedidos por Farmacia-Zona",
                    rows: result.rows
                }));
            }
            else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Estatus de Pedidos",
                    description: "Retorna listado de estatus de pedidos por Farmacia-Zona",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | pedidoestatuscli:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function ecsenviopedido(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            oracledb.fetchAsString = [oracledb.CLOB];
            const fulljson = JSON.stringify(request.body.pedido);
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN TRAPP.PEDIDO_ADD_ALL.PEDIDO_ADD_ECS(:pedido,:key,:respuesta); END;",
                {
                    pedido: fulljson,
                    key: request.body.key,
                    respuesta: { type: oracledb.VARCHAR2, dir: oracledb.BIND_OUT }
                }
                , { maxRows: 1000 }
            );
            //console.log('Servicio... PEDIDO_ADD_ECS | idpedido: ' + JSON.stringify(result.outBinds) );
            response.writeHead(200, {
                'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
            });
            response.end(JSON.stringify({
                metadata: "Servicio Envio de Pedidos AppTransfer",
                description: "Retorna IdPedido AppTransfer",
                status: "OK",
                idpedido: result.outBinds.respuesta
            }));
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | ecsenviopedido:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function history(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const vzona = request.params.vzona;
            oracledb.fetchAsString = [oracledb.CLOB];
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT PED.IDPEDIDO, PED.ESTATUS , PALL.JSON_DATA as PEDIDO, PALL.KEY FROM TRDATA.PEDIDOAPP PED JOIN TRDATA.PEDIDO_ALL_JSON PALL ON PED.IDPEDIDO = PALL.IDPEDIDO JOIN TRERP.FARMACIAS_TRANSFER FT ON PED.NUMCUENTA = FT.IDFARMACIA WHERE   PED.ESTATUS IS NOT NULL AND FT.ZONA = :vzona",
                [vzona]
                , {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    maxRows: 30000
                }
            );
            '"/",""'
            //console.log('Servicio... Historicopedido, zona: ' + vzona + '| ['+ datesys + ']' );                       
            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Historico",
                    description: "listado pedidos creados",
                    rows: result.rows
                }).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Historico",
                    description: "listado pedidos creados",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | history:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function topventas(request, response) {
    //console.log(request.params.idori);
    var fechainicio = new Date(request.params.fechaini).getTime();
    var fechafin = new Date(request.params.fechafin).getTime();
    var dif = (fechafin - fechainicio);
    var dias = (Math.abs(Math.trunc(dif / (1000 * 60 * 60 * 24))));
    //console.log(dias);
    if (dias > 90) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify({
            metadata: "Servicio Top + vendidos",
            description: "listado de articulos top vendidos",
            response: "El rango de fechas de consulta excede los 3 meses permitidos (90 dias)"
        }));

    } else {
        //console.log("get topventas");
        Gettopventas(request, response);
    }
}

function Gettopventas(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            var ini = request.params.fechaini;
            var fin = request.params.fechafin;
            var datest = ini.replace(/"/g, "'");
            var dateend = fin.replace(/"/g, "'");
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "SELECT IDARTICULO, CANTIDAD FROM ( SELECT IDARTICULO, SUM(SEG.CANTIDAD) AS CANTIDAD FROM TRDATA.PEDIDORESPUESTADET SEG WHERE FECHAPEDERP BETWEEN TO_DATE (" + datest + ", 'YYYY-MM-DD') AND TO_DATE (" + dateend + ", 'YYYY-MM-DD') GROUP BY SEG.IDARTICULO ORDER BY SUM(SEG.CANTIDAD) DESC ) WHERE ROWNUM <= 50",
                []
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... Gettopventas| ['+ datesys + ']' );

            if (result.rows.length) {
                response.writeHead(200, {
                    'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Top + vendidos",
                    description: "listado de articulos top vendidos",
                    rows: result.rows
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Top + vendidos",
                    description: "listado de articulos top vendidos",
                    response: "Consulta Realizada, No se han obtenido filas."
                }));
            }
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | Gettopventas:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}

function ValDateActCamp(request, response) {
    if (request.query.fecha == null) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify({
            metadata: "Servicio campañas actualizadas",
            description: "valida campañas actualizadas",
            response: "Error envio de RAW JSON"
        }));

    } else {
        //const vfecha = JSON.stringify(request.body.fecha);    
        var xx = JSON.parse(request.query.fecha);
        //var xx = request.query.fecha;
        //console.log(xx);
        const regexExpdate = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        const resdate = regexExpdate.test(xx);
        //console.log(resdate);
        if (resdate === true) {
            GetCampanasActualizadas(request, response);
        } else {

            response.writeHead(412, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({
                metadata: "Servicio campañas actualizadas",
                status: "error",
                response: { "message": "Error: Fecha", "detail": "Es necesario validar el formato de fecha; ejemplo : '2024-03-01 15:02:23' " }
            }));
        }

    }
}

function GetCampanasActualizadas(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        try {
            const binvars = {
                vdate: JSON.parse(request.query.fecha),
                vidfar: request.query.idfarmacia,
                respuesta: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 767
                }
            }
            //connection.callTimeout = 200;
            const result = await connection.execute(
                "BEGIN TRAPP.SEGURIDAD.ECS_GETCAMPANASACT (:vdate, :vidfar, :respuesta ); END;",
                binvars
                , { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            //console.log('Servicio... GetCampanasActualizadas| ['+ datesys + ']' );
            response.writeHead(200, {
                'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked'
            });
            response.end(JSON.stringify({
                metadata: "Servicio Actualizacion de Campa�as",
                description: "listado para validar campa�as nuevas e inactivas",
                response: result.outBinds.respuesta
            }));
            ///////////////////////////////////////////
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta | GetCampanasActualizadas:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}



function ws_articulo2(request, response) {

    handleDatabaseOperation(request, response, async function (request, response, connection) {
        var cuenta = request.params.cuenta;
        oracledb.fetchAsString = [oracledb.CLOB];
        //connection.callTimeout = 200;
        try {
            const result = await connection.execute(
                "SELECT ClasificacionNombre, CodigoBarras, Combo, Descripcion, EsPsicotropico, GrupoTerapeuticoNombre, IdArticulo, IVA, PrecioPublico, TipoDescuento,    Venta_Publico, SAL,  SALCOMPARACION, TIENEIVA, Venta_Publico_Descripcion,    LaboratorioNombre,    AceptaDevolucion,    CantidadPresentacion,    Demanda,    DESCUENTO,    EXISTENCIAARTICULO,    MARGENTOTAL,    OFERTA,    PORCENTAJEIEPS,    PORCENTAJEIVA,    PRECIOBASE,    PRECIOFINAL,    PRECIOFINALSINIVA,    PRESENTACION,    SUGERENCIADIRIGIDA,    TIENEOFRTA,    VALORDESCUENTO,    VALORIEPS,    VALOROFERTA,CUENTA     FROM HEIMDALL_OP.VW_ARTICULO_EFANASA WHERE CUENTA= :cuenta",
                [cuenta]
                , { maxRows: 30000 }
            );
            response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
            response.end(JSON.stringify(result.rows));
        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta ecsclicampanadet:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));

        }
    });
}


async function ws_articulo(request, response) {
    handleDatabaseOperation(request, response, async function (request, response, connection) {
        var cuenta = request.params.cuenta;
        oracledb.fetchAsString = [oracledb.CLOB];

        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Transfer-Encoding', 'chunked');

        try {
            const result = await connection.execute(
                "SELECT ClasificacionNombre, CodigoBarras, Combo, Descripcion, EsPsicotropico, GrupoTerapeuticoNombre, IdArticulo, IVA, PrecioPublico, TipoDescuento,   Venta_Publico, SAL,   SALCOMPARACION, TIENEIVA, Venta_Publico_Descripcion,   LaboratorioNombre,   AceptaDevolucion,   CantidadPresentacion,   Demanda,   DESCUENTO,   EXISTENCIAARTICULO,   MARGENTOTAL,   OFERTA,   PORCENTAJEIEPS,   PORCENTAJEIVA,   PRECIOBASE,   PRECIOFINAL,   PRECIOFINALSINIVA,   PRESENTACION,   SUGERENCIADIRIGIDA,   TIENEOFRTA,   VALORDESCUENTO,   VALORIEPS,   VALOROFERTA,CUENTA   FROM HEIMDALL_OP.VW_ARTICULO_EFANASA WHERE CUENTA= :cuenta",
                [cuenta]
                , { maxRows: 30000 }
            );

            response.write('['); // Iniciar el array JSON

            for (let i = 0; i < result.rows.length; i++) {
                const row = result.rows[i];
                const jsonRow = JSON.stringify(row);
                response.write(jsonRow);
                if (i < result.rows.length - 1) {
                    response.write(','); // Agregar coma entre objetos
                }
            }
            response.write(']'); // Finalizar el array JSON
            response.end();

        } catch (err) {
            console.error('Error al obtener o usar la conexion del pool:', err);
            let errorMessage = 'Error al interactuar con la base de datos';
            if (err.message && err.message.includes('NJS-005')) {
                errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
            }
            console.error('Error en la ejecucion de la consulta ecsclicampanadet:', err);
            response.writeHead(500, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                status: 500,
                message: errorMessage,
                detailed_message: err.message
            }));
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

async function handleDatabaseOperation(request, response, callback) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    response.setHeader('Access-Control-Allow-Credentials', true);

    let connection;
    try {
        connection = await pool.getConnection();
        await callback(request, response, connection);
    } catch (err) {
        console.error('Error al obtener o usar la conexion del pool:', err);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
            status: 500,
            message: 'Error al interactuar con la base de datos',
            detailed_message: err.message
        }));
    } finally {
        if (connection) {
            try {
                console.error('Conexion close');
                await connection.close();
            } catch (err) {
                console.error('c Error al liberar la conexion:', err);
            }
        }
    }
} //handleDatabaseOperation




function handleError(response, err, functionName) {
    console.error('Error al obtener o usar la conexion del pool:', err);
    let errorMessage = 'Error al interactuar con la base de datos';
    if (err.message && err.message.includes('NJS-005')) {
        errorMessage = 'La operación con la base de datos excedió el tiempo de espera.';
    }
    console.error(`Error en la ejecucion de la consulta | ${functionName}:`, err);
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        status: 500,
        message: errorMessage,
        detailed_message: err.message
    }));
}


async function closePool() {
    console.log('Intentando cerrar el pool de conexiones...');
    if (pool && !poolClosed) {
        poolClosed = true;
        try {
            await oracledb.getPool('pool_wscatapi').close(10);
            console.log('Pool de conexiones de Oracle cerrado exitosamente.');
            process.exit(0);
        } catch (err) {
            console.error('Error al cerrar el pool de conexiones:', err);
        }
    } else if (poolClosed) {
        console.log('El pool de conexiones ya estaba cerrado.');
    } else {
        console.log('El pool de conexiones no estaba inicializado.');
    }
}

process.on('SIGTERM', () => {
    console.log('Se al SIGTERM recibida.');
    closePool();
});

process.on('SIGINT', () => {
    console.log('Se al SIGINT recibida.');
    closePool();
});
//////////////////////////////////////////////////////////////////////////////////////////    
//////////////////////////////////////////////////////////////////////////////////////////
initializePool();
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
