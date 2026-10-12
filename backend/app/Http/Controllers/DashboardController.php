<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use App\Services\Matcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $apps = Application::with('internship')->where('user_id', $user->id)->latest()->get();

        $recommended = Matcher::recommend(implode(' ', $user->skills ?? []).' '.$user->program, 3);
        if (count($recommended) === 0) {
            $recommended = Internship::where('is_active', true)->latest()->take(3)->get()
                ->map(fn ($i) => $i->toArray() + ['matched' => []])->all();
        }

        return response()->json([
            'user' => $user,
            'stats' => [
                'applications' => $apps->count(),
                'under_review' => $apps->where('status', 'Under review')->count(),
                'endorsed' => $apps->where('status', 'Endorsed')->count(),
                'pending' => $apps->where('status', 'Pending')->count(),
            ],
            'recommended' => $recommended,
            'updates' => $apps->take(4)->map(fn ($a) => [
                'company' => $a->internship->company,
                'title' => $a->internship->title,
                'status' => $a->status,
                'internship_id' => $a->internship_id,
            ])->values(),
        ]);
    }
}
