const fs = require('fs');
//const http = require('http');
const https = require('https');
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const port = 8015;

const options = {
    key: fs.readFileSync('./certificado/wildcard_fanasa_com.key'),
    cert: fs.readFileSync('./certificado/wildcard_fanasa_com.crt'),
    ca: [ fs.readFileSync('/bd/software/certificado25/transfer.pem') ],
};

const app = express();
const bodyParser = require('body-parser');

//var currentTime = new Date();
// Listen
const server = https.createServer(options, app);

let clientes = {};

server.on('connection', (socket) => {
  console.log(Date() +' | ' + socket.remoteAddress+' | Nueva conexion establecida');
  const ip = socket.remoteAddress;
  clientes[ip] = {
    tiempoUltimoPeticion: Date.now(),
    socket: socket
  };
/*     socket.on('close', () => {
    console.log(`Conexión de ${ip} cerrada`);
    delete clientes[ip];
  }); */
});

server.listen(port,'192.168.11.68', function(){
    //server.keepAliveTimeout = 10 * 1000;
    console.log("Servicio Ejecutandose... ws_cat_api on port " + port);
});

app.use(bodyParser.json());
app.use(cors());
//app.use(helmet());
///////////////////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res) {
    res.writeHead(400, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        message: "Ningun dato solicitado PATH, en espera",
        detailed_message: "Ningun dato solicitado PATH, en espera"
    }));
});
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

//HolaMundo
app.get('/HelloWorld', function(req, res) {
    gethell(req, res);
});
app.get('/auten/:usuario/:password', function(req, res) {
    auten(req, res);
});
app.use(fauthorization)



//UsuarioZonaAmbiente
app.get('/usuarioambiente/:vusuario', function(req, res) {
    usuamb(req, res);
});
//GetCategoryFarmacia
app.get('/categoryfarmacia/:idfarmacia', function(req, res) {
    getcategoryfar(req, res);
});
//Parametros
app.get('/parametro', function(req, res) {
    parametro(req, res);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// SERVICIOS EXTERNOS EDA CARRITO//////////////////////////////////////////
//CampanaEnc
app.get('/ecscampanaenc/:idori/:idcli', cors(), function(req, res) { 
    ecsclicampanaenc(req, res);
});
//CampanaEnc
app.get('/ecscampanaencV2/:idori/:idcli', function(req, res) { 
    getswitchapp(req, res);
});
//CampanaDetalle
app.get('/ecscampanadet/:idori/:idcli', cors(), function(req, res) { 
    ecsclicampanadet(req, res);
});
//CampanaDetalle
app.get('/ecscampanadetV2/:idori/:idcli',  function(req, res) { 
    getswitchappdet(req, res);
});
//ArticuloBloqueado
app.get('/artbloqueado/:idfar', function(req, res) {
    artbloqueado(req, res);
});
//Lista precios X Cliente Campana
app.get('/listapreciofar/:idfar', function(req, res) {
    obtlistapreciofar(req, res);
}); 
//Catalogo lista precios AppTransfer
app.get('/catlistaprecio/', function(req, res) {
    obtcatlistaprecio(req, res);
}); 
//Seguimineto de pedido detalle facturas
app.get('/detpedseguimiento/:idpedido', function(req, res) {
    detpedidoseg(req, res);
});
//Consulta de pedido Encabezado
app.get('/pedidoenc/:idped', function(req, res) {
    conspedidoenc(req, res);
});
//Estatus de pedidos por zona
app.get('/estatuspedcli/:zona', function(req, res) {
    pedidoestatuscli(req, res);
});

app.get('/test/:idcli', function(req, res) { 
    test(req, res);
});

//Envio de Pedido
app.post('/enviopedidoecs/', function(req, res) {    
    ecsenviopedido(req, res);
});
//historico
app.get('/historicopedido/:vzona', function(req, res) { 
    history(req, res);
});

//topvendidos
app.get('/topvendidos/:fechaini/:fechafin', function(req, res) { 
    topventas(req, res);
});

//ValidaCampa�asActualizadas
app.get('/CampanasActualizadas', function(req, res) { 
    ValDateActCamp(req, res);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

function handleDatabaseOperation(request, response, callback) {
        //console.log(request.method + ":" + request.url);
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,POST');
        response.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
        response.setHeader('Access-Control-Allow-Credentials', true);

        //console.log('Handle request: ' + request.url);
        var connectString = "192.168.11.68:1521/pdb1?expire_time=2&connect_timeout=30";
        //console.log('ConnectString :' + connectString);
        oracledb.autoCommit = true;
        oracledb.getConnection({
                user: "TRSRV",
                password: "23e3e3aqadU6Jd@adc4466ddededadS5W6676$C",
                connectString: connectString
            },
            function(err, connection) {
                if (err) {
                    console.log('Error in acquiring connection ...');
                    console.log('Error message ' + err.message);

                    // Error connecting to DB
                    response.writeHead(500, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        status: 500,
                        message: "Error connecting to DB",
                        detailed_message: err.message
                    }));
                    return;
                }
                // do with the connection whatever was supposed to be done
                //console.log('Connection acquired ; go execute ');
                callback(request, response, connection);
            });
    } //handleDatabaseOperation


    ///////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function gethell (request, response) {
        handleDatabaseOperation(request, response, function(request, response, connection) {
            connection.execute("select 'Hello, World | Ambiente: PROD' as TEST from dual", [], {
                    maxRows: 30000
                    //outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                        console.log('Servicio... Test HolaMundo'  );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({response: result.rows}));
                    }
                    doRelease(connection);
                }
            );

        });
    }



    const errorResponder = (error, request, response, next) => {
        response.header("Content-Type", 'application/json')      
        const status = error.status || 400
        //response.status(status).send(error.message)    
        console.log('Error in execution of =fauthorization= to =errorResponder=' + error.message);
        response.end(JSON.stringify({
            status: status,
            message: "Error envio de JSON",
            detailed_message: error.message
        }));
      }
        app.use(errorResponder)
        function fauthorization (request, response,next) {      
            //console.log('authorization');
            //console.log(JSON.stringify(request.headers.authorization));            
            try {
                const authheaders = request.headers.authorization;
            if (!authheaders) {
                console.log("petici�n no tiene Autorizaci�n, Basic Auth");
                return response
                .status(401)
                .send({"status":"error","response":{"message":"Tu petici�n no tiene Autorizaci�n, Basic Auth"}});
            }
                var auth = new Buffer.from(authheaders.split(' ')[1], 'base64').toString().split(':');
                var user = auth[0];
                var pass = auth[1];
            if (user == 'ecsprod' && pass == 'FF854CD0-0144-44F2-BE13-37126AD8EC0B') {
                    next();                    
            } else {
                console.log("Error Basic Auth");
                return response
                .status(403)
                .send({"status":"error","response":{"message":"Tu petici�n no coincide con los par�metros de autorizaci�n, Basic Auth"}});
                
            }
            } catch (error) {
                next(error)
            }
        }

        
   /////////////////////////////////////////////////////////////////////////////////////////////////
   //Login
   function auten(request, response) {
    handleDatabaseOperation(request, response, function(request, response, connection) {
        
    var binvars = { 
            usuario: request.params.usuario,
            password: request.params.password,
            respuesta: { dir: oracledb.BIND_OUT,
                         type: oracledb.STRING, 
                         maxSize: 1567 }
     }
        
        connection.execute(" BEGIN                                                   \n\
                               TRAPP.SEGURIDAD.Login_v2(:usuario,:password,:respuesta);              \n\
                             END;", binvars, {
                maxRows: 30000
            },
            function(err, result) {
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
                    console.log('lOGIN .... iduser: ' + JSON.stringify(binvars.usuario));
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify(result.outBinds));
                }
                doRelease(connection);
            }
        );

    });
} //login


