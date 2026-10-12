<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'student_number', 'email', 'password', 'program', 'year_level', 'skills', 'profile_completeness'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'skills' => 'array'];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
