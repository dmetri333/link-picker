<?php 
$data = [
    ['text' => 'Link 1', 'url' => '#1'],
    ['text' => 'link 2', 'url' => '#2']
];

$output = [
    'payload' => $data,
    'status' => (object) ['error' => false, 'code' => 200, 'message' => 'ok'],
    'processTime' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']
];

echo json_encode($output);