/////////////////////////////////////////////////////////////////////////////////////////////////
   //UsuarioZonaAmbiente
   function usuamb(request, response) {
     var datesys = new Date();
    handleDatabaseOperation(request, response, function(request, response, connection) {        
    var binvars = {
            vusuario: request.params.vusuario,
            status:     { dir: oracledb.BIND_OUT,
                         type: oracledb.STRING, 
                         maxSize: 100 },
            idusuario:  { dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER },
            zona:       { dir: oracledb.BIND_OUT,
                        type: oracledb.NUMBER },
            ambiente:   { dir: oracledb.BIND_OUT,
                         type: oracledb.STRING, 
                         maxSize: 500 },
            url:   { dir: oracledb.BIND_OUT,
                         type: oracledb.STRING, 
                         maxSize: 1500 }}                                 
        connection.execute("BEGIN TRAPP.SEGURIDAD.ECS_GETAMBIENTE(:vusuario,:status,:idusuario,:zona,:ambiente,:url); END;", binvars, {
                maxRows: 30000
            },
            function(err, result) {
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
                    console.log('Servicio... usuarioambiente: OK |usuario: ' + JSON.stringify(binvars.vusuario) + ' ['+ datesys + ']');
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        metadata: "Servicio Usuario-Ambiente",
                        description: "Retorna el Ambiente asignado al usuario",
                        response: result.outBinds}));
                }
                doRelease(connection);
            }
        );
    });
} 


