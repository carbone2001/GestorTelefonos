/// <reference path="./node_modules/@types/jquery/index.d.ts"/>
$(document).ready(function () {
    localStorage.removeItem("jwt");
    $("#btnSubmit").on("click", Login);
});
function Login(e) {
    e.preventDefault();
    var objJson = JSON.parse("{}");
    objJson.nombre = $("#txtNombre").val();
    objJson.clave = $("#txtClave").val();
    var strObjJson = JSON.stringify(objJson);
    $.ajax({
        url: "backend/login",
        type: "post",
        dataType: "json",
        data: { "obj_Json": strObjJson }
    })
        .done(function (respuesta) {
        localStorage.setItem("jwt", respuesta.jwt);
        $("#formLogin").submit();
    })
        .fail(function (respuesta) {
        $("#divAlertas").html('<div class="alert alert-danger alert-dismissible fade show">' + respuesta.responseJSON.mensaje + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
        <span aria-hidden="true">&times;</span>\
      </button></div><br>');
    });
}
