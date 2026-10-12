<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:150'],
            'role' => ['nullable', 'string', 'max:150'],
            'skills' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
        ]);

        $query = Internship::where('is_active', true)->orderBy('id');

        if ($s = $request->query('search')) {
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")
                ->orWhere('company', 'like', "%{$s}%")
                ->orWhere('description', 'like', "%{$s}%")
                ->orWhere('skills', 'like', "%{$s}%"));
        }

        if ($v = $request->query('company')) {
            $query->where('company', $v);
        }

        if ($v = $request->query('role')) {
            $query->where('role_category', $v);
        }

        if ($v = $request->query('location')) {
            $query->where('location', $v);
        }

        if ($v = $request->query('skills')) {
            $query->where('skills', 'like', '%'.$v.'%');
        }

        $applied = collect();
        $user = $request->user();

        if ($user) {
            $applied = Application::where('user_id', $user->id)
                ->pluck('status', 'internship_id');
        }

        $items = $query->get()->map(function (Internship $i) use ($applied) {
            return $i->toArray() + [
                'application_status' => $applied[$i->id] ?? null,
            ];
        });

        return response()->json([
            'data' => $items,
            'total' => $items->count(),
        ]);
    }

    public function filters(): JsonResponse
    {
        $all = Internship::where('is_active', true)->get();

        return response()->json([
            'companies' => $all->pluck('company')->unique()->sort()->values(),
            'roles' => $all->pluck('role_category')->unique()->sort()->values(),
            'locations' => $all->pluck('location')->unique()->sort()->values(),
            'skills' => $all->flatMap(fn ($i) => $i->skills)->unique()->sort()->values(),
        ]);
    }

    public function show(Request $request, Internship $internship): JsonResponse
    {
        $application = null;
        $user = $request->user();

        if ($user) {
            $application = Application::where('user_id', $user->id)
                ->where('internship_id', $internship->id)
                ->first();
        }

        return response()->json([
            'data' => $internship->toArray() + [
                'application_status' => $application?->status,
            ],
        ]);
    }
}
