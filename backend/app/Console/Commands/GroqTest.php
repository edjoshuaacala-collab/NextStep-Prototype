<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GroqTest extends Command
{
    protected $signature = 'groq:test {--models : Also check the configured model against the live Groq model list}';

    protected $description = 'Send one small test request to Groq and report the result (the API key is never printed).';

    public function handle(): int
    {
        $trim = " \t\n\r\0\x0B\"'";
        $key = trim((string) config('services.groq.key'), $trim);
        $model = trim((string) config('services.groq.model'), $trim);

        $this->line('Endpoint : https://api.groq.com/openai/v1/chat/completions');
        $this->line('Model    : ' . ($model !== '' ? $model : '(MISSING)'));
        $this->line('API key  : ' . ($key !== ''
            ? 'set (' . strlen($key) . ' characters, starts with "' . substr($key, 0, 4) . '")'
            : 'MISSING'));

        if ($key === '' || $model === '') {
            $this->error('GROQ_API_KEY or GROQ_MODEL is empty. Set both in your environment variables.');

            return self::FAILURE;
        }

        if ($this->option('models')) {
            $list = Http::withToken($key)->acceptJson()->timeout(20)
                ->get('https://api.groq.com/openai/v1/models');

            if ($list->successful()) {
                $ids = collect($list->json('data'))->pluck('id')->filter()->sort()->values();
                $this->line('Live model list (' . $ids->count() . ' models):');
                foreach ($ids as $id) {
                    $this->line('  - ' . $id);
                }
                $this->line($ids->contains($model)
                    ? 'Configured model IS in the live list.'
                    : 'Configured model is NOT in the live list. Pick one from the list above.');
            } else {
                $this->error('Could not load the model list. HTTP status: ' . $list->status());
            }
        }

        $payload = [
            'model' => $model,
            'temperature' => 0.2,
            'max_completion_tokens' => 1024,
            'messages' => [
                ['role' => 'user', 'content' => 'Reply with exactly this text and nothing else: GROQ_OK'],
            ],
        ];

        if (str_starts_with($model, 'openai/gpt-oss-')) {
            $payload['reasoning_effort'] = 'low';
            $payload['include_reasoning'] = false;
        }

        try {
            $response = Http::withToken($key)->acceptJson()->timeout(20)
                ->post('https://api.groq.com/openai/v1/chat/completions', $payload);
        } catch (\Throwable $e) {
            $this->error('The request could not be sent: ' . get_class($e));

            return self::FAILURE;
        }

        $this->line('HTTP status: ' . $response->status());

        if (! $response->successful()) {
            $this->error('Groq error type   : ' . ($response->json('error.type') ?? 'n/a'));
            $this->error('Groq error code   : ' . ($response->json('error.code') ?? 'n/a'));
            $this->error('Groq error message: ' . mb_substr((string) ($response->json('error.message') ?? 'n/a'), 0, 300));

            return self::FAILURE;
        }

        $reply = trim((string) $response->json('choices.0.message.content'));

        $this->info('SUCCESS - Groq replied: ' . ($reply !== '' ? $reply : '(empty reply)'));
        $this->line('Tokens used: prompt ' . ($response->json('usage.prompt_tokens') ?? '?')
            . ', completion ' . ($response->json('usage.completion_tokens') ?? '?'));

        return $reply !== '' ? self::SUCCESS : self::FAILURE;
    }
}
