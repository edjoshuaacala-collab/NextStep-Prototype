<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Each limiter below has its own counter. (Plain "throttle:10,1" shares
        // one counter per IP across every route, so browsing listings used to
        // use up the login/register allowance.)

        // Login: 10 tries per minute per email + IP, with a looser per-IP cap so
        // a whole class on the same Wi-Fi doesn't get locked out together.
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(10)->by('login|'.strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(60)->by('login-ip|'.$request->ip()),
        ]);

        // Registration: per IP, high enough for a class signing up together.
        RateLimiter::for('register', fn (Request $request) => Limit::perMinute(30)->by('register|'.$request->ip()));

        // Public listing pages: per logged-in user when there is one, else per IP.
        RateLimiter::for('browse', fn (Request $request) => Limit::perMinute(120)->by(
            'browse|'.($request->user('sanctum')?->getAuthIdentifier() ?? $request->ip())
        ));

        // Logged-in app requests and the chat each get their own per-user counter.
        RateLimiter::for('app', fn (Request $request) => Limit::perMinute(120)->by('app|'.($request->user()?->getAuthIdentifier() ?? $request->ip())));
        RateLimiter::for('chat', fn (Request $request) => Limit::perMinute(30)->by('chat|'.($request->user()?->getAuthIdentifier() ?? $request->ip())));
    }
}
