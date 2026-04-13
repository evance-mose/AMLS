import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ExternalLink, MapPin } from 'lucide-react';
import { type ComponentType, useEffect, useMemo, useState } from 'react';
import type { TrailMapLayer } from './LocationTrailMap';

interface TrailUser {
    id: number;
    name: string;
}

export interface TrailPoint {
    id: number;
    user_id: number;
    latitude: number;
    longitude: number;
    accuracy_meters: number;
    recorded_at: string;
    user: TrailUser | null;
}

interface TechnicianRow {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    trailPoints: TrailPoint[];
    technicians: TechnicianRow[];
    hours: number;
    hourOptions: number[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Technician locations', href: '/location-trail' }];

function mapsUrl(lat: number, lon: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=16`;
}

function formatWhen(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return iso;
    }
}

export default function LocationTrailIndex({ trailPoints, technicians, hours, hourOptions }: PageProps) {
    const [technicianFilter, setTechnicianFilter] = useState<string>('all');
    const [MapComponent, setMapComponent] = useState<ComponentType<{ layers: TrailMapLayer[] }> | null>(null);

    useEffect(() => {
        void import('./LocationTrailMap').then((m) => setMapComponent(() => m.default));
    }, []);

    const pointsByUserId = useMemo(() => {
        const m = new Map<number, TrailPoint[]>();
        for (const p of trailPoints) {
            const list = m.get(p.user_id) ?? [];
            list.push(p);
            m.set(p.user_id, list);
        }
        return m;
    }, [trailPoints]);

    const summaries = useMemo(() => {
        return technicians.map((t) => {
            const pts = pointsByUserId.get(t.id) ?? [];
            let latest: TrailPoint | null = null;
            for (const p of pts) {
                if (!latest || new Date(p.recorded_at) > new Date(latest.recorded_at)) {
                    latest = p;
                }
            }
            return { technician: t, latest, count: pts.length };
        });
    }, [technicians, pointsByUserId]);

    const mapLayers = useMemo((): TrailMapLayer[] => {
        if (trailPoints.length === 0) {
            return [];
        }
        if (technicianFilter === 'all') {
            return technicians
                .map((t) => {
                    const pts = [...(pointsByUserId.get(t.id) ?? [])].sort(
                        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
                    );
                    if (pts.length === 0) {
                        return null;
                    }
                    const path: [number, number][] = pts.map((p) => [p.latitude, p.longitude]);
                    const last = pts[pts.length - 1];
                    return {
                        userId: t.id,
                        label: t.name,
                        path,
                        latest: [last.latitude, last.longitude],
                    };
                })
                .filter((x): x is TrailMapLayer => x !== null);
        }
        const id = Number(technicianFilter);
        const t = technicians.find((row) => row.id === id);
        const pts = [...(pointsByUserId.get(id) ?? [])].sort(
            (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
        );
        if (!t || pts.length === 0) {
            return [];
        }
        const path: [number, number][] = pts.map((p) => [p.latitude, p.longitude]);
        const last = pts[pts.length - 1];
        return [{ userId: id, label: t.name, path, latest: [last.latitude, last.longitude] }];
    }, [trailPoints, technicianFilter, technicians, pointsByUserId]);

    const tablePoints = useMemo(() => {
        if (technicianFilter === 'all') {
            return [...trailPoints].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
        }
        const id = Number(technicianFilter);
        return [...(pointsByUserId.get(id) ?? [])].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    }, [technicianFilter, trailPoints, pointsByUserId]);

    const changeHours = (value: string) => {
        router.get(
            route('location-trail.index'),
            { hours: Number(value) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Technician locations" />
            <div className="flex flex-1 flex-col gap-5 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Technician locations</h1>
                        <p className="text-muted-foreground">Latest GPS samples from the mobile app within the selected time window.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm whitespace-nowrap">Time window</span>
                            <Select value={String(hours)} onValueChange={changeHours}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {hourOptions.map((h) => (
                                        <SelectItem key={h} value={String(h)}>
                                            Last {h} hours
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm whitespace-nowrap">Technician</span>
                            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All technicians" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All technicians</SelectItem>
                                    {technicians.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Last known position per technician in this window.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Technician</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Last recorded</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead className="text-right">Map</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summaries.map(({ technician, latest, count }) => (
                                    <TableRow key={technician.id}>
                                        <TableCell className="font-medium">{technician.name}</TableCell>
                                        <TableCell>{count}</TableCell>
                                        <TableCell>{latest ? formatWhen(latest.recorded_at) : '—'}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm">
                                            {latest ? `${latest.latitude.toFixed(5)}, ${latest.longitude.toFixed(5)}` : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {latest ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={mapsUrl(latest.latitude, latest.longitude)} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="mr-1 h-3 w-3" />
                                                        Open
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No data</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {MapComponent ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Map</CardTitle>
                            <CardDescription>
                                OpenStreetMap tiles (no API key). Polylines follow samples in time order; the larger dot is the latest position.
                                {technicianFilter === 'all' ? ' Each technician has a distinct color.' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            <MapComponent layers={mapLayers} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="text-muted-foreground flex min-h-[200px] items-center justify-center py-8 text-sm">
                            Loading map…
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Point log</CardTitle>
                        <CardDescription>
                            {technicianFilter === 'all' ? 'All samples in the window.' : 'Samples for the selected technician.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        {tablePoints.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-sm">No location data in this period.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {technicianFilter === 'all' && <TableHead>Technician</TableHead>}
                                        <TableHead>Recorded</TableHead>
                                        <TableHead>Latitude</TableHead>
                                        <TableHead>Longitude</TableHead>
                                        <TableHead>Accuracy (m)</TableHead>
                                        <TableHead className="text-right">Map</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tablePoints.map((p) => (
                                        <TableRow key={p.id}>
                                            {technicianFilter === 'all' && (
                                                <TableCell className="font-medium">{p.user?.name ?? `User #${p.user_id}`}</TableCell>
                                            )}
                                            <TableCell>{formatWhen(p.recorded_at)}</TableCell>
                                            <TableCell className="font-mono text-sm">{p.latitude.toFixed(6)}</TableCell>
                                            <TableCell className="font-mono text-sm">{p.longitude.toFixed(6)}</TableCell>
                                            <TableCell>{p.accuracy_meters.toFixed(1)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={mapsUrl(p.latitude, p.longitude)} target="_blank" rel="noreferrer">
                                                        <MapPin className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
