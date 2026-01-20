<?php
/**
 * Script to run seed.sql to populate database
 */

require_once __DIR__ . '/../api/db.php';

try {
    $db = Database::getConnection();

    // Read seed file
    $sql = file_get_contents(__DIR__ . '/seed.sql');

    // Execute SQL
    $db->exec($sql);

    echo "Seed data updated successfully!\n";
    echo "All exercises have been translated to Vietnamese.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
