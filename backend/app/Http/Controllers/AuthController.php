<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public const FACULTY_POSITIONS = ['Internship Coordinator', 'Faculty Adviser'];

    public function register(Request $request): JsonResponse
    {
        $request->validate(['role' => ['sometimes', Rule::in(User::ROLES)]]);
        $role = $request->input('role', 'student');

        $rules = [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)->letters()->numbers()],
        ];

        $messages = [];

        if ($role === 'student') {
            $rules['student_number'] = ['required', 'string', 'regex:/^\d{2}-\d{6}$/', 'unique:users,student_number'];
            $messages['student_number.regex'] = 'Student number must look like 00-000000.';
        } elseif ($role === 'faculty') {
            $rules['employee_id'] = ['required', 'string', 'max:30', 'unique:users,employee_id'];
            $rules['position'] = ['required', Rule::in(self::FACULTY_POSITIONS)];
            $rules['department'] = ['required', 'string', 'max:120'];
        } else {
            $rules['company_name'] = ['required', 'string', 'max:150'];
            $rules['job_title'] = ['required', 'string', 'max:100'];
            $rules['contact_number'] = ['required', 'string', 'regex:/^[0-9+()\-\s]{7,20}$/'];
            $messages['contact_number.regex'] = 'Enter a valid contact number, like 0917 123 4567.';
        }

        $data = $request->validate($rules, $messages);

        $user = User::create($data + [
            'role' => $role,
            // Partners wait for the internship office before they can log in.
            'account_status' => $role === 'partner' ? 'pending' : 'active',
            'skills' => [],
            'profile_completeness' => 40,
        ]);

        if ($user->account_status === 'pending') {
            return response()->json([
                'pending' => true,
                'message' => 'Request submitted. The JRU internship office will review your partner account before you can log in.',
            ], 201);
        }

        return response()->json([
            'token' => $user->createToken('nextstep')->plainTextToken,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['sometimes', Rule::in(User::ROLES)],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.', 'errors' => ['email' => ['Invalid email or password.']]], 422);
        }

        if (isset($data['role']) && $user->role !== $data['role']) {
            $message = 'This account is registered as a '.$user->roleLabel().'. Go back and choose that role to log in.';

            return response()->json(['message' => $message, 'errors' => ['email' => [$message]]], 422);
        }

        if ($user->account_status === 'pending') {
            $message = 'Your partner account is still waiting for approval from the JRU internship office.';

            return response()->json(['message' => $message, 'errors' => ['email' => [$message]]], 403);
        }

        return response()->json([
            'token' => $user->createToken('nextstep')->plainTextToken,
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }
}
