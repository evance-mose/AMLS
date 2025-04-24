<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ReportController;




Route::get('/reports/monthly', [ReportController::class, 'apiMonthly']);