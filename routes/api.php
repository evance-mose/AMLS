<?php

use App\Http\Controllers\Api\ApiIssueController;
use App\Http\Controllers\Api\ApiLocationTrailController;
use App\Http\Controllers\Api\ApiLogController;
use App\Http\Controllers\Api\ApiUserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Admin: User management
    Route::middleware(RoleMiddleware::class.':admin')->group(function () {
        Route::apiResource('users', ApiUserController::class);
    });

    // Admin: Reports management
    Route::middleware(RoleMiddleware::class.':admin')->group(function () {
        Route::get('reports/monthly', [ReportController::class, 'apiMonthly']);
        Route::get('analytics/monthly', [ReportController::class, 'apiMonthly']);
    });

    // Issues: Role-based access
    Route::prefix('issues')->name('issues.')->group(function () {
        // Custodian: Create issues (fault logging)
        Route::middleware(RoleMiddleware::class.':custodian')->group(function () {
            Route::post('/', [ApiIssueController::class, 'store']);
        });

        // Technician: Update assigned issues (task resolution)
        Route::middleware(RoleMiddleware::class.':technician')->group(function () {
            Route::put('{issue}', [ApiIssueController::class, 'update']);
        });

        // Admin, Custodian, Technician: View issues
        Route::middleware(RoleMiddleware::class.':admin,custodian,technician')->group(function () {
            Route::get('/', [ApiIssueController::class, 'index']);
            Route::get('{issue}', [ApiIssueController::class, 'show']);
        });

        // Admin: Delete issues
        Route::middleware(RoleMiddleware::class.':admin')->group(function () {
            Route::delete('{issue}', [ApiIssueController::class, 'destroy']);
        });
    });

    // Logs: Role-based access
    Route::prefix('logs')->name('logs.')->group(function () {
        // Technician: Create and update logs (task resolution)
        Route::middleware(RoleMiddleware::class.':technician')->group(function () {
            Route::post('/', [ApiLogController::class, 'store']);
            Route::put('{log}', [ApiLogController::class, 'update']);
        });

        // Admin, Technician: View logs
        Route::middleware(RoleMiddleware::class.':admin,technician')->group(function () {
            Route::get('/', [ApiLogController::class, 'index']);
            Route::get('{log}', [ApiLogController::class, 'show']);
        });

        // Admin: Delete logs
        Route::middleware(RoleMiddleware::class.':admin')->group(function () {
            Route::delete('{log}', [ApiLogController::class, 'destroy']);
        });
    });

    // Location trail: technician upload, admin read
    Route::middleware(RoleMiddleware::class.':technician')->group(function () {
        Route::post('location-trail', [ApiLocationTrailController::class, 'store'])
            ->middleware('throttle:location-trail');
    });
    Route::middleware(RoleMiddleware::class.':admin')->group(function () {
        Route::get('location-trail', [ApiLocationTrailController::class, 'index']);
    });
});
