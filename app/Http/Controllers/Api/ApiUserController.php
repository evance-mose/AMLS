<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Exception;

class ApiUserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'role' => 'required|in:admin,technician,custodian',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'expertise' => 'nullable|array',
            'expertise.*' => 'in:dispenser_errors,card_reader_errors,receipt_printer_errors,epp_errors,pc_core_errors,journal_printer_errors,recycling_module_errors,other',
            'availability' => 'nullable|in:available,busy,unavailable'
        ]);
            
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'expertise' => $validated['expertise'] ?? null,
            'availability' => $validated['availability'] ?? 'available',
        ]);
        
        event(new Registered($user)); 
            
        return response()->json(['message' => 'User created successfully.', 'user' => $user], 201);
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'role' => 'required|in:admin,technician,custodian',
            'status' => 'required|in:active,inactive',
            'expertise' => 'nullable|array',
            'expertise.*' => 'in:dispenser_errors,card_reader_errors,receipt_printer_errors,epp_errors,pc_core_errors,journal_printer_errors,recycling_module_errors,other',
            'availability' => 'nullable|in:available,busy,unavailable'
        ]);
        
        $user->update($validated);
    
        return response()->json(['message' => 'User updated successfully.', 'user' => $user]);
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully.']);
        } catch (Exception $e) {
            Log::error('User deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'User deletion failed.'], 500);
        }
    }
}
