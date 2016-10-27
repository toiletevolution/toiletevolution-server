<?php
require __DIR__ . '/../vendor/autoload.php';

$configuration = PHPUnit_Util_Configuration::getInstance(__DIR__ . '/../phpunit.xml.dist');
$suite = $configuration->getTestSuiteConfiguration();
$phpunit = $configuration->getPHPUnitConfiguration();
$configuration->handlePHPConfiguration();

$phpunit['colors'] = "always";
$phpunit['junitLogfile'] = __DIR__ . '/test-results.xml';

PHPUnit_TextUI_TestRunner::run($suite, $phpunit);
