<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    public const ROLES = ['student', 'faculty', 'partner'];

    public const ROLE_LABELS = [
        'student' => 'Student',
        'faculty' => 'Faculty Member',
        'partner' => 'External Partner',
    ];

    protected $fillable = [
        'role', 'account_status',
        'name', 'student_number', 'email', 'password', 'program', 'year_level', 'skills', 'profile_completeness',
        'employee_id', 'position', 'department',
        'company_name', 'job_title', 'contact_number',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'skills' => 'array'];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function roleLabel(): string
    {
        return self::ROLE_LABELS[$this->role] ?? 'User';
    }
}
