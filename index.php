<?php
use Slim\Factory\AppFactory;
use DI\Container;

if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $file = __DIR__ . $_SERVER['REQUEST_URI'];
    if (is_file($file)) {
        return false;
    }
}

require __DIR__ . '/vendor/autoload.php';

// Instantiate the app
$settings = require __DIR__ . '/src/settings.php';
$container = new Container();
$container->set('settings', $settings['settings']);

// Set up dependencies
$dependencies = require __DIR__ . '/src/dependencies.php';
$container = $dependencies($container);

AppFactory::setContainer($container);
$app = AppFactory::create();

// Register middleware
$middleware = require __DIR__ . '/src/middleware.php';
$middleware($app);

// Register routes
$routes = require __DIR__ . '/src/routes.php';
$routes($app);

// Run app
$app->run();
