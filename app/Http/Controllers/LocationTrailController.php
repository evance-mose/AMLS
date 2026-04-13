<?php

namespace App\Http\Controllers;

use App\Models\LocationTrailPoint;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationTrailController extends Controller
{
    public function index(Request $request): Response
    {
        $defaultHours = config('location_trail.default_list_hours', 72);
        $validated = $request->validate([
            'hours' => 'sometimes|integer|min:1|max:8760',
        ]);
        $hours = $validated['hours'] ?? $defaultHours;

        $since = now()->subHours($hours);

        $trailPoints = LocationTrailPoint::query()
            ->with(['user:id,name'])
            ->where('recorded_at', '>=', $since)
            ->orderByDesc('recorded_at')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'latitude' => $p->latitude,
                'longitude' => $p->longitude,
                'accuracy_meters' => $p->accuracy_meters,
                'recorded_at' => $p->recorded_at->utc()->toIso8601String(),
                'user' => $p->user ? ['id' => $p->user->id, 'name' => $p->user->name] : null,
            ]);

        $technicians = User::query()
            ->where('role', 'technician')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('location-trail/index', [
            'trailPoints' => $trailPoints,
            'technicians' => $technicians,
            'hours' => $hours,
            'hourOptions' => [24, 72, 168, 336],
        ]);
    }
}
