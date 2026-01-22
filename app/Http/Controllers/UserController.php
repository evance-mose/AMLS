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
use Illuminate\Validation\Rule;

class UserController extends Controller
{
   
    public function index()
    {
        return Inertia::render('users/index', ['data' => User::all()]);
    }

 
    public function create()
    {
   
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
            
        return redirect()->back()->with('success', 'User created successfully.');
      
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
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
    
        return redirect()->back()->with('success', 'User updated successfully.');
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