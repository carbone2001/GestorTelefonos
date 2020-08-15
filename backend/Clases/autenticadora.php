<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require_once './vendor/autoload.php';
require_once "./Clases/usuario.php";
use Firebase\JWT\JWT;

class Autenticadora
{
    public static function LoginJWT(Request $request,Response $response)
    {
        $respuestaJson = new stdClass();
        $params = $request->getParsedBody();
        $objJson = json_decode($params["obj_Json"]);
        $jwt = null;
        

        try
        {
            $lsUsuarios = Usuario::TraerTodosPDO();
            foreach($lsUsuarios as $user)
            {
                if($user->nombre == $objJson->nombre && $user->clave == $objJson->clave)
                {
                    $jwt = Autenticadora::CrearJWT($user);
                }
            }
            if(isset($jwt))
            {
                $respuestaJson->exito = true;
                $respuestaJson->jwt = $jwt;
                $respuestaJson->status = 200;
            }
            else
            {
                $respuestaJson->exito = false;
                $respuestaJson->mensaje = "No se ha podido crear el JWT";
                $respuestaJson->status = 403;
            }
        }
        catch(Exception $e)
        {
            $respuestaJson->exito = false;
            $respuestaJson->mensaje = $e->mensaje;
            $respuestaJson->status = 403;
        }

        return $response->withJson($respuestaJson,$respuestaJson->status);
    }

    public static function VerificarJWT(Request $request,Response $response,$next)
    {
        $token = $request->getHeader('token')[0];

        $objRespuesta = Autenticadora::ValidarJWT($token);
        if($objRespuesta->exito === true)
        {
            $response = $response->withJson($objRespuesta,200);
        }
        else
        {
            $response = $response->withJson($objRespuesta,403);
        }
        return $response;
    }



    public static function CrearJWT($data)
    {
        $tiempoActual = time();
        $token = array(
        	'iat'=>$tiempoActual,
            'exp' => $tiempoActual + 9000,//2:30 hs de vida
            'data' => $data,
        );
        return JWT::encode($token,"correctPassword","HS256");
    }

    public static function ValidarJWT($token)//Valida y obtiene datos en $respuesta->data
    {
        $respuesta = new stdClass();
        try
        {
            $data = JWT::decode($token,"correctPassword",['HS256'])->data;
            $respuesta->exito = true;
            $respuesta->data = $data;
            $respuesta->mensaje = "Token Valido!";   
        }
        catch(Exception $e)
        {
            $respuesta->exito = false;
            $respuesta->mensaje = "Token Invalido: ".$e->getMessage();
        }
        return $respuesta;
    }
    
}
