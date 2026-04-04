import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import "leaflet/dist/leaflet.css";

interface Store {
  id: number;
  name: string;
  address: string;
  state: string;
  stateLabel: string;
  position: [number, number];
}

const stores: Store[] = [
  { id: 1, name: "Shopping Center 3", address: "Av. Paulista, 2064 – Cerqueira César, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.5558, -46.6621] },
  { id: 2, name: "Mooca Plaza Shopping", address: "Rua Capitão Pacheco e Chaves, 313 – Vila Prudente, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.5732, -46.5928] },
  { id: 3, name: "Shopping Taboão", address: "Rodovia Régis Bittencourt, km 272 – Taboão da Serra – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.6265, -46.7588] },
  { id: 4, name: "Internacional Shopping Guarulhos", address: "Rodovia Presidente Dutra, km 225 – Guarulhos – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.4656, -46.5322] },
  { id: 5, name: "Shopping Boulevard Tatuapé", address: "Rua Gonçalves Crespo, 78 – Tatuapé, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.5362, -46.5764] },
  { id: 6, name: "Shopping Metrô Tatuapé", address: "Rua Domingos Agostim, 91 – Tatuapé, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.5405, -46.5753] },
  { id: 7, name: "Shopping Metrô Tucuruvi", address: "Av. Dr. Antonio Maria Laet, 566 – Tucuruvi, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.4793, -46.6027] },
  { id: 8, name: "Shopping Bourbon", address: "Rua Palestra Itália, 500 – Perdizes, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.5276, -46.6802] },
  { id: 9, name: "Tietê Plaza Shopping", address: "Av. Raimundo Pereira de Magalhães, 1465 – Pirituba, São Paulo – SP", state: "SP", stateLabel: "São Paulo (SP)", position: [-23.4859, -46.7267] },
  { id: 10, name: "Pátio Central Shopping", address: "Rua Olegário Maciel, 742 – Centro, Patos de Minas – MG", state: "MG", stateLabel: "Minas Gerais (MG)", position: [-18.5881, -46.5181] },
  { id: 11, name: "Via Café Shopping Center", address: "Av. Princesa do Sul, 1500 – Jardim Andere, Varginha – MG", state: "MG", stateLabel: "Minas Gerais (MG)", position: [-21.5610, -45.4357] },
];

const allBounds = L.latLngBounds(stores.map(s => s.position)).pad(0.1);

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

function MapController({ position, resetKey }: { position: [number, number] | null; resetKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 0.8 });
  }, [position, map]);
  useEffect(() => {
    if (resetKey > 0) map.flyToBounds(allBounds, { duration: 0.8 });
  }, [resetKey, map]);
  return null;
}

const StoreLocator = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const grouped = useMemo(() => {
    const groups: { label: string; stores: Store[] }[] = [];
    const seen = new Set<string>();
    for (const s of stores) {
      if (!seen.has(s.state)) {
        seen.add(s.state);
        groups.push({ label: s.stateLabel, stores: stores.filter(x => x.state === s.state) });
      }
    }
    return groups;
  }, []);

  const selectedPosition = selected ? stores.find(s => s.id === selected)?.position ?? null : null;

  const handleSelect = (id: number) => {
    setSelected(id);
    const el = document.getElementById(`store-card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleReset = () => {
    setSelected(null);
    setResetKey(k => k + 1);
  };

  return (
    <section className="py-16 px-5 bg-background">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center flex-1">
              Presença real em 11 lojas ativas
            </h2>
          </div>
          <p className="text-center text-muted-foreground mb-10">
            Visite uma de nossas lojas físicas
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-[400px] md:h-[500px]">
              <MapContainer
                bounds={allBounds}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <MapController position={selectedPosition} resetKey={resetKey} />
                {stores.map(store => (
                  <Marker
                    key={store.id}
                    position={store.position}
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
                      <button
                        key={store.id}
                        id={`store-card-${store.id}`}
                        onClick={() => handleSelect(store.id)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-all duration-200 ${
                          selected === store.id
                            ? "ring-2 ring-primary bg-primary/5 border-primary/30"
                            : "border-border hover:border-primary/20 hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selected === store.id ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">{store.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{store.address}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StoreLocator;
