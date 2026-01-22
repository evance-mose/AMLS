<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\RoleMiddleware;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin: User management
    Route::middleware(RoleMiddleware::class.':admin')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Admin: Reports management
    Route::middleware(RoleMiddleware::class.':admin')->group(function () {
        Route::get('reports/monthly', [ReportController::class, 'monthly'])->name('reports.monthly');
    });

    // Issues: Role-based access
    Route::prefix('issues')->name('issues.')->group(function () {
        // Custodian: Create issues (fault logging)
        Route::middleware(RoleMiddleware::class.':custodian')->group(function () {
            Route::post('/', [IssueController::class, 'store'])->name('store');
        });
        
        // Technician: Update assigned issues (task resolution)
        Route::middleware(RoleMiddleware::class.':technician')->group(function () {
            Route::put('{issue}', [IssueController::class, 'update'])->name('update');
        });
        
        // Admin, Custodian, Technician: View issues
        Route::middleware(RoleMiddleware::class.':admin,custodian,technician')->group(function () {
            Route::get('/', [IssueController::class, 'index'])->name('index');
            Route::get('{issue}', [IssueController::class, 'show'])->name('show');
        });
        
        // Admin: Delete issues
        Route::middleware(RoleMiddleware::class.':admin')->group(function () {
            Route::delete('{issue}', [IssueController::class, 'destroy'])->name('destroy');
        });
    });

    // Logs: Role-based access
    Route::prefix('logs')->name('logs.')->group(function () {
        // Technician: Create and update logs (task resolution)
        Route::middleware(RoleMiddleware::class.':technician')->group(function () {
            Route::post('/', [LogController::class, 'store'])->name('store');
            Route::put('{log}', [LogController::class, 'update'])->name('update');
        });
        
        // Admin, Technician: View logs
        Route::middleware(RoleMiddleware::class.':admin,technician')->group(function () {
            Route::get('/', [LogController::class, 'index'])->name('index');
            Route::get('{log}', [LogController::class, 'show'])->name('show');
        });
        
        // Admin: Delete logs
        Route::middleware(RoleMiddleware::class.':admin')->group(function () {
            Route::delete('{log}', [LogController::class, 'destroy'])->name('destroy');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
