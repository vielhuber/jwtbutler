<?php
require_once(__DIR__.'/vendor/autoload.php');
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// cors
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if(@$_SERVER['REQUEST_METHOD'] == 'OPTIONS') { die(); }

try
{
    $user_id = JWT::decode(
        str_replace('Bearer ','',@$_SERVER['HTTP_AUTHORIZATION']), // access token
        new Key('WM38tprPABEgkldbt2yTAgxf2CGstfr5', 'HS256'), // secret key
    )->sub;
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $user_id,
            'foo' => 'bar'
        ]
    ]);
    die();
}
catch(Exception $e)
{
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'unauthorized',
        'public_message' => '...'
    ]);
    die();
}