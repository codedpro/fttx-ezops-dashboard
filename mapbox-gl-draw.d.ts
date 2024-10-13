// Assuming this is in a global declaration file like global.d.ts
import * as mapboxgl from 'mapbox-gl';

declare module 'mapbox-gl' {
  export interface Map {
    // Mapbox Draw Events
    on(
      type: 'draw.create' | 'draw.delete' | 'draw.update',
      listener: (e: DrawEvent) => void
    ): this;
    off(
      type: 'draw.create' | 'draw.delete' | 'draw.update',
      listener: (e: DrawEvent) => void
    ): this;
  }
}

interface DrawEvent {
  type: 'draw.create' | 'draw.delete' | 'draw.update';
  features: GeoJSON.Feature<GeoJSON.Geometry>[];
}
