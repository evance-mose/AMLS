<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $fillable = ['user_id', 'issue_id', 'action', 'type', 'issue', 'description', 'status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }
}
