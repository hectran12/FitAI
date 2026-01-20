<?php
/**
 * FitAI - Frontend Router
 * 
 * Routes all requests to appropriate handlers
 * Run from project root: php -S localhost:8080 -t public public/router.php
 */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Handle API requests
if (strpos($path, '/api/') === 0) {
    $apiPath = __DIR__ . '/../api' . substr($path, 4);

    // Remove .php extension check and add it if missing
    if (pathinfo($apiPath, PATHINFO_EXTENSION) !== 'php') {
        $apiPath .= '.php';
    }

    if (file_exists($apiPath)) {
        // Set proper content type for JSON responses
        require $apiPath;
        exit;
    }

    // Try without the auto-added extension
    $apiPath = __DIR__ . '/../api' . substr($path, 4);
    if (file_exists($apiPath)) {
        require $apiPath;
        exit;
    }

    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => true, 'message' => 'Endpoint not found: ' . $path]);
    exit;
}

// Static file extensions (including audio)
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'webp', 'wav', 'webm', 'ogg', 'mp3', 'mp4', 'pdf'];
$ext = pathinfo($path, PATHINFO_EXTENSION);

// Handle uploads directory (outside public)
if (strpos($path, '/uploads/') === 0) {
    $uploadPath = __DIR__ . '/../uploads' . substr($path, 8);
    if (file_exists($uploadPath)) {
        $mimeTypes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'wav' => 'audio/wav',
            'webm' => 'audio/webm',
            'ogg' => 'audio/ogg',
            'mp3' => 'audio/mpeg',
            'mp4' => 'video/mp4',
            'pdf' => 'application/pdf'
        ];
        $mime = $mimeTypes[strtolower($ext)] ?? 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Accept-Ranges: bytes');
        header('Content-Length: ' . filesize($uploadPath));
        readfile($uploadPath);
        exit;
    }
}

// Check for static files
if (in_array(strtolower($ext), $staticExtensions)) {
    $filePath = __DIR__ . $path;
    if (file_exists($filePath)) {
        return false; // Let PHP built-in server handle it
    }
}

// For all other requests, serve index.html (SPA)
$indexPath = __DIR__ . '/index.html';
if (file_exists($indexPath)) {
    header('Content-Type: text/html');
    readfile($indexPath);
    exit;
}

http_response_code(404);
echo 'Not Found';
