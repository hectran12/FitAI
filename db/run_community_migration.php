<?php
require_once __DIR__ . '/../api/db.php';

try {
    $db = Database::getConnection();
    $sql = file_get_contents(__DIR__ . '/community_migration.sql');
    $db->exec($sql);
    echo "Community tables created successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
