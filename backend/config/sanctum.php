<?php

// Token (bearer) authentication only - no cookie/session SPA mode.
return [
    'stateful' => [],
    'guard' => [],
    'expiration' => 60 * 24 * 7, // tokens expire after 7 days (minutes)
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
];
