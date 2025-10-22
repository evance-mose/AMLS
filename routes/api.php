<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\ApiLogController;
use App\Http\Controllers\Api\ApiIssueController;
use App\Http\Controllers\Api\ApiUserController;
use App\Http\Middleware\RoleMiddleware;



    Route::apiResource('logs', ApiLogController::class);
    Route::apiResource('issues', ApiIssueController::class);
    Route::apiResource('users', ApiUserController::class);
    Route::get('reports/monthly', [ReportController::class, 'apiMonthly']);
