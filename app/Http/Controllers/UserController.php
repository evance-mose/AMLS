<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
   
    public function index()
    {
        return Inertia::render('users/index', ['data' => User::all()]);
    }

 
    public function create()
    {
   
    }

    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'role' => 'required|in:admin,technician,custodian',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'password' => Hash::make($validated['password']),
            ]);
            
            event(new Registered($user));
            
            Log::info('User created', ['id' => $user->id, 'email' => $user->email]);
            
            return to_route('users')->with('success', 'User created successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to create user', ['error' => $e->getMessage()]);
            return back()->withInput()->with('error', 'Failed to create user. Please try again.');
        }
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

   
    public function update(Request $request, string $id)
    {
        //
    }

   
    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();
            return redirect()->back()->with('success', 'User deleted successfully.');
        } catch (Exception $e) {
            Log::error('User deletion failed: ' . $e->getMessage());
        }
    }
}