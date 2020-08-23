/// <reference path="./node_modules/@types/jquery/index.d.ts"/>
$(document).ready(function () {
    ActualizarTelefonos();
    //Reset a las configuraciones de busqueda
    localStorage.setItem("configuracionDeBusqueda", JSON.stringify({ "busquedaReciente": "false", "camposValidos": "" }));
    //Limpiar el formulario de alta/modificacion de telefonos
    $("#btnAgregarTelefono").on("click", function () {
        $("#btnAceptarModal").attr("onclick", "AceptarModal()");
        $("#txtNumero").removeAttr("readonly");
        $("#encabezadoModal").html("Agregar Telefono");
        $("#btnAceptarModal").val("Agregar");
        //$("#cboCircunstancia").removeAttr("disabled");
        $("#txtDescripcion").removeAttr("readonly");
        $("#btnReset").click();
    });
    $("#btnListaDeTelefonos").on("click", ActualizarTelefonos);
    $("#btnBuscar").on("click", function () {
        $("#btnAceptarModal").attr("onclick", "AceptarModal()");
        $("#txtNumero").removeAttr("readonly");
        $("#encabezadoModal").html("Buscar Telefono");
        $("#btnAceptarModal").val("Buscar");
        $("#btnReset").click();
        //$("#cboCircunstancia").attr("disabled", "true");
        $("#txtDescripcion").attr("readonly", "true");
    });
    $("#btnAceptarModal").attr("onclick", "AceptarModal()");
    $("#btnCerrarSesion").on("click", function () {
        if (confirm("¿Desea cerrar sesión?") == true) {
            localStorage.removeItem("jwt");
            location.href = "./login.html";
        }
    });
    $("#btnOrdenarPorNumero").on("click", OrdenarPorNumero_Ascendente);
    $("#btnOrdenarPorGrupo").on("click", OrdenarPorGrupo_Ascendente);
    $("#btnOrdenarPorTerritorio").on("click", OrdenarPorTerritorio_Ascendente);
    $("#btnOrdenarPorFecha").on("click", OrdenarPorFecha_Descendente);
    $("#btnOrdenarPorRevisita").on("click", OrdenarPorRevisita_Ascendente);
    $("#btnOrdenado");
    $("#btnVerEventos").on("click", VerEventos);
    $("#btnEstadisticas").on("click", MostrarEstadisticas);
    $("#btnResetLista").on("click", function () {
        localStorage.setItem("configuracionDeBusqueda", JSON.stringify({ "busquedaReciente": "false" }));
        ActualizarTelefonos();
    });
    $("#btnCerrarModal").on("click", function () {
        $("#divAlertas").hide();
    });
    $("#btnCancelarModal").on("click", function () {
        $("#divAlertas").hide();
    });
});
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}
function ActualizarTelefonos() {
    $.ajax({
        type: "get",
        headers: { "token": localStorage.getItem("jwt") },
        url: "./backend/telefonos",
        dataType: "json"
    })
        .done(function (respuesta) {
        if (respuesta.tabla.length == 0) {
            $("#divListaTelefonos").html('<h4 align="center" id="encabezadoListado">Nada por aqui...</h4><br>');
            localStorage.removeItem("listadoTelefonos");
        }
        else {
            respuesta.tabla = respuesta.tabla.map(function (elemet) {
                elemet.numero = parseInt(elemet.numero);
                elemet.territorio = parseInt(elemet.territorio);
                elemet.grupo = parseInt(elemet.grupo);
                elemet.id = parseInt(elemet.id);
                return elemet;
            });
            localStorage.setItem("listadoTelefonos", JSON.stringify(respuesta.tabla));
            var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
            if (paramBusqueda.busquedaReciente == "true") {
                BuscarTelefono(JSON.parse(paramBusqueda.camposValidos));
            }
            else {
                ActualizarListaTelefonoParametro(respuesta.tabla, "Lista de Telefonos");
            }
        }
    })
        .fail(function (respuesta) {
        if (respuesta.status == 403) {
            alert("Tiempo de sesion expirado. Vuelva a ingresar.");
            location.href = "./login.html";
        }
    });
}
//Trae un telefono (segun ID) del almacenamiento local del cliente
function TraerTelefonoByID_localStorage(id) {
    var listaTelefonos = JSON.parse(localStorage.getItem("listadoTelefonos"));
    var listaTelefonosValido = listaTelefonos.map(function (element) {
        element.numero = parseInt(element.numero);
        element.territorio = parseInt(element.territorio);
        element.grupo = parseInt(element.grupo);
        element.id = parseInt(element.id);
        return element;
    }).filter(function (element) {
        if (element.id == id) {
            return true;
        }
        return false;
    });
    return listaTelefonosValido[0];
}
//Trae lista de telefonos del almacenamiento del cliente con los campos parseados
function TraerListaTelefonos_localStorage() {
    try {
        var listaTelefonos = JSON.parse(localStorage.getItem("listadoTelefonos"));
        listaTelefonos = listaTelefonos.map(function (element) {
            element.numero = parseInt(element.numero);
            element.territorio = parseInt(element.territorio);
            element.grupo = parseInt(element.grupo);
            element.id = parseInt(element.id);
            return element;
        });
        return listaTelefonos;
    }
    catch (Exception) {
        return new Array();
    }
}
//Prepara la ventana modal para realizar la modificacion
function SetModificarTelefono(id) {
    var telefono = TraerTelefonoByID_localStorage(id);
    $("#txtDescripcion").removeAttr("readonly"); //Desabilito el campo de descripcion
    $("#encabezadoModal").html("Modificar Telefono"); //Cambio encabezado de la ventana modal
    //Seteo los campos de la ventana modal
    $("#txtNumero").val(telefono.numero);
    $("#txtNumero").attr("readonly", "true");
    $("#txtRevisita").val(telefono.revisita);
    $("#txtTerritorio").val(telefono.territorio);
    $("#txtGrupo").val(telefono.grupo);
    $("#txtDescripcion").val(telefono.descripcion);
    $("#cboCircunstancia").val(telefono.circunstancia);
    $("#txtDay").val(JSON.parse(telefono.ultimaVez).dia);
    $("#txtMonth").val(JSON.parse(telefono.ultimaVez).mes);
    $("#txtYear").val(JSON.parse(telefono.ultimaVez).anio);
    $("#btnAceptarModal").val("Modificar"); //Cambio letras del boton 
    $("#btnAceptarModal").attr("onclick", 'ModificarTelefono(' + id + ')'); //Cambio la funcion que ejecutara el boton aceptar
}
//Segun el atributo value del boton AceptarModal se haran las correspondientes acciones
function AceptarModal(id) {
    switch ($("#btnAceptarModal").val()) {
        case "Agregar":
            AgregarTelefono();
            break;
        case "Buscar":
            BuscarTelefono();
            break;
    }
}
function ObtenerDatosFormJson() {
    var _a, _b, _c;
    var objJson = JSON.parse("{}");
    objJson.numero = parseInt((_a = $("#txtNumero").val().toString()) !== null && _a !== void 0 ? _a : "0");
    objJson.revisita = $("#txtRevisita").val();
    objJson.territorio = parseInt((_b = $("#txtTerritorio").val().toString()) !== null && _b !== void 0 ? _b : "0");
    objJson.grupo = parseInt((_c = $("#txtGrupo").val().toString()) !== null && _c !== void 0 ? _c : "0");
    objJson.descripcion = $("#txtDescripcion").val();
    objJson.circunstancia = $("#cboCircunstancia").val();
    var dia = parseInt($("#txtDay").val().toString());
    var mes = parseInt($("#txtMonth").val().toString());
    var anio = parseInt($("#txtYear").val().toString());
    if (isNaN(parseInt($("#txtDay").val().toString())))
        dia = 0;
    if (isNaN(parseInt($("#txtMonth").val().toString())))
        mes = 0;
    if (isNaN(parseInt($("#txtYear").val().toString())))
        anio = 0;
    objJson.ultimaVez = JSON.parse('{"dia":' + dia + ',"mes":' + mes + ',"anio":' + anio + '}');
    return objJson;
}
function VerificarCamposInvalidos(objJson) {
    //Validaciones
    var camposInvalidos = new Array();
    if (objJson.numero < 40000000 || objJson.numero > 49999999 || isNaN(objJson.numero))
        camposInvalidos.push("numero (valor fuera de rango)");
    if (objJson.territorio < 1 || objJson.territorio > 200 || isNaN(objJson.territorio))
        camposInvalidos.push("territorio (valor fuera de rango)");
    if (objJson.grupo < 1 || objJson.grupo > 20 || isNaN(objJson.grupo))
        camposInvalidos.push("grupo (valor fuera de rango)");
    if (objJson.ultimaVez.dia < 1 || objJson.ultimaVez.dia > 31 || objJson.ultimaVez.mes < 1 || objJson.ultimaVez.mes > 12 || objJson.ultimaVez.anio < 2019 || objJson.ultimaVez.anio > 2022)
        camposInvalidos.push("fecha de ultima llamada (valores fuera de rango)");
    return camposInvalidos;
}
function AgregarTelefono() {
    var objJson = ObtenerDatosFormJson();
    var camposInvalidos = VerificarCamposInvalidos(objJson);
    if (camposInvalidos.length == 0) {
        var strObjJson = JSON.stringify(objJson);
        $.ajax({
            type: "post",
            url: "./backend/alta",
            headers: { "token": localStorage.getItem('jwt') },
            dataType: "json",
            data: { "obj_Json": strObjJson },
            cache: false,
            async: true
        })
            .done(function (respuesta) {
            //$("#divAlertas").html('<div class="alert alert-success alert-dissmisable">' + respuesta.mensaje + '</div>');
            ActualizarTelefonos();
            $("#modalAvisos").hide();
            alert(respuesta.mensaje);
            $("#btnCerrarModal").click();
        })
            .fail(function (respuesta) {
            if (respuesta.status == 403) {
                alert("Tiempo de sesion expirado. Vuelva a ingresar.");
                location.href = "./login.html";
            }
            Aviso(respuesta.responseJSON.mensaje);
        });
    }
    else {
        var mensajeError = "Error. Los siguientes campos son erroneos: ";
        camposInvalidos.forEach(function (element) {
            mensajeError += ("<br> - " + element);
        });
        Aviso(mensajeError);
    }
}
function EliminarTelefono(id) {
    if (confirm("¿Desea borrar el telefono seleccionado?") == true) {
        var objJson = TraerTelefonoByID_localStorage(id);
        $.ajax({
            //type: "delete",
            //url: "./backend/",
            type: "post",
            url: "./backend/delete",
            headers: { "token": localStorage.getItem('jwt') },
            dataType: "json",
            data: { "id_telefono": id, "obj_Json": JSON.stringify(objJson) },
            cache: false,
            async: true
        })
            .done(function () {
            ActualizarTelefonos();
        })
            .fail(function (respuesta) {
            if (respuesta.status == 403) {
                alert("Tiempo de sesion expirado. Vuelva a iniciar la sesion.");
                location.href = "./login.html";
            }
            alert(respuesta.responseJSON.mensaje);
        });
    }
}
function ModificarTelefono(id) {
    var objJson = ObtenerDatosFormJson();
    var camposInvalidos = VerificarCamposInvalidos(objJson);
    if (camposInvalidos.length == 0) {
        var strObjJson = JSON.stringify(objJson);
        $.ajax({
            //type: "put",
            //url: "./backend/",
            type: "post",
            url: "./backend/modificar",
            headers: { "token": localStorage.getItem('jwt') },
            dataType: "json",
            data: { "id_telefono": id, "obj_Json": strObjJson },
            cache: false,
            async: true
        })
            .done(function () {
            ActualizarTelefonos();
            $("#modalAvisos").hide();
            $("#btnCerrarModal").click();
        })
            .fail(function (respuesta) {
            if (respuesta.status == 403) {
                alert("Tiempo de sesion expirado. Vuelva a ingresar.");
                location.href = "./login.html";
            }
            alert(respuesta.responseJSON.mensaje);
        });
    }
    else {
        var mensajeError = "Error. Los siguientes campos son erroneos: ";
        camposInvalidos.forEach(function (element) {
            mensajeError += ("<br> - " + element);
        });
        Aviso(mensajeError);
    }
}
function BuscarTelefono(camposValidos_param, lsTelefonos_param) {
    if (camposValidos_param === void 0) { camposValidos_param = undefined; }
    if (lsTelefonos_param === void 0) { lsTelefonos_param = undefined; }
    if (lsTelefonos_param == undefined) {
        var telefonos = JSON.parse(localStorage.getItem("listadoTelefonos"));
    }
    else {
        var telefonos = lsTelefonos_param;
    }
    if (camposValidos_param == undefined) //Si no hay campos validos enviados como parametros...
     {
        var objJson = ObtenerDatosFormJson();
        var telefonosValidos = JSON.parse("{}");
        //Buscar campos validos para la busqueda
        var camposValidos = { "numero": 0, "revisita": "invalido", "territorio": 0, "grupo": 0, "fecha": "invalido", "circunstancia": "invalido" };
        //Numero Valido [0]
        if (!isNaN(objJson.numero))
            camposValidos["numero"] = objJson.numero;
        //Revisita Valida [1]
        if (objJson.revisita != "")
            camposValidos["revisita"] = objJson.revisita;
        //Territorio Valido [2]
        if (!isNaN(objJson.territorio))
            camposValidos["territorio"] = objJson.territorio;
        //Grupo Valido [3]
        if (!isNaN(objJson.grupo))
            camposValidos["grupo"] = objJson.grupo;
        //Fecha Valida [4]
        if (!isNaN(objJson.ultimaVez.dia) || !isNaN(objJson.ultimaVez.mes) || !isNaN(objJson.ultimaVez.anio)) {
            if (!(objJson.ultimaVez.dia < 1 || objJson.ultimaVez.dia > 31 || objJson.ultimaVez.mes < 1 || objJson.ultimaVez.mes > 12 || objJson.ultimaVez.anio < 2019 || objJson.ultimaVez.anio > 2022)) {
                objJson.ultimaVez = JSON.parse('{"dia":' + objJson.ultimaVez.dia + ',"mes":' + objJson.ultimaVez.mes + ',"anio":' + objJson.ultimaVez.anio + '}');
                camposValidos["fecha"] = JSON.stringify(objJson.ultimaVez);
            }
        }
        //Circunstancia Valida
        if (objJson.circunstancia != "No Definida")
            camposValidos["circunstancia"] = objJson.circunstancia;
    }
    else { //Si hay...
        camposValidos = camposValidos_param;
    }
    //Buscar telefono/s segun los campos validos
    telefonosValidos = telefonos.filter(function (element) {
        if (camposValidos["numero"] != 0)
            if (element["numero"] != camposValidos["numero"])
                return false;
        if (camposValidos["revisita"] != "invalido")
            if (element["revisita"] != camposValidos["revisita"])
                return false;
        if (camposValidos["territorio"] != 0)
            if (element["territorio"] != camposValidos["territorio"])
                return false;
        if (camposValidos["grupo"] != 0)
            if (element["grupo"] != camposValidos["grupo"])
                return false;
        if (camposValidos["fecha"] != "invalido")
            if (element["ultimaVez"] != camposValidos["fecha"])
                return false;
        if (camposValidos["circunstancia"] != "invalido")
            if (element["circunstancia"] != camposValidos["circunstancia"])
                return false;
        //Si element paso TODOS los parametros
        return true;
    });
    //Parsea todos los datos numericos
    telefonosValidos = telefonosValidos.map(function (elemet) {
        elemet.numero = parseInt(elemet.numero);
        elemet.territorio = parseInt(elemet.territorio);
        elemet.grupo = parseInt(elemet.grupo);
        elemet.id = parseInt(elemet.id);
        return elemet;
    });
    if (telefonosValidos.length != 0) {
        ActualizarListaTelefonoParametro(telefonosValidos, "Lista de Telefonos (Segun Resultado de Busqueda)");
    }
    else {
        ActualizarListaTelefonoParametro(telefonosValidos, "No se han encontrado coincidencias");
    }
    //Seteo las configuraciones de busqueda
    localStorage.setItem("configuracionDeBusqueda", JSON.stringify({ "busquedaReciente": "true", "camposValidos": JSON.stringify(camposValidos) }));
    $("#btnCerrarModal").click();
}
function RegistrarLlamada(id) {
    var objJson = TraerTelefonoByID_localStorage(id);
    if (confirm("¿Desea actualizar fecha de llamada del numero: " + objJson.numero + " ?") == true) {
        var hoy = new Date();
        objJson.ultimaVez = JSON.parse('{"dia":' + hoy.getDate() + ',"mes":' + (hoy.getMonth() + 1) + ',"anio":' + hoy.getFullYear() + '}');
        var strObjJson = JSON.stringify(objJson);
        $.ajax({
            //type: "put",
            //url: "./backend/",
            type: "post",
            url: "./backend/modificar",
            headers: { "token": localStorage.getItem('jwt') },
            dataType: "json",
            data: { "id_telefono": objJson.id, "obj_Json": strObjJson },
            cache: false,
            async: true
        })
            .done(function () {
            ActualizarTelefonos();
        })
            .fail(function (respuesta) {
            if (respuesta.status == 403) {
                alert("Tiempo de sesion expirado. Vuelva a ingresar.");
                location.href = "./login.html";
            }
            else {
                alert(respuesta.responseJSON.mensaje);
            }
            //$("#divAlertas").html('<div class="alert alert-warning alert-dissmisable">' + respuesta.responseJSON.mensaje + '</div>');
        })
            .always(function () {
            $("#btnAceptarModal").attr("onclick", "AceptarModal()"); //La devuelvo la funcionalidad original al boton del modal
        });
    }
}
function ActualizarListaTelefonoParametro(lsTelefonos, encabezadoListado) {
    var codigo = '<h4 id="encabezadoListado">' + encabezadoListado + '</h4><br>';
    if (lsTelefonos.length != 0) {
        codigo += '<div class="container-fluid table-responsive" style="background-color: rgb(231, 231, 231);border-radius: 25px;">';
        codigo += '<table class="table table-hover">';
        codigo += '<tr><th>Modificar</th><th>Numero</th><th>Revisita</th><th>Circunstancia</th><th>Fecha de llamada</th><th>Territ.</th><th>Grupo</th><th>Descipcion</th><th>Eliminar</th></tr>';
        lsTelefonos.forEach(function (element) {
            //style="border-top-left-radius: 20px; border-start-start-radius: 20px;"
            codigo += '<tr ondblclick="RegistrarLlamada(' + element.id + ')" class="';
            if (element.circunstancia == "No Llamar Mas") {
                codigo += 'table-danger';
            }
            codigo += '">';
            //Boton Modificar
            codigo += '<td><input type="button" data-toggle="modal" data-target="#AltaModifi_modal" value="Modificar" class="btn btn-info"  onclick="SetModificarTelefono(' + element.id + ')"/></div></td>';
            //DATOS
            codigo += '<th>' + element.numero + '</th>';
            codigo += '<td>' + element.revisita + '</td>';
            codigo += '<td>' + element.circunstancia + '</td>';
            codigo += '<td>' + JSON.parse(element.ultimaVez).dia + '/' + JSON.parse(element.ultimaVez).mes + '/' + JSON.parse(element.ultimaVez).anio + '</td>';
            codigo += '<td>' + element.territorio + '</td>';
            codigo += '<td>' + element.grupo + '</td>';
            codigo += '<td>' + element.descripcion + '</td>';
            //Botones eliminar
            codigo += '<td><input type="button" value="Eliminar" class="btn btn-danger" onclick="EliminarTelefono(' + element.id + ')"/></div></td>';
            codigo += "</tr>";
        });
        codigo += '</table>';
        codigo += '</div>';
    }
    $("#divListaTelefonos").html(codigo);
}
function OrdenarPorNumero_Ascendente() {
    var lsTelefonos = TraerListaTelefonos_localStorage();
    var aux_obj;
    for (var i = 0; i < lsTelefonos.length; i++) {
        for (var j = i + 1; j < lsTelefonos.length; j++) {
            if (lsTelefonos[i].numero > lsTelefonos[j].numero) //Si i es MAYOR que j => SWAP
             {
                aux_obj = lsTelefonos[i];
                lsTelefonos[i] = lsTelefonos[j];
                lsTelefonos[j] = aux_obj;
            }
        }
    }
    var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
    if (paramBusqueda.busquedaReciente == "true") {
        BuscarTelefono(JSON.parse(paramBusqueda.camposValidos), lsTelefonos);
    }
    else {
        ActualizarListaTelefonoParametro(lsTelefonos, "Listado de Telefonos (Segun Orden de Numeros Ascendente)");
    }
}
function OrdenarPorGrupo_Ascendente() {
    var lsTelefonos = TraerListaTelefonos_localStorage();
    var aux_obj;
    for (var i = 0; i < lsTelefonos.length; i++) {
        for (var j = i + 1; j < lsTelefonos.length; j++) {
            if (lsTelefonos[i].grupo > lsTelefonos[j].grupo) //Si i es MAYOR que j => SWAP
             {
                aux_obj = lsTelefonos[i];
                lsTelefonos[i] = lsTelefonos[j];
                lsTelefonos[j] = aux_obj;
            }
        }
    }
    var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
    if (paramBusqueda.busquedaReciente == "true") {
        BuscarTelefono(JSON.parse(paramBusqueda.camposValidos), lsTelefonos);
    }
    else {
        ActualizarListaTelefonoParametro(lsTelefonos, "Listado de Telefonos (Segun Orden de Grupos Ascendente)");
    }
    //localStorage.setItem("listadoTelefonos",lsTelefonos);
}
function OrdenarPorTerritorio_Ascendente() {
    var lsTelefonos = TraerListaTelefonos_localStorage();
    var aux_obj;
    for (var i = 0; i < lsTelefonos.length; i++) {
        for (var j = i + 1; j < lsTelefonos.length; j++) {
            if (lsTelefonos[i].territorio > lsTelefonos[j].territorio) //Si i es MAYOR que j => SWAP
             {
                aux_obj = lsTelefonos[i];
                lsTelefonos[i] = lsTelefonos[j];
                lsTelefonos[j] = aux_obj;
            }
        }
    }
    var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
    if (paramBusqueda.busquedaReciente == "true") {
        BuscarTelefono(JSON.parse(paramBusqueda.camposValidos), lsTelefonos);
    }
    else {
        ActualizarListaTelefonoParametro(lsTelefonos, "Listado de Telefonos (Segun Orden de Territorios Ascendente)");
    }
    //localStorage.setItem("listadoTelefonos",lsTelefonos);
}
function OrdenarPorFecha_Descendente() {
    var lsTelefonos = TraerListaTelefonos_localStorage();
    //var aux_obj;
    var fechaJsonA;
    var fechaJsonB;
    var objDateA;
    var objDateB;
    lsTelefonos = lsTelefonos.sort(function (a, b) {
        fechaJsonA = JSON.parse(a.ultimaVez);
        fechaJsonB = JSON.parse(b.ultimaVez);
        objDateA = new Date(fechaJsonA.anio, fechaJsonA.mes, fechaJsonA.dia);
        objDateB = new Date(fechaJsonB.anio, fechaJsonB.mes, fechaJsonB.dia);
        return (objDateA - objDateB) * (-1);
    });
    var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
    if (paramBusqueda.busquedaReciente == "true") {
        BuscarTelefono(JSON.parse(paramBusqueda.camposValidos), lsTelefonos);
    }
    else {
        ActualizarListaTelefonoParametro(lsTelefonos, "Listado de Telefonos (Segun Orden de Fecha Descendente)");
    }
}
function OrdenarPorRevisita_Ascendente() {
    var lsTelefonos = TraerListaTelefonos_localStorage();
    var lsTelefonosRevisitas = lsTelefonos.filter(function (element) {
        if (element.revisita != "")
            return true;
        return false;
    }).sort(function (a, b) {
        if (a.revisita > b.revisita) {
            return 1;
        }
        if (a.revisita < b.revisita) {
            return -1;
        }
        return 0;
    });
    var paramBusqueda = JSON.parse(localStorage.getItem("configuracionDeBusqueda"));
    if (paramBusqueda.busquedaReciente == "true") {
        BuscarTelefono(JSON.parse(paramBusqueda.camposValidos), lsTelefonosRevisitas);
    }
    else {
        ActualizarListaTelefonoParametro(lsTelefonosRevisitas, "Listado de Telefonos (Orden de Revisitas Alfabeticamente)");
    }
}
function VerEventos() {
    $.ajax({
        type: "get",
        //headers:{"token": localStorage.getItem("jwt") },
        url: "./backend/events",
        dataType: "json"
    })
        .done(function (respuesta) {
        if (respuesta.length == 0) {
            alert("No hay eventos aun...");
        }
        else {
            var horarioSplitA;
            var tiempoA;
            var dateA;
            var horarioSplitB;
            var tiempoB;
            var dateB;
            respuesta = respuesta.sort(function (a, b) {
                //anio-mes-dia h:m:s de A
                horarioSplitA = a["horario"].split(" ");
                tiempoA = JSON.parse("{}");
                tiempoA.fechaA = horarioSplitA[0]; //andio-mes-fecha
                tiempoA.horarioA = horarioSplitA[1]; //h:m:s
                tiempoA.anio = (tiempoA.fechaA.split("-"))[0];
                tiempoA.mes = (tiempoA.fechaA.split("-"))[1];
                tiempoA.dia = (tiempoA.fechaA.split("-"))[2];
                tiempoA.hora = (tiempoA.horarioA.split(":"))[0];
                tiempoA.minuto = (tiempoA.horarioA.split(":"))[1];
                tiempoA.segundo = (tiempoA.horarioA.split(":"))[2];
                dateA = new Date(tiempoA.anio, tiempoA.mes, tiempoA.dia, tiempoA.hora, tiempoA.minuto, tiempoA.segundo);
                //anio-mes-dia h:m:s de A
                horarioSplitB = b["horario"].split(" ");
                tiempoB = JSON.parse("{}");
                tiempoB.fechaB = horarioSplitB[0]; //andio-mes-fecha
                tiempoB.horarioB = horarioSplitB[1]; //h:m:s
                tiempoB.anio = (tiempoB.fechaB.split("-"))[0];
                tiempoB.mes = (tiempoB.fechaB.split("-"))[1];
                tiempoB.dia = (tiempoB.fechaB.split("-"))[2];
                tiempoB.hora = (tiempoB.horarioB.split(":"))[0];
                tiempoB.minuto = (tiempoB.horarioB.split(":"))[1];
                tiempoB.segundo = (tiempoB.horarioB.split(":"))[2];
                dateB = new Date(tiempoB.anio, tiempoB.mes, tiempoB.dia, tiempoB.hora, tiempoB.minuto, tiempoB.segundo);
                return (dateA - dateB) * (-1);
            });
            var codigo = '<h4 id="encabezadoListado">LISTA DE EVENTOS</h4><br>';
            codigo += '<div class="container-fluid table-responsive">';
            codigo += '<table class="table table-hover">';
            codigo += '<tr><th>FECHA</th><th>USUARIO</th><th>DETALLE</th>';
            respuesta.forEach(function (element) {
                codigo += "<tr>";
                codigo += "<td>" + element["horario"] + "</td>";
                codigo += "<td>" + element["usuario"] + "</td>";
                codigo += "<td>" + element["descripcion"] + "</td>";
                codigo += "</tr>";
            });
            codigo += '</table>';
            codigo += '</div>';
            $("#divListaTelefonos").html(codigo);
        }
    })
        .fail(function (respuesta) {
        if (respuesta.status == 403) {
            alert("Tiempo de sesion expirado. Vuelva a ingresar.");
            location.href = "./login.html";
        }
    });
}
function MostrarEstadisticas() {
    $("#formTelefono").attr("style", "display:none;"); //Oculto formulario para telefonos
    $("#divEstadisticas").attr("style", "display:block"); //Muestro Div para mostrar estadisticas
    $("#encabezadoModal").html("Estadisticas");
    var lsTelefonos = TraerListaTelefonos_localStorage();
    var codigo = "";
    if (lsTelefonos.length == 0) {
        codigo = "<h5>No hay telefonos que analizar...</h5>";
    }
    else {
        //Cantidad de Numeros:
        var cantNumeros = lsTelefonos.length;
        //Cantidad de Revisitas:
        var cantRevisitas = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.revisita != "")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de No en Casa:
        var cantNC = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "No En Casa")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de Nunca Antes Llamado:
        var cantNuncaLlamado = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "Nunca Antes Llamado")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de Ocupado:
        var cantOcupado = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "Ocupado")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de Contestador:
        var cantContestador = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "Contestador")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de No Llamar Mas:
        var cantNoLlamarMas = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "No Llamar Mas")
                anterior += 1;
            return anterior;
        }, 0);
        //Cantidad de No Llamar Mas:
        var cantNegocios = lsTelefonos.reduce(function (anterior, actual) {
            if (actual.circunstancia == "Negocios")
                anterior += 1;
            return anterior;
        }, 0);
        //Obtengo array llamadas
        var lsFechas;
        var fechaJsonA;
        var fechaJsonB;
        var objDateA;
        var objDateB;
        lsFechas = lsTelefonos.sort(function (a, b) {
            fechaJsonA = JSON.parse(a.ultimaVez);
            fechaJsonB = JSON.parse(b.ultimaVez);
            objDateA = new Date(fechaJsonA.anio, fechaJsonA.mes, fechaJsonA.dia);
            objDateB = new Date(fechaJsonB.anio, fechaJsonB.mes, fechaJsonB.dia);
            return (objDateA - objDateB) * (-1);
        });
        //Llamada mas antigua:
        var llamadaMasAntigua = JSON.parse(lsFechas[(lsFechas.length - 1)].ultimaVez);
        //Llamada mas reciente:
        var llamadaMasReciente = JSON.parse(lsFechas[0].ultimaVez);
        //Numeros por grupo.
        var lsGrupos = lsTelefonos.reduce(function (anterior, actual) {
            //Verifico si el grupo existe en el array
            var existe = false;
            anterior.forEach(function (element) {
                if (element.grupo == actual.grupo) {
                    element.cantidad++;
                    existe = true;
                }
            });
            if (existe == false) {
                anterior.push(JSON.parse('{"grupo":' + actual.grupo + ',"cantidad":1}'));
            }
            return anterior;
        }, JSON.parse("[]")).sort(function (a, b) {
            if (a.grupo > b.grupo) {
                return 1;
            }
            if (a.grupo < b.grupo) {
                return -1;
            }
            return 0;
        });
        //Escribo el codigo que ira en la ventana modal
        codigo += '<div class="container table-responsive">';
        codigo += '<table>';
        codigo += "<tr><td>Cantidad de Numeros: " + cantNumeros + "</td></tr>";
        codigo += "<tr><td>Cantidad de Revisitas: " + cantRevisitas + "</td></tr>";
        codigo += "<tr><td>Cantidad de No En Casa: " + cantNC + "</td></tr>";
        codigo += "<tr><td>Cantidad de Nunca Antes Llamado: " + cantNuncaLlamado + "</td></tr>";
        codigo += "<tr><td>Cantidad de Ocupados: " + cantOcupado + "</td></tr>";
        codigo += "<tr><td>Cantidad de Contestador: " + cantContestador + "</td></tr>";
        codigo += "<tr><td>Cantidad de No Llamar Mas: " + cantNoLlamarMas + "</td></tr>";
        codigo += "<tr><td>Cantidad de Negocios: " + cantNegocios + "</td></tr>";
        codigo += "<tr><td>Llamada mas Antigua: " + llamadaMasAntigua.dia + '/' + llamadaMasAntigua.mes + '/' + llamadaMasAntigua.anio + "</td></tr>";
        codigo += "<tr><td>Llamada Mas Reciente: " + llamadaMasReciente.dia + '/' + llamadaMasReciente.mes + '/' + llamadaMasReciente.anio + "</td></tr>";
        codigo += "<tr><th>Cantidad de Telefonos por Grupo</th><tr>";
        lsGrupos.forEach(function (element) {
            codigo += '<tr><td>Grupo: ' + element.grupo + ' | Cantidad de Telefonos: ' + element.cantidad + '</td></tr>';
        });
        codigo += "</table>";
        codigo += '</div>';
    }
    $("#divEstadisticas").html(codigo);
    $("#btnAceptarModal").attr("style", "display:none;"); //Oculto el boton aceptar modal
    $("#btnCancelarModal").attr("style", "display:none;"); //Oculto el boton cancelar modal
    $("#btnCerrarModal").attr("style", "display:block;"); //Muestro boton cerrar
    $("#btnCerrarModal").on("click", CerrarEstadisticas);
}
function CerrarEstadisticas() {
    $("#formTelefono").attr("style", "display:block;"); //Muestro formulario para telefonos
    $("#divEstadisticas").attr("style", "display:none"); //Oculto estadisticas
    $("#btnAceptarModal").attr("style", "display:block;"); //Muestro boton aceptar
    $("#btnCancelarModal").attr("style", "display:block;"); //Muestro boton cancelar
    $("#btnCerrarModal").attr("style", "display:none;"); //Oculto boton cerrar
}
function Aviso(mensaje) {
    $("#divAlertas").html('<div class="alert alert-danger alert-dismissible fade show">' + mensaje + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
    <span aria-hidden="true">&times;</span>\
    </button></div><br>');
    $("#divAlertas").show();
}
