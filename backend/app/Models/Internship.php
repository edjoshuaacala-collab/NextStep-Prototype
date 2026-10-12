<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = ['title', 'company', 'role_category', 'location', 'work_setup', 'description', 'skills', 'slots', 'duration', 'allowance', 'deadline', 'is_active'];

    protected function casts(): array
    {
        return ['skills' => 'array', 'is_active' => 'boolean', 'deadline' => 'date:Y-m-d'];
    }
}
