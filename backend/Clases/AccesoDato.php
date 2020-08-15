<?php

class AccesoDato
{
    private static $AccesoDato;
    public $pdo;
    private function __construct()
    {
        try
        {
            $confSql = 'mysql:host=localhost;dbname=predicaciontelefonica_bd;charset=utf8';
            $this->pdo = new PDO($confSql,"root","");
            //$this->pdo = new PDO($confSql,"usrenc01gt","1082020pass");
        }
        catch(PDOException $e)
        {
            print "ERROR! ". $e->getMessage();
            die();
        }
    }
    static function ObtenerAccesoDato()
    {
        if(!isset(self::$AccesoDato))
        {
            self::$AccesoDato = new AccesoDato();
        }
        return self::$AccesoDato;
    }
    function ObtenerConsulta($strConsulta)
    {
        return $this->pdo->prepare($strConsulta);
    }

    public function __clone()
    {
        trigger_error("No se tiene permitido clonar AccesoDatos", E_USER_ERROR);
    }
    function UltimoIdInsertado()
    {
        return $this->pdo->lastInsertId();
    }
}