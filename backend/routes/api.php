<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InternshipController;
use Illuminate\Support\Facades\Route;

// Named rate limiters are defined in App\Providers\AppServiceProvider.
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('throttle:browse')->group(function () {
    Route::get('/internships', [InternshipController::class, 'index']);
    Route::get('/internships/filters', [InternshipController::class, 'filters']);
    Route::get('/internships/{internship}', [InternshipController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'throttle:app'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', DashboardController::class);

    Route::post('/internships/{internship}/apply', [ApplicationController::class, 'store']);
    Route::get('/applications', [ApplicationController::class, 'index']);

    Route::post('/chat', [ChatController::class, 'send'])->middleware('throttle:chat');
});