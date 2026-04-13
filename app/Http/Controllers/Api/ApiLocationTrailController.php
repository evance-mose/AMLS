<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LocationTrailPoint;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiLocationTrailController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy_meters' => 'required|numeric|min:0',
            'recorded_at' => 'required|date',
        ]);

        $point = LocationTrailPoint::create([
            'user_id' => Auth::id(),
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'accuracy_meters' => $validated['accuracy_meters'],
            'recorded_at' => Carbon::parse($validated['recorded_at'])->utc(),
        ]);

        return response()->json([
            'message' => 'Location recorded.',
            'id' => $point->id,
        ], 201);
    }

    public function index(Request $request)
    {
        $defaultHours = config('location_trail.default_list_hours', 72);
        $validated = $request->validate([
            'hours' => 'sometimes|integer|min:1|max:8760',
        ]);
        $hours = $validated['hours'] ?? $defaultHours;

        $since = now()->subHours($hours);

        $points = LocationTrailPoint::query()
            ->with(['user:id,name'])
            ->where('recorded_at', '>=', $since)
            ->orderByDesc('recorded_at')
            ->get();

        $data = $points->map(function (LocationTrailPoint $p) {
            return [
                'user_id' => $p->user_id,
                'latitude' => $p->latitude,
                'longitude' => $p->longitude,
                'accuracy_meters' => $p->accuracy_meters,
                'recorded_at' => $p->recorded_at->utc()->toIso8601String(),
                'user' => $p->user
                    ? ['id' => $p->user->id, 'name' => $p->user->name]
                    : null,
                'user_name' => $p->user?->name,
            ];
        });

        return response()->json(['data' => $data]);
    }
}
