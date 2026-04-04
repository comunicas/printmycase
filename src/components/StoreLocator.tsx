import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Instagram } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { injectJsonLd } from "@/lib/seo";
import "leaflet/dist/leaflet.css";

interface Store {
  id: string;
  name: string;
  address: string;
  state: string;
  state_label: string;
  lat: number;
  lng: number;
  instagram_url: string | null;
  slug: string | null;
}

const createPinIcon = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [24, 34],
    iconAnchor: [12, 34],
    popupAnchor: [0, -36],
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34" style="filter: ${active ? "drop-shadow(0 0 6px hsl(265 83% 57% / .5))" : "none"}; transform: scale(${active ? 1.3 : 1}); transform-origin: bottom center;">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="hsl(265, 83%, 57%)" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="11" r="4.5" fill="white"/>
    </svg>`,
  });

function MapController({ position, resetKey, bounds }: { position: [number, number] | null; resetKey: number; bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 0.8 });
  }, [position, map]);
  useEffect(() => {
    if (resetKey > 0 && bounds) map.flyToBounds(bounds, { duration: 0.8 });
  }, [resetKey, map, bounds]);
  return null;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";

function parseAddressParts(address: string) {
  const parts = address.split("–").map(p => p.trim());
  const streetAddress = parts[0] || address;
  const locality = parts.length >= 2 ? parts[parts.length - 2] : "";
  return { streetAddress, locality };
}

const StoreLocator = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    supabase
      .from("stores")
      .select("id, name, address, state, state_label, lat, lng, instagram_url, slug")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setStores((data as Store[]) ?? []);
        setLoading(false);
      });
  }, []);

  // JSON-LD LocalBusiness structured data
  useEffect(() => {
    if (stores.length === 0) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Lojas PrintMyCase",
      numberOfItems: stores.length,
      itemListElement: stores.map((s, i) => {
        const { streetAddress, locality } = parseAddressParts(s.address);
        const storeData: Record<string, unknown> = {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Store",
            name: `PrintMyCase – ${s.name}`,
            address: {
              "@type": "PostalAddress",
              streetAddress,
              addressLocality: locality,
              addressRegion: s.state,
              addressCountry: "BR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: s.lat,
              longitude: s.lng,
            },
            url: `${SITE_URL}/#loja-${s.slug || s.id}`,
            image: `${SITE_URL}/og-image.png`,
            parentOrganization: { "@type": "Organization", name: "PrintMyCase" },
          },
        };
        if (s.instagram_url) {
          (storeData.item as Record<string, unknown>).sameAs = [s.instagram_url];
        }
        return storeData;
      }),
    };
    return injectJsonLd("store-locator", jsonLd);
  }, [stores]);

  const allBounds = useMemo(() => {
    if (stores.length === 0) return null;
    return L.latLngBounds(stores.map(s => [s.lat, s.lng] as [number, number])).pad(0.1);
  }, [stores]);

  const grouped = useMemo(() => {
    const groups: { label: string; stores: Store[] }[] = [];
    const seen = new Set<string>();
    for (const s of stores) {
      if (!seen.has(s.state)) {
        seen.add(s.state);
        groups.push({ label: s.state_label, stores: stores.filter(x => x.state === s.state) });
      }
    }
    return groups;
  }, [stores]);

  const selectedStore = selected ? stores.find(s => s.id === selected) : null;
  const selectedPosition: [number, number] | null = selectedStore ? [selectedStore.lat, selectedStore.lng] : null;

  const handleSelect = (id: string) => {
    setSelected(id);
    const el = document.getElementById(`store-card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleReset = () => {
    setSelected(null);
    setResetKey(k => k + 1);
  };

  if (loading) {
    return (
      <section className="py-16 px-5 bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <div className="h-8 w-64 mx-auto bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-96 mx-auto bg-muted rounded animate-pulse" />
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="py-16 px-5 bg-background" id="lojas" aria-label="Lojas PrintMyCase">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-center flex-1 text-accent-foreground">
            A rede de capas personalizadas que mais cresce no Brasil.
          </h2>
        </div>
        <p className="text-center text-muted-foreground mb-10">
          Encontre a loja mais perto de você. Capinhas personalizadas com IA em shopping centers de São Paulo e Minas Gerais.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-[400px] md:h-[500px]">
              {allBounds && (
                <MapContainer
                  bounds={allBounds}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <MapController position={selectedPosition} resetKey={resetKey} bounds={allBounds} />
                  {stores.map(store => (
                    <Marker
                      key={store.id}
                      position={[store.lat, store.lng]}
                      icon={createPinIcon(selected === store.id)}
                      eventHandlers={{ click: () => handleSelect(store.id) }}
                    >
                      <Popup>
                        <strong>{store.name}</strong>
                        <br />
                        <span className="text-xs">{store.address}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
              {selected && (
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 z-[1000] bg-background/90 backdrop-blur-sm text-xs font-medium text-primary px-3 py-1.5 rounded-full shadow-sm border border-border hover:bg-background transition-colors"
                >
                  Ver todas as lojas
                </button>
              )}
            </div>

            {/* Store List */}
            <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto space-y-4 pr-1">
              {grouped.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.stores.map(store => (
                      <article
                        key={store.id}
                        id={`store-card-${store.id}`}
                        itemScope
                        itemType="https://schema.org/Store"
                        onClick={() => handleSelect(store.id)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-all duration-200 cursor-pointer ${
                          selected === store.id
                            ? "ring-2 ring-primary bg-primary/5 border-primary/30"
                            : "border-border hover:border-primary/20 hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selected === store.id ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight" itemProp="name">{store.name}</p>
                            <address className="not-italic text-xs text-muted-foreground mt-0.5 leading-snug" itemProp="address">
                              {store.address}
                            </address>
                            <div className="flex items-center gap-2 mt-1.5">
                              <a
                                href={`https://waze.com/ul?ll=${store.lat},${store.lng}&navigate=yes`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Como chegar em ${store.name} via Waze`}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                              >
                                <Navigation className="w-3 h-3" />
                                Como Chegar
                              </a>
                              {store.instagram_url && (
                                <a
                                  href={store.instagram_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Instagram de ${store.name}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary"
                                >
                                  <Instagram className="w-3 h-3" />
                                  Instagram
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <meta itemProp="latitude" content={String(store.lat)} />
                        <meta itemProp="longitude" content={String(store.lng)} />
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </section>
  );
};

export default StoreLocator;