/////////////////////////////////////////////////////////////////////////////////////////////////
   //GetCategoryFarmacia
   function getcategoryfar(request, response) {
    handleDatabaseOperation(request, response, function(request, response, connection) {        
    var binvars = { 
            vidfar: request.params.idfarmacia,
            status:         { dir: oracledb.BIND_OUT,
                            type: oracledb.STRING, 
                            maxSize: 150 },
            idfarmacia:     { dir: oracledb.BIND_OUT,
                            type: oracledb.NUMBER },
            idlistaprecio:  { dir: oracledb.BIND_OUT,
                            type: oracledb.NUMBER },
            categorycode:   { dir: oracledb.BIND_OUT,
                            type: oracledb.STRING, 
                            maxSize: 200 }
                        }        
        connection.execute("BEGIN TRAPP.ECS_FARCATEGORY(:vidfar,:status,:idfarmacia,:idlistaprecio,:categorycode); END;", binvars, {
                maxRows: 30000
            },
            function(err, result) {
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
                    console.log('Servicio... GetCategoryFarmacia | OK: ' + JSON.stringify(binvars.vusuario));
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        metadata: "Servicio Categoria farmacia",
                        description: "Retorna Categoria de lista de precio",
                        response: result.outBinds}));
                }
                doRelease(connection);
            }
        );
    });
} 


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function parametro (request, response) {
       handleDatabaseOperation(request, response, function(request, response, connection) {
           connection.execute("SELECT PO.IDPARAMETRO, PO.DESCRIPCION, PO.PARAMETRO, PO.ACTIVO, PO.FECHA  FROM TRDATA.PARAMETRO PO WHERE PO.IDPARAMETRO >= 2000", [], {                   
                    outFormat: oracledb.OUT_FORMAT_OBJECT
               },
               function(err, result) {
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
                       console.log('Servicio... Parametro: OK'  );
                       response.writeHead(200, {
                           'Content-Type': 'application/json'
                       });
                       
                       response.end(JSON.stringify({
                           metadata: "Servicio listado de parametros",
                           description: "listado de URL y valores",
                           rows: result.rows}));
                   }
                   doRelease(connection);
               }
           );

       });
   } 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////



    function ecsclicampanaenc (request, response) {
    var idcli = request.params.idcli;
      var datesys = new Date();
      handleDatabaseOperation(request, response, function(request, response, connection) {
         connection.execute("SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION  FROM TRDATA.ECS_CLIECAMP_ENC WHERE IDFARMACIA =:idcli", [idcli], {
                 maxRows: 30000,
                 outFormat: oracledb.OUT_FORMAT_OBJECT
             },
             function(err, result) {
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
                     console.log('Servicio... ecscampanaenc|idfarm: ' + idcli + ' ['+ datesys + ']' );
                     response.writeHead(200, {
                         'Content-Type': 'application/json'
                     });
                     if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas a farmacia",
                            rows: result.rows}));
                    } else {
                     response.end(JSON.stringify({
                        metadata: "Servicio Campana-Farmacia",
                        description: "listado de campanas a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                     }
                 }
                 doRelease(connection);
             }
         );
      });
    } 
    
    function getswitchapp (request, response) {
        //console.log(request.params.idori);
        switch (request.params.idori) {
            case "1" :
                console.log("get app: AppTransfer");
                GetCampApptransfer(request, response);
            break;
            case "2" :
                console.log("get app: Fanasis");
                GetCheckFarFanasis(request, response);
            break;
            case "3" :
                console.log("get app: Carrito");
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
                    response : "IdOrigen no encontrado" 
                }));
            break;
        }
    }


    function GetCheckFarFanasis (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {    
          oracledb.fetchAsString = [ oracledb.CLOB ];
              connection.execute(" BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;", {
                                        idcli : request.params.idcli,
                                        OUT_CHECKAPP: {  type: oracledb.STRING , dir: oracledb.BIND_OUT  }
                                     } ,
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        },
                  function(err, result) {
                      if (err) {
                          console.log('Error in execution of select statement ' + err.message);
                          response.writeHead(500, {
                              'Content-Type': 'application/json'
                          });
                          response.end(JSON.stringify({
                              status: 500,
                              message: "Error en consulta Oracle",
                              detailed_message: err.message
                          }));
                      } else {
                          
                          
                          if (JSON.stringify(result.outBinds.OUT_CHECKAPP)  == '"OK_TRANSFER"') {
                              console.log("get GetCheckFarFanasis enc camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                              GetCampFanasis(request, response);                        
                            } 
                          else {
                                const outchecke = (result.outBinds.OUT_CHECKAPP);                            
                                const checkfare = "Consulta Realizada, "  + outchecke;
                                response.writeHead(200, {
                                    'Content-Type': 'application/json'
                                });
                              console.log("get GetCheckFarFanasis idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                              response.end(JSON.stringify({
                              metadata: "Servicio Campana-Farmacia",
                              description: "listado de campanas a farmacia",
                              response : checkfare }));
                          }
                      }
                      doRelease(connection);
                  }
              );
          });
        } 



    function GetCheckFarCarrito (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {    
            oracledb.fetchAsString = [ oracledb.CLOB ];
                connection.execute(" BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;", {
                                        idcli : request.params.idcli,
                                        OUT_CHECKAPP: {  type: oracledb.STRING , dir: oracledb.BIND_OUT  }
                                        } ,
                        {
                            outFormat: oracledb.OUT_FORMAT_OBJECT
                        },
                    function(err, result) {
                        if (err) {
                            console.log('Error in execution of select statement ' + err.message);
                            response.writeHead(500, {
                                'Content-Type': 'application/json'
                            });
                            response.end(JSON.stringify({
                                status: 500,
                                message: "Error en consulta Oracle",
                                detailed_message: err.message
                            }));
                        } else {
                            
                            
                            if (JSON.stringify(result.outBinds.OUT_CHECKAPP)  == '"OK_TRANSFER"') {
                                console.log("get GetCheckFarCarrito enc camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP));
                                GetCampCarrito(request, response);                        
                            } 
                            else {
                                const outchecke = (result.outBinds.OUT_CHECKAPP);                            
                                const checkfare = "Consulta Realizada, "  + outchecke;
                                response.writeHead(200, {
                                  'Content-Type': 'application/json'
                                });
                                console.log("get GetCheckFarCarrito idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP));
                                response.end(JSON.stringify({
                                metadata: "Servicio Campana-Farmacia",
                                description: "listado de campanas a farmacia",
                                response : checkfare }));
                            }
                        }
                        doRelease(connection);
                    }
                );
            });
        } 




    function GetCampApptransfer (request, response) {
    var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
            connection.execute("SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPAPPTRANSFER UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPAPPTRANSFER_CLI WHERE IDFARMACIA =:idcli", [idcli], {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                    console.log('Servicio... GetCampApptransfer|idfarm: ' + idcli + ' ['+ datesys + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas a farmacia",
                            rows: result.rows}));
                    } else {
                        response.end(JSON.stringify({
                        metadata: "Servicio Campana-Farmacia",
                        description: "listado de campanas a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    } 

    function GetCampFanasis (request, response) {
    var idcli = request.params.idcli;
      var datesys = new Date();
      handleDatabaseOperation(request, response, function(request, response, connection) {
         connection.execute("SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPFANASIS UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPFANASIS_CLI WHERE IDFARMACIA =:idcli", [idcli], {
                 maxRows: 30000,
                 outFormat: oracledb.OUT_FORMAT_OBJECT
             },
             function(err, result) {
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
                    console.log('Servicio... GetCampFanasis|idfarm: ' + idcli + ' ['+ datesys + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas a farmacia",
                            rows: result.rows}));
                    } else {
                        response.end(JSON.stringify({
                        metadata: "Servicio Campana-Farmacia",
                        description: "listado de campanas a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                     }
                 }
                 doRelease(connection);
             }
         );
      });
    } 

    function GetCampCarrito (request, response) {
    var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
            connection.execute("SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA FROM TRDATA.ECS_CAMPCARRITO UNION SELECT IDCAMPANA, IDLABORATORIO, NOMBRE, TIPOCAMPANA, ESTATUS, OFERTAOPRECIOFINAL, BASECALCULO, NIVELCALCULO, OBSERVACIONES, ABIERTA, FECHAINI,FECHAFIN, REQUIEREFLUJO, TIPODEFLUJO, MONTOAPROBACION, IDFARMACIA  FROM TRDATA.ECS_CAMPCARRITO_CLI WHERE IDFARMACIA =:idcli", [idcli], {
                    maxRows: 30000,
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                    console.log('Servicio... GetCampCarrito|idfarm: ' + idcli + ' ['+ datesys + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas a farmacia",
                            rows: result.rows}));
                    } else {
                        response.end(JSON.stringify({
                        metadata: "Servicio Campana-Farmacia",
                        description: "listado de campanas a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }     
    
    function ecsclicampanadet (request, response) {
    var idcli = request.params.idcli;
      var datesys = new Date();
      handleDatabaseOperation(request, response, function(request, response, connection) {
         connection.execute("SELECT JSONQ campana FROM TRDATA.ECS_CAMP_DET where idfarmacia =:idcli", [idcli], {
                     outFormat: oracledb.OUT_FORMAT_OBJECT
             },
             function(err, result) {
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
                     console.log('Servicio... ecscampanaDET|idfarm: ' + idcli + ' ['+ datesys + ']' );
                     response.writeHead(200, {
                         'Content-Type': 'application/json'
                     });
                     if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio CampanaDet-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            rows: result.rows}).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                     response.end(JSON.stringify({
                        metadata: "Servicio CampanaDet-Farmacia",
                        description: "listado de campanas-detalle a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                     }
                 }
                 doRelease(connection);
             }
         );
      });
    }     
    

    function getswitchappdet (request, response) {
        //console.log(request.params.idori);
        switch (request.params.idori) {
            case "1" :
                console.log("get det app: AppTransfer");
                GetCampDetApptransfer(request, response);
            break;
            case "2" :
                console.log("get det app: Fanasis");
                GetCheckFardetFanasis(request, response);
            break;
            case "3" :
                console.log("get det app: Carrito");
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
                    response : "IdOrigen no encontrado" 
                }));
            break;
        }
    }


    function GetCheckFardetFanasis (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {    
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute(" BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;", {
                                    idcli : request.params.idcli,
                                    OUT_CHECKAPP: {  type: oracledb.STRING , dir: oracledb.BIND_OUT  }
                                    } ,
                    {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                    },
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {
                        
                        
                        if (JSON.stringify(result.outBinds.OUT_CHECKAPP)  == '"OK_TRANSFER"') {
                            console.log("get GetCheckFardetFanasis det camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                            GetCampDetFanasis(request, response);                        
                        } 
                        else {
                            const outcheck = (result.outBinds.OUT_CHECKAPP);                            
                            const checkfar = "Consulta Realizada, "  + outcheck;
                            response.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            console.log("get GetCheckFardetFanasis idfar: " + idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                            response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            response :  checkfar }));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    } 



    function GetCheckFardetCarrito (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {    
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute(" BEGIN  TRAPP.SEGURIDAD.ECS_GETFARMACIA_TRANSFER (:idcli,:OUT_CHECKAPP ); END;", {
                                    idcli : request.params.idcli,
                                    OUT_CHECKAPP: {  type: oracledb.STRING , dir: oracledb.BIND_OUT  }
                                    } ,
                    {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                    },
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {
                        
                        
                        if (JSON.stringify(result.outBinds.OUT_CHECKAPP)  == '"OK_TRANSFER"') {
                            console.log("get GetCheckFardetCarrito det camp idfar: "+ idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                            GetLPcampDetCarrito(request, response);                        
                        } 
                        else {
                            const outcheck = (result.outBinds.OUT_CHECKAPP);                            
                            const checkfar = "Consulta Realizada, "  + outcheck;
                            response.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            console.log("get GetCheckFardetCarrito idfar: " + idcli+ " | " + JSON.stringify(result.outBinds.OUT_CHECKAPP) + " | "+ datesys);
                            response.end(JSON.stringify({
                            metadata: "Servicio Campana-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            response :  checkfar }));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    } 




    function GetCampDetApptransfer (request, response) {
    var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
            connection.execute("SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPAPPTRANSFERDET UNION SELECT JSONQ campana FROM TRDATA.ECS_CAMPAPPTRANSFERDET_CLI where idfarmacia =:idcli", [idcli], {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                        console.log('Servicio... GetCampDetApptransfer|idfarm: ' + idcli + ' ['+ datesys + ']' );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio CampanaDet-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            rows: result.rows}).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                        response.end(JSON.stringify({
                        metadata: "Servicio CampanaDet-Farmacia",
                        description: "listado de campanas-detalle a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }   

    function GetCampDetFanasis (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute("SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPFANASISDET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPFANASISDET_CLI where idfarmacia =:idcli", [idcli], {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                        console.log('Servicio... GetCampDetFanasis|idfarm: ' + idcli + ' ['+ datesys + ']' );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio CampanaDet-Farmacia",
                            description: "listado de campanas-detalle a farmacia",
                            rows: result.rows}).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                        response.end(JSON.stringify({
                        metadata: "Servicio CampanaDet-Farmacia",
                        description: "listado de campanas-detalle a farmacia",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }   



    function GetLPcampDetCarrito (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
 
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute(" BEGIN  TRAPP.SEGURIDAD.ECS_GETCAMPDETCARRITO (:idcli,:OUTAPPLISTA ); END;", {
                                      idcli : request.params.idcli,
                                      OUTAPPLISTA: {  type: oracledb.STRING , dir: oracledb.BIND_OUT  }
                                   } ,
                      {
                          outFormat: oracledb.OUT_FORMAT_OBJECT
                      },
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement 3  ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {

                        
                        if (JSON.stringify(result.outBinds.OUTAPPLISTA)  == '"OK"') {
                          console.log("get det listaPrecio: APPTRANSFER");
                          GetCampDetCarritolistaAppT(request, response);                        
                        } else {
                          console.log("get det listaPrecio: Otros");
                          GetCampDetCarritoListaOtros(request, response);
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }   


    function GetCampDetCarritoListaOtros (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute("SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET_CLI where idfarmacia =:idcli", [idcli], {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                        console.log('Servicio... GetCampDetCarritoListaOtros|idfarm: ' + idcli + ' ['+ datesys + ']' );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        if (result.rows.length) {
                        response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                        response.end(JSON.stringify({
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }  

    function GetCampDetCarritolistaAppT (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
        oracledb.fetchAsString = [ oracledb.CLOB ];
            connection.execute("SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPCARRITODET_LP WHERE IDFARMACIA = :idfarm UNION ALL SELECT JSONQ CAMPANA FROM TRDATA.ECS_CAMPCARRITODET_CLI_LP WHERE IDFARMACIA = :idfarm", 
            {
             idfarm : request.params.idcli
            }
            , {            
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement GetCampDetCarritolistaAppT  ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {
                        console.log('Servicio... GetCampDetCarritolistaAppT |idfarm: ' + idcli + ' ['+ datesys + ']' );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        if (result.rows.length) {
                        response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                        response.end(JSON.stringify({
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }  

    
    function GetCampDetCarrito (request, response) {
        var idcli = request.params.idcli;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
        oracledb.fetchAsString = [ oracledb.CLOB ];
            //connection.execute("SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET UNION ALL SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET_CLI where idfarmacia =:idcli", [idcli], {
            connection.execute("SELECT JSONQ campana FROM TRDATA.ECS_CAMPCARRITODET_ALL where idfarmacia =:idcli", [idcli], {
            //connection.execute("            SELECT FAR.IDFARMACIA, JSON_OBJECT ( 'IDCAMPANA' VALUE CAMP.IDCAMPANA, 'TIPOCAMPANA' VALUE CAMP.TIPOCAMPANA, 'OFERTA_O_PF' VALUE CAMP.OFERTAOPRECIOFINAL, 'CONFIG_CAMP' VALUE JSON_ARRAYAGG ( CASE WHEN ( FAR.CATEGORY_CODE = 'PRECIO NETO' AND PL.IDLISTAPRECIO = 831770)             THEN                 JSON_OBJECT (                     'IDARTICULO' VALUE VALRAN.IDARTICULO,                     'LIMINF_RANGO' VALUE RAN.LIMINF,                     'LIMSUP_RANGO' VALUE RAN.LIMSUP,                     'VALOR_RANGO' VALUE VALRAN.VALOR,                     'IDCONSECUTIVO' VALUE VALRAN.IDCONSECUTIVO,                                  'PRECIO' VALUE PL.PRECIOFARMACIA,                     'IDARTICULO' VALUE LIS.IDARTICULO,                     'VALOR_LISTA' VALUE LIS.VALOR,                                  'PRECIO' VALUE PL.PRECIOFARMACIA,                                      'IDARTICULO' VALUE COT.IDARTICULO,                                      'MINIMO_ACOTA' VALUE COT.MINIMO,                                      'MAXIMO_ACOTA' VALUE COT.MAXIMO,                                      'PIEZAS_ACOTA' VALUE COT.PIEZAS,                                                                    'PRECIO' VALUE PL.PRECIOFARMACIA,                                      'IDCONSECUTIVO' VALUE COM.IDCONSECUTIVO,                                      'NOMBRE' VALUE CEN.NOMBRE,                                      'TIPO_COMBO' VALUE COM.TIPOCOMBO,                                                                    'PRECIO' VALUE PL.PRECIOFARMACIA,                                      'IDARTICULO' VALUE CDT.IDARTICULO,                                      'PIEZASCONCARGO' VALUE CDT.PIEZASCONCARGO,                                      'PIEZASSINCARGO' VALUE CDT.PIEZASSINCARGO,                                      'OFERTA_COMBO' VALUE CDT.OFERTA,                                      'PRECIO' VALUE PL.PRECIOFARMACIA                                      ABSENT ON NULL                                      RETURNING CLOB)                              ELSE                                  JSON_OBJECT (                                      'IDARTICULO' VALUE VALRAN.IDARTICULO,                                      'LIMINF_RANGO' VALUE RAN.LIMINF,                                      'LIMSUP_RANGO' VALUE RAN.LIMSUP,                                      'VALOR_RANGO' VALUE VALRAN.VALOR,                                      'IDCONSECUTIVO' VALUE VALRAN.IDCONSECUTIVO,                                      'IDARTICULO' VALUE LIS.IDARTICULO,                                      'VALOR_LISTA' VALUE LIS.VALOR,                                      'IDARTICULO' VALUE COT.IDARTICULO,                                      'MINIMO_ACOTA' VALUE COT.MINIMO,                                      'MAXIMO_ACOTA' VALUE COT.MAXIMO,                                      'PIEZAS_ACOTA' VALUE COT.PIEZAS,                                      'IDCONSECUTIVO' VALUE COM.IDCONSECUTIVO,                                      'NOMBRE' VALUE CEN.NOMBRE,                                      'TIPO_COMBO' VALUE COM.TIPOCOMBO,                                      'IDARTICULO' VALUE CDT.IDARTICULO,                                      'PIEZASCONCARGO' VALUE CDT.PIEZASCONCARGO,                                      'PIEZASSINCARGO' VALUE CDT.PIEZASSINCARGO,                                      'OFERTA_COMBO' VALUE CDT.OFERTA,                                      'PRECIO' VALUE 'NULL'                                      ABSENT ON NULL                                      RETURNING CLOB)                          END                          RETURNING CLOB)                  RETURNING CLOB)                  JSONQ         FROM TRDATA.CAMP_ENC CAMP              JOIN TRDATA.CAMP_APPVENTA AV ON CAMP.IDCAMPANA = AV.IDCAMPANA              LEFT JOIN TRDATA.CAMP_FARMACIA CUS                  ON CAMP.IDCAMPANA = CUS.IDCAMPANA              LEFT JOIN TRDATA.CAMP_RANGO RAN ON CAMP.IDCAMPANA = RAN.IDCAMPANA              LEFT JOIN TRDATA.CAMP_VALOR VALRAN                  ON     RAN.IDCAMPANA = VALRAN.IDCAMPANA                     AND RAN.IDCONSECUTIVO = VALRAN.IDCONSECUTIVO              LEFT JOIN TRDATA.CAMP_ARTICULO_LISTA LIS                  ON CAMP.IDCAMPANA = LIS.IDCAMPANA              LEFT JOIN TRDATA.CAMP_ARTICULO_COTA COT                  ON CAMP.IDCAMPANA = COT.IDCAMPANA              LEFT JOIN TRDATA.CAMP_COMBO COM ON CAMP.IDCAMPANA = COM.IDCAMPANA              LEFT JOIN TRDATA.CAMP_COMBO_DET CDT                  ON     COM.IDCAMPANA = CDT.IDCAMPANA                     AND COM.IDCONSECUTIVO = CDT.IDCONSECUTIVO              LEFT JOIN TRDATA.CAMP_ENC CEN ON COM.IDCAMPANA = CEN.IDCAMPANA              LEFT JOIN TRERP.LISTAPRECIO_AT PL                  ON    VALRAN.IDARTICULO = PL.IDARTICULO                     OR LIS.IDARTICULO = PL.IDARTICULO                     OR COT.IDARTICULO = PL.IDARTICULO                     OR CDT.IDARTICULO = PL.IDARTICULO              LEFT JOIN TRERP.FARMACIAS_TRANSFER FAR                  ON PL.IDLISTAPRECIO = FAR.IDLISTAPRECIOS        WHERE     CAMP.ESTATUS = 'ACTIVA'              AND TRUNC (CAMP.FECHAINI) <= TRUNC (SYSDATE)              AND TRUNC (CAMP.FECHAFIN) >= TRUNC (SYSDATE)              AND AV.IDAPPVENTA = 3              AND AV.FLAG = 1              AND FAR.IDFARMACIA = :idcli              AND NVL (CUS.FLAG, 1) NOT IN ('0')              AND FAR.ESTATUS = 'A'                    GROUP BY FAR.IDFARMACIA,              CAMP.IDCAMPANA,              CAMP.TIPOCAMPANA,              CAMP.OFERTAOPRECIOFINAL", [idcli], {
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                function(err, result) {
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
                        console.log('Servicio... GetCampDetCarrito|idfarm: ' + idcli + ' ['+ datesys + ']' );
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        if (result.rows.length) {
                        response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                    } else {
                        response.end(JSON.stringify({
                        response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    } 


    function test (request, response) {
      var idcli = request.params.idcli;
      var datesys = new Date();
      handleDatabaseOperation(request, response, function(request, response, connection) {
         connection.execute("SELECT JSONQ FROM TRDATA.ECS_CAMP_DET where idfarmacia =:idcli", [idcli], {
                                 outFormat: oracledb.OUT_FORMAT_OBJECT
                                 //fetchInfo: {"DATA": {type: oracledb.STRING } }
             },
             function(err, result) {
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
                     response.writeHead(200, {
                                'Content-Type': 'application/json'
                               });                               
                    
                                 if (result.rows.length) {
                                 
                                   /* for (var i = 0; i < result.rows.length; i++) {
                                   console.log("rows: " + result.rows[i][0]);
                                   js = JSON.parse(result.rows[i][0]);
                                   console.log('rows: ' + JSON.stringify(js));
                                   response.write( JSON.stringify(js));                                                                
                                   } */
                                   var xs = JSON.stringify({rows : result.rows});
                                   console.log(xs);
                                   var json = '{"line":[{"type":"bank","name":"ABN","account":"NL47ABNA0442660960","description":"Bijgewerkt t\/m 30-10-2014","balance":"6.266,55","image":""},{"type":"bank","name":"Rabo","account":"NL89RABO0177896647","description":"","balance":"0,00","image":""}],"total":"6.266,55"}';
                                   var obj = JSON.parse(xs);
                                   console.log(obj.rows[key]);
                                   // json object contains two properties: "line" and "total".
                                   // iterate "line" property (which is an array but that can be iterated)
                                   for (var key in obj.rows) {
                                       // key here is the index of line array
                                       //result.innerHTML += "<br/>" + key + ": ";
                                        console.log(key);
                                        for (var prop in obj.rows[key]) {
                                            // prop here is the property
                                            // obj.line[key][prop] is the value at this index and for this prop
                                            console.log( prop + " = " + obj.rows[key][prop]);
                                        }
                                       
                                   }
                                response.end(JSON.stringify(result.rows).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                                } else {
                                  console.log('No rows fetched');
                                  response.end( JSON.stringify({ rows: 'No rows fetched'}));
                                }
                    }
                 doRelease(connection);
             }
         );
      });
    }         
    

    function artbloqueado (request, response) {   
        var idfar = request.params.idfar;
        var datesys = new Date();       
           handleDatabaseOperation(request, response, function(request, response, connection) {
                 connection.execute("select id as idarticulo from trerp.articulobloqueado  where idfarmacia =:idfar ", [idfar], {
                       maxRows: 30000,
                       outFormat: oracledb.OUT_FORMAT_OBJECT
                   },
                   function(err, result) {
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
                           console.log('Servicio... Artbloqueado |idfar:'+ idfar + ' ['+ datesys + ']' );
                           response.writeHead(200, {
                               'Content-Type': 'application/json'
                           });
                        if (result.rows.length) {
                            response.end(JSON.stringify({
                                metadata: "Servicio Articulo Bloqueado",
                                description: "listado de articulos para la no venta por farmacia",
                                rows: result.rows}));
                        } else {
                           response.end(JSON.stringify({
                            metadata: "Servicio Articulo Bloqueado",
                            description: "listado de articulos para la no venta por farmacia",
                            response : "Consulta Realizada, No se han obtenido filas."}));
                           }
                       }
                       doRelease(connection);
                   }
               );
    
           });
       }
       ////////////////////////////////////////////////////////
    

    function obtlistapreciofar (request, response) {
        var idfar = request.params.idfar;
        var fecha = new Date();
        ///*+ PARALLEL(4) */
         handleDatabaseOperation(request, response, function(request, response, connection) {
             connection.execute("SELECT  IDLISTAPRECIO, IDARTICULO, PRECIO,IVA,IDCAMPANA,IDFARMACIA FROM TRERP.ECS_FARMPRECIODESCUENTO WHERE IDFARMACIA = :idfar  ", [idfar], {
                     maxRows: 30000,
                     outFormat: oracledb.OUT_FORMAT_OBJECT
                 },
                 function(err, result) {
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
                         console.log('Servicio... obtlistapreciofar|idFar: '+ idfar +  '|['+ fecha + ']');
                         response.writeHead(200, {
                             'Content-Type': 'application/json'
                         });
                         if (result.rows.length) {
                            response.end(JSON.stringify({
                                metadata: "Servicio Lista Precios",
                                description: "listado de precios por Farmacia",
                                rows: result.rows}));
                         } else { 
                         response.end(JSON.stringify({
                            metadata: "Servicio Lista Precios",
                            description: "listado de precios por Farmacia",
                            response : "Consulta Realizada, No se han obtenido filas." }));
                         }
                     }
                     doRelease(connection);
                 }
             );
  
         });
     } 
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function obtcatlistaprecio (request, response) {
        var fecha = new Date();        
            handleDatabaseOperation(request, response, function(request, response, connection) {
                connection.execute("SELECT IDLISTAPRECIO, IDARTICULO, PRECIO FROM TRERP.ECS_CATLISTAPRECIO", [], {
                        maxRows: 30000,
                        outFormat: oracledb.OUT_FORMAT_OBJECT
                    },
                    function(err, result) {
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
                            console.log('Servicio... catlistaprecio |['+ fecha + ']');
                            response.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            if (result.rows.length) {
                                response.end(JSON.stringify({
                                metadata: "Servicio Lista Precios",
                                description: "listado de precios AppTransfer",
                                rows: result.rows}));
                            } else {
                                response.end(JSON.stringify({
                                    metadata: "Servicio Lista Precios",
                                    description: "listado de precios AppTransfer",
                                    response : "Consulta Realizada, No se han obtenido filas."}));
                            }
                        }
                        doRelease(connection);
                    }
                );
    
            });
        } 
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

   function detpedidoseg (request, response) {   
    var idpedido = request.params.idpedido; 
       handleDatabaseOperation(request, response, function(request, response, connection) {
             connection.execute("SELECT SE.IDPEDIDO,IDARTICULO,IDPEDPORTAL,IDPEDERP,NUMFACTURA,SE.CANTIDAD,ESTATUS,PRECIOFACTURA,SE.OFERTA,DESCUENTO,IVA,IEPS,CANTSURTIDA,SUBTOTALFACT,FECHAPEDPORTAL,FECHAPEDERP, DE.IDCAMPANA FROM TRDATA.PEDIDORESPUESTADET SE JOIN TRDATA.PEDIDOAPPDET DE ON SE.IDPEDIDO = DE.IDPEDIDO AND SE.IDARTICULO = DE.IDPRODUCTO WHERE SE.IDPEDIDO = :pedido ", [idpedido], {
                   maxRows: 30000,
                   outFormat: oracledb.OUT_FORMAT_OBJECT
               },
               function(err, result) {
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
                       console.log('Servicio... detpedidoseg:' + idpedido );
                       response.writeHead(200, {
                           'Content-Type': 'application/json'
                       });
                       if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Seguimiento Pedido",
                            description: "Seguimiento de pedido, detalle de articulos facturados, estatus",
                            rows: result.rows}));
                       } else { 
                        response.end(JSON.stringify({
                            metadata: "Servicio Seguimiento Pedido",
                            description: "Seguimiento de pedido, detalle de articulos facturados, estatus",
                            response : "Consulta Realizada, No se han obtenido filas."}));
                       }
                   }
                   doRelease(connection);
               }
           );

       });
   }

   
   ////////////Consulta Pedido Encabezado
   function conspedidoenc (request, response) {
    var currentTime = new Date();
    var idped = request.params.idped;
    handleDatabaseOperation(request, response, function(request, response, connection) {
        connection.execute("select IDPEDIDOAPP, IDUSERAPP, FARMACIA, NUMCUENTA, FECHA, PIEZAS, MONTO, ESTATUS, KEYPEDIDO from trdata.PEDIDOAPP where IDPEDIDO =:idped", [idped], {
                maxRows: 30000,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            },
            function(err, result) {
                if (err) {
                    console.log('Error in execution of select statement : ' + err.message);
                    response.writeHead(500, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        status: 500,
                        message: "Error en consulta Oracle",
                        detailed_message: err.message
                    }));
                } else {
                    console.log('Servicio... pedidoenc|IdPedido: ' + idped+ ' |['+ currentTime + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    if (result.rows.length){
                    response.end(JSON.stringify({
                        metadata: "Servicio Pedido Encabezado",
                        description: "Retorna pedido a nivel encabezado",
                        rows: result.rows}));
                    }
                    else {
                    response.end(JSON.stringify({
                        metadata: "Servicio Pedido Encabezado",
                        description: "Retorna pedido a nivel encabezado",
                        response : "Consulta Realizada, No se han obtenido filas."}));
                    }                     
                }
                doRelease(connection);
            }
        );

    });
    }

    ////////////Consulta Pedido ESTATUS por cliente zona
    function pedidoestatuscli (request, response) {
    var currentTime = new Date();
    var vzona = request.params.zona;
    handleDatabaseOperation(request, response, function(request, response, connection) {
        connection.execute("SELECT PE.IDPEDIDO, PE.ESTATUS FROM TRDATA.PEDIDOAPP PE JOIN TRERP.FARMACIAS_TRANSFER FT ON PE.NUMCUENTA = FT.IDFARMACIA WHERE FT.ZONA = :vzona", [vzona], {
                maxRows: 30000,
                outFormat: oracledb.OUT_FORMAT_OBJECT
            },
            function(err, result) {
                if (err) {
                    console.log('Error in execution of select statement:  ' + err.message);
                    response.writeHead(500, {
                        'Content-Type': 'application/json'
                    });
                    response.end(JSON.stringify({
                        status: 500,
                        message: "Error en consulta Oracle",
                        detailed_message: err.message
                    }));
                } else {
                    console.log('Consulta PedEstatus... vzona:' + vzona + ' ['+ currentTime + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });

                    if (result.rows.length){                        
                        response.end(JSON.stringify({
                            metadata: "Servicio Estatus de Pedidos",
                            description: "Retorna listado de estatus de pedidos por Farmacia-Zona",                            
                            rows: result.rows}));                    
                    }
                    else {
                        response.end(JSON.stringify({
                            metadata: "Servicio Estatus de Pedidos",
                            description: "Retorna listado de estatus de pedidos por Farmacia-Zona",
                            response : "Consulta Realizada, No se han obtenido filas."}));                    
                    }                
                }
                doRelease(connection);
            }
        );
    });
    }
    
    /////////////////////////////////////////////////////////////////////Registra Pedido ECS ///////////////////////////////////////////////////////////////////

    function ecsenviopedido(request, response) {
        handleDatabaseOperation(request, response, function(request, response, connection) {
            oracledb.fetchAsString = [ oracledb.CLOB ];
            const fulljson = JSON.stringify(request.body.pedido);
                connection.execute("BEGIN                                                                 \n\
                                TRAPP.PEDIDO_ADD_ALL.PEDIDO_ADD_ECS(:pedido,:key,:respuesta);              \n\
                                    END;",                                                         
                {
                    pedido: fulljson,                                
                    key: request.body.key,                                
                    respuesta: {  type: oracledb.VARCHAR2, dir: oracledb.BIND_OUT  }
                }                             
                , {
                    maxRows: 30000
                },
            function(err, result) {
            if (err) {
                console.log('Error in execution of select statement : PEDIDO_ADD_ECS' + err.message);
                response.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    status: 500,
                    message: "Error en consulta Oracle",
                    detailed_message: err.message
                    }));
            } else {
                console.log('Servicio... PEDIDO_ADD_ECS | idpedido: ' + JSON.stringify(result.outBinds) );
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    metadata: "Servicio Envio de Pedidos AppTransfer",
                    description: "Retorna IdPedido AppTransfer",
                    status: "OK",
                    idpedido: result.outBinds.respuesta}));
            }
                doRelease(connection);
            });
        });
    } //
    
      function history (request, response) {
      var vzona = request.params.vzona;
        var datesys = new Date();
        handleDatabaseOperation(request, response, function(request, response, connection) {
            oracledb.fetchAsString = [ oracledb.CLOB ];
           connection.execute("SELECT PED.IDPEDIDO, PED.ESTATUS , PALL.JSON_DATA as PEDIDO, PALL.KEY FROM TRDATA.PEDIDOAPP PED JOIN TRDATA.PEDIDO_ALL_JSON PALL ON PED.IDPEDIDO = PALL.IDPEDIDO JOIN TRERP.FARMACIAS_TRANSFER FT ON PED.NUMCUENTA = FT.IDFARMACIA WHERE   PED.ESTATUS IS NOT NULL AND FT.ZONA = :vzona", [vzona], {
                   outFormat: oracledb.OUT_FORMAT_OBJECT,
                   maxRows: 30000
               },
               function(err, result) {
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
                       response.writeHead(200, {
                           'Content-Type': 'application/json'
                       });
                       console.log('Servicio... Historicopedido, zona: ' + vzona + '| ['+ datesys + ']' );                       
                       if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Historico",
                            description: "listado pedidos creados",
                            rows: result.rows}).replace(/\\"/g, '"').replace(/\"{/g, '{').replace(/\}"/g, '}'));
                      } else {
                       response.end(JSON.stringify({
                          metadata: "Servicio Historico",
                          description: "listado pedidos creados",
                          response : "Consulta Realizada, No se han obtenido filas."}));
                      }
                   }
                   doRelease(connection);
               }
           );
        });
      }

    function topventas (request, response) {
        //console.log(request.params.idori);
        var fechainicio = new Date(request.params.fechaini).getTime();
        var fechafin    = new Date(request.params.fechafin).getTime();
        var dif = (fechafin - fechainicio);
        var dias = (Math.abs(Math.trunc(dif/(1000*60*60*24))));
        //console.log(dias);
        if (dias > 90) {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({
                metadata: "Servicio Top + vendidos",
                description: "listado de articulos top vendidos",
                response : "El rango de fechas de consulta excede los 3 meses permitidos (90 dias)" 
            }));
            
        }   else {
            console.log("get topventas");
                Gettopventas(request, response);
        }
    }

    function Gettopventas (request, response) {
        var ini = request.params.fechaini;
        var fin = request.params.fechafin;
        var datest = ini.replace(/"/g, "'");
        var dateend = fin.replace(/"/g, "'"); 
        var datesys = new Date();
        var sql = "SELECT IDARTICULO, CANTIDAD FROM ( SELECT IDARTICULO, SUM(SEG.CANTIDAD) AS CANTIDAD FROM TRDATA.PEDIDORESPUESTADET SEG WHERE FECHAPEDERP BETWEEN TO_DATE (" + datest + ", 'YYYY-MM-DD') AND TO_DATE (" + dateend + ", 'YYYY-MM-DD') GROUP BY SEG.IDARTICULO ORDER BY SUM(SEG.CANTIDAD) DESC ) WHERE ROWNUM <= 50";
        //console.log(sql);
        handleDatabaseOperation(request, response, function(request, response, connection) {
        connection.execute(sql, 
                []
                , {
                outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement: ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {
                    console.log('Servicio... Gettopventas| ['+ datesys + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    if (result.rows.length) {
                        response.end(JSON.stringify({
                            metadata: "Servicio Top + vendidos",
                            description: "listado de articulos top vendidos",
                            rows: result.rows}));
                    } else {
                        response.end(JSON.stringify({
                            metadata: "Servicio Top + vendidos",
                            description: "listado de articulos top vendidos",
                            response : "Consulta Realizada, No se han obtenido filas."}));
                        }
                    }
                    doRelease(connection);
                }
            );
        });
    }
    
    
    function ValDateActCamp (request, response) {       
        if (request.query.fecha == null) {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify({
                metadata: "Servicio campa�as actualizadas",
                description: "valida campa�as actualizadas",
                response : "Error envio de RAW JSON" 
            }));
            
        }   else {        
            //const vfecha = JSON.stringify(request.body.fecha);    
            var xx = JSON.parse(request.query.fecha);
            //var xx = request.query.fecha;
            console.log(xx);
            const regexExpdate = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            const resdate = regexExpdate.test(xx);
                    console.log(resdate);
                    if (resdate === true) {                        
                        GetCampanasActualizadas(request,response);
                    } else {
                       
                        response.writeHead(412, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            metadata: "Servicio campa�as actualizadas",
                            status:"error",
                            response : {"message":"Error: Fecha", "detail":"Es necesario validar el formato de fecha; ejemplo : '2024-03-01 15:02:23' "}
                        }));                     
                    }
           
        }
    }
    
    function GetCampanasActualizadas (request, response) {
        var datesys = new Date();        
        //console.log(sql);
        handleDatabaseOperation(request, response, function(request, response, connection) {
        //connection.execute("SELECT SUM (CAMP) ALLCAMP FROM (SELECT COUNT(*) CAMP FROM TRDATA.CAMP_ENC CAMP WHERE (CAMP.ESTATUS = 'ACTIVA' AND CAMP.CAMPCLIENTE = 'NO' AND CAMP.FECHACREACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE - INTERVAL '5' SECOND)) OR (CAMP.ESTATUS = 'INACTIVO' AND CAMP.CAMPCLIENTE = 'NO' AND CAMP.FECHACREACION <> CAMP.ULTIMAMODDIFICACION AND CAMP.ULTIMAMODDIFICACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE)) OR (CAMP.ESTATUS = 'ACTIVA' AND CAMP.CAMPCLIENTE = 'NO' AND CAMP.FECHACREACION <> CAMP.ULTIMAMODDIFICACION AND CAMP.ULTIMAMODDIFICACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE)) UNION ALL SELECT COUNT(*) CAMP FROM TRDATA.CAMP_ENC CAMP JOIN TRDATA.CAMP_FARMACIA CFA ON CAMP.IDCAMPANA = CFA.IDCAMPANA WHERE (CAMP.ESTATUS = 'ACTIVA' AND CAMP.CAMPCLIENTE = 'SI' AND CAMP.FECHACREACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE - INTERVAL '5' SECOND) AND CFA.IDFARMACIA = :vidfar ) OR (CAMP.ESTATUS = 'INACTIVO' AND CAMP.CAMPCLIENTE = 'SI' AND CAMP.FECHACREACION <> CAMP.ULTIMAMODDIFICACION AND CAMP.ULTIMAMODDIFICACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE) AND CFA.IDFARMACIA = :vidfar ) OR (CAMP.ESTATUS = 'ACTIVA' AND CAMP.CAMPCLIENTE = 'SI' AND CAMP.FECHACREACION <> CAMP.ULTIMAMODDIFICACION AND CAMP.ULTIMAMODDIFICACION BETWEEN TO_DATE(:vdate,'YYYY-MM-DD HH24:MI:SS') AND (SYSDATE) AND CFA.IDFARMACIA = :vidfar ) ) T1", 
        connection.execute("BEGIN TRAPP.SEGURIDAD.ECS_GETCAMPANASACT (:vdate, :vidfar, :respuesta ); END;",
                {
                    vdate: JSON.parse(request.query.fecha),
                    vidfar: request.query.idfarmacia,
                    respuesta: { dir: oracledb.BIND_OUT,
                 type: oracledb.STRING, 
                 maxSize: 32767 }
                 }
                , {
                outFormat: oracledb.OUT_FORMAT_OBJECT
                },
                
                function(err, result) {
                    if (err) {
                        console.log('Error in execution of select statement: ' + err.message);
                        response.writeHead(500, {
                            'Content-Type': 'application/json'
                        });
                        response.end(JSON.stringify({
                            status: 500,
                            message: "Error en consulta Oracle",
                            detailed_message: err.message
                        }));
                    } else {
                    console.log('Servicio... GetCampanasActualizadas| ['+ datesys + ']' );
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    
                    
                        response.end(JSON.stringify({
                            metadata: "Servicio Actualizacion de Campa�as",
                            description: "listado para validar campa�as nuevas e inactivas",
                            response : result.outBinds.respuesta
                            }));
                    
                    }
                    doRelease(connection);
                }
            );
        });
    }

    app.use((req, res, next) => {
        const ip = req.ip;
        clientes[ip].tiempoUltimoPeticion = Date.now();
        next();
    });

    setInterval(() => {
        const ahora = Date.now();
        console.log( Date() + ' | Start job setInterval');
        Object.keys(clientes).forEach((ip) => {
            if (ahora - clientes[ip].tiempoUltimoPeticion > 20000) { // 1 minuto
            console.log(Date()+` | ${ip} | Destruyendo conexion` + ' | setInterval');
            clientes[ip].socket.destroy();
            delete clientes[ip];
            }
        });
    }, 35000); // Verificar cada segundo
    
    



function doRelease(connection) {
    connection.close(
        function(err) {
            if (err) {
                console.error(err.message);
            }
        });
}

    
    
    
