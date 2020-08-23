<?php
require_once "./Clases/AccesoDato.php";

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require_once "./Clases/eventos.php";
class Telefono
{

    public $numero;
    public $ultimaVez;
    public $territorio;
    public $grupo;
    public $circunstancia;
    public $revisita;
    public $descripcion;
    
    //Metodos Slim *****************************************************************************************************
    public static function AltaTelefono(Request $request, Response $response, $args)
    {
        $respuestaJson = new stdClass();

        $arrayParametros = $request->getParsedBody();
        $objJson = json_decode($arrayParametros["obj_Json"]);

        $newTelefono = new Telefono();
        $newTelefono->numero = $objJson->numero;
        $newTelefono->ultimaVez = json_encode($objJson->ultimaVez);
        $newTelefono->territorio = $objJson->territorio;
        $newTelefono->grupo = $objJson->grupo;
        $newTelefono->circunstancia = $objJson->circunstancia;
        $newTelefono->revisita = $objJson->revisita;
        $newTelefono->descripcion = $objJson->descripcion;
        
        
        $ultimoID = $newTelefono->InsertarTelefonoPDO();
        if($ultimoID!=0)
        {
            $respuestaJson->exito = true;
            $respuestaJson->mensaje = "Se ha agregado el nuevo Telefono";
            $respuestaJson->status = 200;
            $usuarioLogeado = Autenticadora::ValidarJWT($request->getHeader('token')[0])->data;
            Evento::CrearEvento($usuarioLogeado->nombre,"Se agrego telefono: ".$objJson->numero);
        }
        else
        {
            $respuestaJson->mensaje = "Error al agregar el Telefono";
            $respuestaJson->exito = false;
            $respuestaJson->status = 418;
        }
        return $response->withJson($respuestaJson,$respuestaJson->status);
    }
    public static function ListarTelefonos(Request $request, Response $response, $args)
    {
        $respuestaJson = new stdClass();
        $listaObj = Telefono::TraerTodosPDO();
        if(!isset($listaObj))
        {
            $respuestaJson->mensaje = "Error al traer el listado de los Telefonos";
            $respuestaJson->exito = false;
            $respuestaJson->status = 424;
        }
        else
        {
            $respuestaJson->tabla = $listaObj;
            $respuestaJson->exito = true;
            $respuestaJson->mensaje = "Listado de Telefonos exitosa";
            $respuestaJson->status = 200;
        }
        $newResponse = $response->withJson($respuestaJson,$respuestaJson->status);
        return $newResponse;
    }

    public static function EliminarTelefono(Request $request, Response $response, $args)
    {
        //Recordar que los parametros deben pasarse como x-www-form-urlencoded
        $arrayParam = $request->getParsedBody();
        $id = $arrayParam["id_telefono"];
        $telefonoPorBorrar = json_decode($arrayParam["obj_Json"]);
        $respuestaObj = new stdclass();

        $rowCount = Telefono::EliminarTelefonoPDO($id);
        if($rowCount > 0)
        {
            $respuestaObj->mensaje = "Se borro exitosamente";
            $usuarioLogeado = Autenticadora::ValidarJWT($request->getHeader('token')[0])->data;
            Evento::CrearEvento($usuarioLogeado->nombre,"Elimino el telefono: ". $telefonoPorBorrar->numero);
        }
        else
        {
            $respuestaObj->mensaje = "Error al borrar";
        }

        return $response->withJson($respuestaObj,200);;
    }

    public static function ModificarTelefono(Request $request, Response $response, $args)
    {
        //Recordar que los parametros deben pasarse como x-www-form-urlencoded
        $arrayParam = $request->getParsedBody();
        $id = $arrayParam["id_telefono"];
        $objJson = json_decode($arrayParam["obj_Json"]);
        $TelefonoToUpdate = new Telefono();
        $TelefonoToUpdate->numero = $objJson->numero;
        $TelefonoToUpdate->ultimaVez = json_encode($objJson->ultimaVez);
        $TelefonoToUpdate->territorio = $objJson->territorio;
        $TelefonoToUpdate->grupo = $objJson->grupo;
        $TelefonoToUpdate->circunstancia = $objJson->circunstancia;
        $TelefonoToUpdate->revisita = $objJson->revisita;
        $TelefonoToUpdate->descripcion = $objJson->descripcion;
        

        $respuestaObj = new stdclass();

        try
        {
            $TelefonoToUpdate->ModificarTelefonoPDO($id);
            $respuestaObj->mensaje = "Se modifico exitosamente";
            $usuarioLogeado = Autenticadora::ValidarJWT($request->getHeader('token')[0])->data;
            Evento::CrearEvento($usuarioLogeado->nombre,"Modifico/RegistroLLamada de telefono:".$TelefonoToUpdate->numero);
        }
        catch(Exception $e)
        {
            $respuestaObj->mensaje = "Error al modificar";
        }

        return $response->withJson($respuestaObj,200);
    }
    

    //Metodos PDO ******************************************************************************************************
    public static function TraerTodosPDO()
    {
        $at = AccesoDato::ObtenerAccesoDato();
        $consulta = $at->ObtenerConsulta("SELECT * FROM telefono");
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_CLASS,"Telefono");
    }

    function InsertarTelefonoPDO()
    {
        $pdo = AccesoDato::ObtenerAccesoDato();
        $consulta = $pdo->ObtenerConsulta("INSERT into telefono(numero,ultimaVez,territorio,grupo,circunstancia,revisita,descripcion)values(:numero,:ultimaVez,:territorio,:grupo,:circunstancia,:revisita,:descripcion)");
        $consulta->bindValue(':numero',$this->numero,PDO::PARAM_INT);
        $consulta->bindValue(':revisita',$this->revisita,PDO::PARAM_STR);
        $consulta->bindValue(':circunstancia',$this->circunstancia,PDO::PARAM_STR);
        $consulta->bindValue(':grupo',$this->grupo,PDO::PARAM_INT);
        $consulta->bindValue(':territorio',$this->territorio,PDO::PARAM_INT);
        $consulta->bindValue(':ultimaVez',$this->ultimaVez,PDO::PARAM_STR);
        $consulta->bindValue(':descripcion',$this->descripcion,PDO::PARAM_STR);
        $consulta->execute();
        return $pdo->UltimoIdInsertado();
    }

    static function EliminarTelefonoPDO($id)
    {
        $ad = AccesoDato::ObtenerAccesoDato();
        $consulta = $ad->ObtenerConsulta("DELETE FROM telefono WHERE id=$id");
        $consulta->execute();
        return $consulta->rowCount();
    }

    function ModificarTelefonoPDO($id)
    {
        $pdo = AccesoDato::ObtenerAccesoDato();
        $consulta = $pdo->ObtenerConsulta("UPDATE telefono set numero=:numero,revisita=:revisita,circunstancia=:circunstancia,grupo=:grupo,territorio=:territorio,ultimaVez=:ultimaVez,descripcion=:descripcion where id=$id");
        $consulta->bindValue(':numero',$this->numero,PDO::PARAM_INT);
        $consulta->bindValue(':revisita',$this->revisita,PDO::PARAM_STR);
        $consulta->bindValue(':circunstancia',$this->circunstancia,PDO::PARAM_STR);
        $consulta->bindValue(':grupo',$this->grupo,PDO::PARAM_INT);
        $consulta->bindValue(':territorio',$this->territorio,PDO::PARAM_INT);
        $consulta->bindValue(':ultimaVez',$this->ultimaVez,PDO::PARAM_STR);
        $consulta->bindValue(':descripcion',$this->descripcion,PDO::PARAM_STR);
        return $consulta->execute();
    }
}