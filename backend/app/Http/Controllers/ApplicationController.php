<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $apps = Application::with('internship')
            ->where('user_id', $request->user()->id)
            ->latest()->get();

        return response()->json(['data' => $apps]);
    }

    /** Demo application: stored in the database with status "Pending". */
    public function store(Request $request, Internship $internship): JsonResponse
    {
        $data = $request->validate(['cover_note' => ['nullable', 'string', 'max:1000']]);

        if (! $internship->is_active) {
            return response()->json(['message' => 'This listing is closed.'], 422);
        }

        $existing = Application::where('user_id', $request->user()->id)
            ->where('internship_id', $internship->id)->first();

        if ($existing) {
            return response()->json(['message' => 'You already applied to this internship.'], 409);
        }

        $application = Application::create([
            'user_id' => $request->user()->id,
            'internship_id' => $internship->id,
            'status' => 'Pending',
            'cover_note' => $data['cover_note'] ?? null,
        ]);

        return response()->json(['data' => $application->load('internship'), 'message' => 'Application submitted (demo).'], 201);
    }
}
