<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Issue extends Model
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'assigned_to', 'location', "atm_id", 'category', 'description', 'status', 'priority'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }
}
