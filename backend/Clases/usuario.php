<?php
require_once "./Clases/AccesoDato.php";


use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

class Usuario
{
    public $id;
    public $nombre;
    public $clave;
    
    //Metodos Slim *****************************************************************************************************
    public static function AltaUsuario(Request $request, Response $response, $args)
    {
        $respuestaJson = new stdClass();

        $arrayParametros = $request->getParsedBody();

        $objJson = json_decode($arrayParametros["obj_Json"]);

        try{
            $newUsr = new Usuario();
            $newUsr->nombre = $objJson->nombre;
            $newUsr->apellido = $objJson->apellido;
            $newUsr->clave = $objJson->clave;
            $newUsr->correo = $objJson->correo;
            $newUsr->perfil = $objJson->perfil;

            if($ultimoID!=0)
            {
                $respuestaJson->exito = true;
                $respuestaJson->mensaje = "Se ha agregado el nuevo Usuario";
                $respuestaJson->status = 200;
            }
            else
            {
                $respuestaJson->mensaje = "Error al agregar el usuario";
                $respuestaJson->exito = false;
                $respuestaJson->status = 418;
            }
        }
        catch(Exception $e)
        {
            $respuestaJson->mensaje = $e->message;
            $respuestaJson->exito = false;
            $respuestaJson->status = 418;
        }
        return $response->withJson($respuestaJson,$respuestaJson->status);
    }
    public static function ListarUsuarios(Request $request, Response $response)
    {
        $respuestaJson = new stdClass();
        $listaObj = Usuario::TraerTodosPDO();
        if(!isset($listaObj))
        {
            $respuestaJson->mensaje = "Error al traer el listado de los usuarios";
            $respuestaJson->exito = false;
            $respuestaJson->status = 424;
        }
        else
        {
            $respuestaJson->tabla = $listaObj;
            $respuestaJson->exito = true;
            $respuestaJson->mensaje = "Listado de usuarios exitosa";
            $respuestaJson->status = 200;
        }
        $newResponse = $response->withJson($respuestaJson,$respuestaJson->status);
        return $newResponse;
    }

    

    //Metodos PDO ******************************************************************************************************
    static function TraerTodosPDO()
    {
        $at = AccesoDato::ObtenerAccesoDato();
        $consulta = $at->ObtenerConsulta("SELECT * FROM usuarios");
        $consulta->execute();
        return $consulta->fetchAll(PDO::FETCH_CLASS,"Usuario");
    }
    static function TraerUnUsuarioPDO($id)
    {
        $at = AccesoDato::ObtenerAccesoDato();
        $consulta = $at->ObtenerConsulta("SELECT * FROM usuarios where id=". implode("",$id));
        $consulta->execute();
        return $consulta->fetchObject('Usuario');
    }
    function InsertarUsuarioPDO()
    {
        $pdo = AccesoDato::ObtenerAccesoDato();
        $consulta = $pdo->ObtenerConsulta("INSERT into usuarios(nombre,apellido,correo,clave,perfil,foto)values(:nombre,:apellido,:correo,:clave,:perfil,:foto)");
        $consulta->bindValue(':nombre',$this->nombre,PDO::PARAM_STR);
        $consulta->bindValue(':apellido',$this->apellido,PDO::PARAM_STR);
        $consulta->bindValue(':correo',$this->correo,PDO::PARAM_STR);
        $consulta->bindValue(':clave',$this->clave,PDO::PARAM_STR);
        $consulta->bindValue(':perfil',$this->perfil,PDO::PARAM_STR);
        $consulta->bindValue(':foto',$this->foto,PDO::PARAM_STR);
        $consulta->execute();
        return $pdo->UltimoIdInsertado();
    }
    static function ObtenerUltimoIDUsuarios()
    {
        $listaObj = Usuario::TraerTodosPDO();
        $ultimoUsuario = $listaObj[(count($listaObj)-1)];
        return $ultimoUsuario->id;
    }
}