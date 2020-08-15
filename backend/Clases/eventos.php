<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
date_default_timezone_set('America/Argentina/Buenos_Aires');
class Evento
{
    //public $id;
    public $descripcion;
    public $usuario;

    public static function CrearEvento($usuario,$descripcion)
    {
        $file = fopen("./eventos/eventos.json","a");
        fwrite($file,'{"usuario":"'.$usuario.'","descripcion":"'.$descripcion.'","horario":"'.date("Y-m-d H:i:s").'"}'."\n");
        fclose($file);
    }

    public static function ObtenerEventos()
    {
        $file = fopen("./eventos/eventos.json","r");
        //$listaEventosStr = "";
        $listaEventosJson = json_decode("[]");
        while(!feof($file))
        {
            $linea = trim(fgets($file));
            if(strlen($linea) != 0 && strlen($linea) != false)
            {
                array_push($listaEventosJson,json_decode($linea));
            }
        }
        fclose($file);
        return $listaEventosJson;
    }

    public static function ObtenerEventosSlim(Request $request, Response $response)
    {
        return $response->withJson(Evento::ObtenerEventos(),200);
    }

}