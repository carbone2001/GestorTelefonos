<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require_once './vendor/autoload.php';
require_once "./Clases/usuario.php";
require_once "./Clases/autenticadora.php";
require_once "./Clases/telefono.php";
use Firebase\JWT\JWT;
class MW
{
    public function VerificarCamposSeteados(Request $request, Response $response,$next)//mw 1
    {
        $respuestaJson = new stdClass();
        $respuestaJson->mensaje = "";
        $respuestaJson->status = 200;
        $params = $request->getParsedBody();

        $objJson = json_decode($params["obj_Json"]);

        if(!property_exists($objJson,"nombre"))
        {
            $respuestaJson->mensaje .= "Falta nombre! ";
            $respuestaJson->status = 403;
        }
        if(!property_exists($objJson,"clave"))
        {
            $respuestaJson->mensaje .= "Falta clave! ";
            $respuestaJson->status = 403;
        }

        if($respuestaJson->status==200)
        {
            $response = $next($request,$response);
        }
        else
        {
            $response = $response->withJson($respuestaJson,403);
        }
        return $response;   
    }

    public static function VerificarCamposVacios(Request $request, Response $response,$next)//mw 2
    {
        $respuestaJson = new stdClass();
        $respuestaJson->mensaje = "";
        $respuestaJson->status = 200;
        $params = $request->getParsedBody();
        $objJson = json_decode($params['obj_Json']);
        if($objJson->nombre=="")
        {
            $respuestaJson->mensaje .= "Campo nombre vacio! ";
            $respuestaJson->status = 403;
        }
        if($objJson->clave=="")
        {
            $respuestaJson->mensaje .= "Campo clave vacio! ";
            $respuestaJson->status = 403;
        }

        if($respuestaJson->status==200)
        {
            $response = $next($request,$response);
        }
        else
        {
            $response = $response->withJson($respuestaJson,409);
        }
        return $response;   
    }


    public function VerificarExistenciaNombreClave(Request $request, Response $response,$next)//mw 3
    {
        $params = $request->getParsedBody();
        $objJson = json_decode($params["obj_Json"]);
        $lsUsuarios = Usuario::TraerTodosPDO();
        $exite_NombreClave = false;
        $respuestaJson = new stdClass();

        //Verifico existencia
        foreach($lsUsuarios as $user)
        {
            if($user->nombre == $objJson->nombre && $user->clave == $objJson->clave)
            {
                $exite_NombreClave = true;
            }
        }

        //Verifico y ejecuto segun resultado
        if($exite_NombreClave)
        {
            $response = $next($request,$response);
        }
        else
        {
            $respuestaJson->mensaje = "El nombre y clave ingresados no existen";
            $response = $response->withJson($respuestaJson,403);
        }
        return $response;
    }


    public static function  VerificarInexistenciaNumeroTelefonico(Request $request, Response $response,$next)//mw 4 (La inversa del 3)
    {
        $params = $request->getParsedBody();
        $objJson = json_decode($params["obj_Json"]);
        $lsTelefonos = Telefono::TraerTodosPDO();
        $exite_telefono = false;
        $respuestaJson = new stdClass();
        //Verifico existencia
        foreach($lsTelefonos as $telefono)
        {
            if($telefono->numero == $objJson->numero)
            {
                $exite_telefono = true;
            }
        }

        //Verifico y ejecuto segun resultado
        if($exite_telefono==false)
        {
            $response = $next($request,$response);
        }
        else
        {
            $respuestaJson->mensaje = "No se ha podido agregar el numero porque ya existe.";
            $response = $response->withJson($respuestaJson,418);
        }
        return $response;
    }



    public function VerificarToken(Request $request, Response $response,$next)
    {
        $respuesta = new stdClass();
        $token = $request->getHeader('token')[0];

        try
        {
            JWT::decode($token,"correctPassword",['HS256']);
            $response = $next($request,$response);
        }
        catch(Exception $e)
        {
            $respuesta->mensaje = "Token Invalido: ".$e->getMessage();
            $response = $response->withJson($respuesta,403);
        }

        return $response;
    }

    public static function VerificarPropietario(Request $request, Response $response,$next)
    {
        $respuestaJson = new stdClass();
        $arrayParam = $request->getParsedBody();
        $token = $request->getHeader('token')[0];
        $objJson = JWT::decode($token,"correctPassword",['HS256'])->data;

  
        if($objJson->perfil === "propietario")
        {
            $response = $next($request,$response);
        }
        else
        {
            $respuestaJson->mensaje = "El usuario ".$objJson->nombre." ".$objJson->apellido." intento borrar un usuario.";
            $response = $response->withJson($respuestaJson,418);
            
        }
        return $response;
    }

    public function VerificarEncargado(Request $request, Response $response,$next)
    {
        $arrayParam = $request->getParsedBody();
        $token = $request->getHeader('token')[0];
        $objJson = JWT::decode($token,"correctPassword",['HS256'])->data;
        if($objJson->perfil === "encargado")
        {
            $response = $next($request,$response);
        }
        else
        {
            //EN CASO DE NO SER ENCARGADO, VERIFICO SI EL USUARIO ES PROPIETARIO. SI LO ES PODRA PASAR AL SIGUIENTE CALEABLE
            $response = MW::VerificarPropietario($request,$response,$next);
            //$respuestaObj->mensaje = "El usuario ".$objJson->nombre." ".$objJson->apellido." intento borrar un usuario.";
            //$response = $response->withJson($respuestaJson,200);
        }
        return $response;
    }

}