import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type MapPreviewProps = {
  label?: string;
  required?: boolean;
  heightClassName?: string;
  latitude?: number | null;
  longitude?: number | null;
  interactive?: boolean;
  showInteractiveHint?: boolean;
  onChange?: (coordinates: { latitude: number; longitude: number }) => void;
};

const DEFAULT_COORDINATES = {
  latitude: -23.588197,
  longitude: -46.657634,
};

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  return null;
}

function MapClickHandler({
  interactive,
  onChange,
}: {
  interactive: boolean;
  onChange?: (coordinates: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(event) {
      if (!interactive || !onChange) {
        return;
      }

      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapPreview({
  label = "Ponto de encontro",
  required = false,
  heightClassName = "h-[248px]",
  latitude = DEFAULT_COORDINATES.latitude,
  longitude = DEFAULT_COORDINATES.longitude,
  interactive = false,
  showInteractiveHint = true,
  onChange,
}: MapPreviewProps) {
  const resolvedLatitude = latitude ?? DEFAULT_COORDINATES.latitude;
  const resolvedLongitude = longitude ?? DEFAULT_COORDINATES.longitude;

  return (
    <div className="min-w-0 max-w-full space-y-2">
      <div className="text-label text-[var(--color-title)]">
        {label}
        {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
      </div>

      {interactive && showInteractiveHint ? (
        <p className="text-sm text-[var(--color-placeholder)]">
          Clique no mapa para definir latitude e longitude.
        </p>
      ) : null}

      <div
        className={`relative w-full min-w-0 max-w-full overflow-hidden rounded-[10px] border border-[var(--color-border)] ${heightClassName}`}
      >
        <MapContainer
          center={[resolvedLatitude, resolvedLongitude]}
          zoom={15}
          scrollWheelZoom={interactive}
          className="z-0 h-full w-full min-w-0"
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenter latitude={resolvedLatitude} longitude={resolvedLongitude} />
          <MapClickHandler interactive={interactive} onChange={onChange} />

          <CircleMarker
            center={[resolvedLatitude, resolvedLongitude]}
            radius={10}
            pathOptions={{
              color: "#009966",
              fillColor: "#00BC7D",
              fillOpacity: 0.95,
              weight: 2,
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export { MapPreview };
