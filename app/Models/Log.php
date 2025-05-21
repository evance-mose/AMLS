<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Log extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'issue_id', 'action_taken','status','priority'];


    public function user()
    {
    return $this->belongsTo(User::class);
    }

    public function issue()
    {
        return $this->belongsTo(Issue::class);
    }
}
