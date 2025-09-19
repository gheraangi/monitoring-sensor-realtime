<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $temperature = isset($_POST['temperature']) ? floatval($_POST['temperature']) : null;
    $humidity = isset($_POST['humidity']) ? floatval($_POST['humidity']) : null;
    $light = isset($_POST['light']) ? intval($_POST['light']) : null;

    if ($temperature !== null && $humidity !== null && $light !== null) {
        $data = [
            'connected' => true,
            'temperature' => $temperature,
            'humidity' => $humidity,
            'light' => $light,
            'time' => date('H:i:s')
        ];

        file_put_contents('sensor_data.json', json_encode($data));

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
    }
    exit;
}

if (file_exists('sensor_data.json')) {
    $data = json_decode(file_get_contents('sensor_data.json'), true);
    echo json_encode($data);
} else {
    echo json_encode([
        'connected' => false,
        'temperature' => null,
        'humidity' => null,
        'light' => null,
        'time' => null
    ]);
}