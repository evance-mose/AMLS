<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $tries = 3; // Number of retry attempts
    public $timeout = 30; // Timeout in seconds

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function build()
    {
        return $this->subject('Welcome to ' . config('app.name'))
                    ->view('emails.welcome')
                    ->with([
                        'user' => $this->user,
                        'unsubscribeLink' => route('unsubscribe', ['email' => $this->user->email])
                    ]);
    }
} 