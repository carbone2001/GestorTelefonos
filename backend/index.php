<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require_once './vendor/autoload.php';
require_once "./Clases/telefono.php";
require_once './Clases/usuario.php';
require_once "./Clases/autenticadora.php";
require_once "./Clases/middlewares.php";
require_once "./Clases/eventos.php";

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;


$app = new \Slim\App(["settings" => $config]);


//ALTA USUARIOS
/*$app->post('/usuarios',Usuario::class . "::AltaUsuario");/*->add(
    MW::class . "::VerificarInexistenciaCorreoClave")->add(
        MW::class . "::VerificarCamposVacios")->add(
            MW::class . ":VerificarCamposSeteados");*/

//LISTAR USUARIOS
//$app->get('[/]',Usuario::class . "::ListarUsuarios")->add(MW::class . ":VerificarToken");

//ALTA TELEFONOS
$app->post('/alta',Telefono::class . '::AltaTelefono')->add(MW::class . "::VerificarInexistenciaNumeroTelefonico")->add(MW::class . ":VerificarToken");

//LISTAR TELEFONOS
$app->get('/telefonos',Telefono::class . '::ListarTelefonos')->add(MW::class . ":VerificarToken");

//Logearse
$app->post('/login',Autenticadora::class . '::LoginJWT')->add(
    MW::class . ":VerificarExistenciaNombreClave")->add(
        MW::class . "::VerificarCamposVacios")->add(
            MW::class . ":VerificarCamposSeteados");

//Verificar Login
//$app->get('/login',Autenticadora::class . '::VerificarJWT');

//Borrar Telefono
//$app->delete('[/]',Telefono::class . '::EliminarTelefono')->add(MW::class . ":VerificarToken");/*->add(MW::class . "::VerificarPropietario")*/
$app->post('/delete',Telefono::class . '::EliminarTelefono')->add(MW::class . ":VerificarToken");

//Modificar Telefono
//$app->put('[/]',Telefono::class . '::ModificarTelefono')->add(MW::class . ":VerificarToken");/*->add(MW::class . ":VerificarEncargado")->add(MW::class . ":VerificarToken");*/
$app->post('/modificar',Telefono::class . '::ModificarTelefono')->add(MW::class . ":VerificarToken");

$app->get('/events',Evento::class . '::ObtenerEventosSlim');

$app->run();