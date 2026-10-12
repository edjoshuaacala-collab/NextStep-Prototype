<?php

return [
    // Leave GROQ_API_KEY empty to use the built-in rule-based assistant.
    'groq' => [
        'key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    ],
];
