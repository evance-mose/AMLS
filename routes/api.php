<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\ApiLogController;
use App\Http\Controllers\Api\ApiIssueController;
use App\Http\Controllers\Api\ApiUserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Middleware\RoleMiddleware;



Route::post('/login', [LoginController::class, 'login']);

Route::middleware(['auth:sanctum', 'verified', RoleMiddleware::class . ':admin,custodian,technician'])->group(function () {
    Route::apiResource('logs', ApiLogController::class);
    Route::apiResource('issues', ApiIssueController::class);
    Route::get('reports/monthly', [ReportController::class, 'apiMonthly']);
    Route::get('analytics/monthly', [ReportController::class, 'apiMonthly']);
    Route::apiResource('users', ApiUserController::class); // Assuming analytics/monthly is also a report
});


Route::get('reports/monthly', [ReportController::class, 'apiMonthly']);

// Route::middleware(['auth:sanctum', 'verified', RoleMiddleware::class . ':admin'])->group(function () {
//     Route::apiResource('users', ApiUserController::class);
// });
