<?php
/**
 * Run chat migration to add chat tables
 */

require_once __DIR__ . '/../api/db.php';

try {
    $db = Database::getConnection();

    // Read migration file
    $sql = file_get_contents(__DIR__ . '/chat_migration.sql');

    // Execute SQL
    $db->exec($sql);

    echo "Chat tables created successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
