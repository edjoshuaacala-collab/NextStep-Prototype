<?php

return [
    // Leave GROQ_API_KEY empty to use the built-in rule-based assistant.
    'groq' => [
        'key' => env('GROQ_API_KEY'),
        'model' => env('GROQ_MODEL', 'openai/gpt-oss-120b'),
    ],
];
