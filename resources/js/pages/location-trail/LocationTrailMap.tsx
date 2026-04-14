import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Fragment, useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';

export interface TrailMapLayer {
    userId: number;
    label: string;
    /** [lat, lng][] chronological */
    path: [number, number][];
    latest: [number, number] | null;
}

function hueForUser(id: number): string {
    return `hsl(${(id * 47) % 360} 72% 42%)`;
}

function FitBounds({ layers }: { layers: TrailMapLayer[] }) {
    const map = useMap();

    useEffect(() => {
        const coords: [number, number][] = [];
        for (const layer of layers) {
            for (const p of layer.path) {
                coords.push(p);
            }
            if (layer.latest) {
                coords.push(layer.latest);
            }
        }
        if (coords.length === 0) {
            return;
        }
        if (coords.length === 1) {
            map.setView(coords[0], 15);
            return;
        }
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }, [map, layers]);

    return null;
}

/** Leaflet often measures 0×0 when mounted inside flex/sidebar; fix after layout. */
function MapResizeFix() {
    const map = useMap();

    useEffect(() => {
        const run = (): void => {
            map.invalidateSize({ animate: false });
        };
        run();
        const raf = requestAnimationFrame(run);
        const t1 = window.setTimeout(run, 50);
        const t2 = window.setTimeout(run, 300);
        window.addEventListener('resize', run);
        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.removeEventListener('resize', run);
        };
    }, [map]);

    return null;
}

export default function LocationTrailMap({ layers }: { layers: TrailMapLayer[] }) {
    const hasData = layers.length > 0;
    // Default to Malawi when there are no points yet.
    const firstCoord: [number, number] = hasData ? (layers[0].latest ?? layers[0].path[0]) : [-13.2543, 34.3015];

    return (
        <div className="location-trail-map border-border relative h-[min(420px,55vh)] min-h-[280px] w-full overflow-hidden rounded-md border sm:h-[420px]">
            <MapContainer
                center={firstCoord}
                zoom={hasData ? 13 : 7}
                className="!absolute inset-0 z-0 block size-full"
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeFix />
                {hasData && <FitBounds layers={layers} />}
                {layers.map((layer) => {
                    const color = hueForUser(layer.userId);
                    return (
                        <Fragment key={layer.userId}>
                            {layer.path.length > 1 && (
                                <Polyline pathOptions={{ color, weight: 4, opacity: 0.85 }} positions={layer.path} />
                            )}
                            {layer.latest && (
                                <CircleMarker
                                    center={layer.latest}
                                    radius={layer.path.length > 1 ? 8 : 7}
                                    pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 2 }}
                                >
                                    <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                                        <span className="font-medium">{layer.label}</span>
                                        <br />
                                        <span className="text-xs">
                                            {layer.path.length > 1 ? 'Latest position' : 'Only sample in window'}
                                        </span>
                                    </Tooltip>
                                </CircleMarker>
                            )}
                        </Fragment>
                    );
                })}
            </MapContainer>
            {!hasData && (
                <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center p-4">
                    <p className="bg-background/90 text-muted-foreground max-w-sm rounded-md border px-4 py-3 text-center text-sm shadow-sm">
                        No GPS points in this time window. Widen the time range or wait for technicians to sync from the app.
                    </p>
                </div>
            )}
        </div>
    );
}
