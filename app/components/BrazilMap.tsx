"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MapPin, DollarSign, TrendingUp, Target, Award, Zap } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet" // Import L for custom icons

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface BrazilMapProps {
  data?: any[]
}

const brazilRegions = {
  Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
  Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
  "Centro-Oeste": ["DF", "GO", "MT", "MS"],
  Sudeste: ["ES", "MG", "RJ", "SP"],
  Sul: ["PR", "RS", "SC"],
}

const stateNames: { [key: string]: string } = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
}

const brazilCities = [
  { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333, region: "Sudeste" },
  { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729, region: "Sudeste" },
  { city: "Salvador", state: "BA", lat: -12.9714, lng: -38.5014, region: "Nordeste" },
  { city: "Fortaleza", state: "CE", lat: -3.7319, lng: -38.5267, region: "Nordeste" },
  { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345, region: "Sudeste" },
  { city: "Brasília", state: "DF", lat: -15.8267, lng: -47.9218, region: "Centro-Oeste" },
  { city: "Manaus", state: "AM", lat: -3.119, lng: -60.0217, region: "Norte" },
  { city: "Curitiba", state: "PR", lat: -25.4244, lng: -49.2654, region: "Sul" },
  { city: "Recife", state: "PE", lat: -8.0476, lng: -34.877, region: "Nordeste" },
  { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177, region: "Sul" },
  { city: "Belém", state: "PA", lat: -1.4558, lng: -48.5044, region: "Norte" },
  { city: "Goiânia", state: "GO", lat: -16.6869, lng: -49.2648, region: "Centro-Oeste" },
  { city: "João Pessoa", state: "PB", lat: -7.1195, lng: -34.845, region: "Nordeste" },
  { city: "Natal", state: "RN", lat: -5.7945, lng: -35.211, region: "Nordeste" },
  { city: "Campo Grande", state: "MS", lat: -20.4697, lng: -54.6201, region: "Centro-Oeste" },
  { city: "Florianópolis", state: "SC", lat: -27.5954, lng: -48.548, region: "Sul" },
  { city: "Aracaju", state: "SE", lat: -10.9472, lng: -37.0731, region: "Nordeste" },
  { city: "Teresina", state: "PI", lat: -5.0892, lng: -42.8019, region: "Nordeste" },
  { city: "Maceió", state: "AL", lat: -9.6658, lng: -35.7353, region: "Nordeste" },
  { city: "São Luís", state: "MA", lat: -2.5387, lng: -44.2825, region: "Nordeste" },
]

const BrazilMap: React.FC<BrazilMapProps> = ({ data = [] }) => {
  const [regionData, setRegionData] = useState<any[]>([])
  const [stateData, setStateData] = useState<any[]>([])
  const [cityData, setCityData] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      processRegionData()
      processStateData()
      processCityData()
    }
    setLoading(false)
  }, [data])

  const processRegionData = () => {
    const regions = Object.keys(brazilRegions)
      .map((regionName) => {
        const regionStates = brazilRegions[regionName as keyof typeof brazilRegions]
        const regionProducts = data.filter((item) => regionStates.includes(item.uf))
        const prices = regionProducts.map((p) => Number.parseFloat(p.unit_price) || 0).filter((p) => p > 0)
        const markets = Array.from(new Set(regionProducts.map((p) => p.mercado)))
        const states = Array.from(new Set(regionProducts.map((p) => p.uf)))
        return {
          name: regionName,
          states: regionStates,
          activeStates: states.length,
          totalStates: regionStates.length,
          productCount: regionProducts.length,
          marketCount: markets.length,
          avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
          coverage: (states.length / regionStates.length) * 100,
        }
      })
      .sort((a, b) => b.productCount - a.productCount)
    setRegionData(regions)
  }

  const processStateData = () => {
    const stateGroups: { [key: string]: any[] } = {}
    data.forEach((item) => {
      if (item.uf && stateNames[item.uf]) {
        if (!stateGroups[item.uf]) stateGroups[item.uf] = []
        stateGroups[item.uf].push(item)
      }
    })
    const states = Object.keys(stateGroups)
      .map((uf) => {
        const stateProducts = stateGroups[uf]
        const prices = stateProducts.map((p) => Number.parseFloat(p.unit_price) || 0).filter((p) => p > 0)
        const markets = Array.from(new Set(stateProducts.map((p) => p.mercado)))
        const region = Object.keys(brazilRegions).find((r) =>
          brazilRegions[r as keyof typeof brazilRegions].includes(uf),
        )
        return {
          uf,
          name: stateNames[uf],
          region,
          productCount: stateProducts.length,
          marketCount: markets.length,
          avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        }
      })
      .sort((a, b) => b.productCount - a.productCount)
    setStateData(states)
  }

  const processCityData = () => {
    const cities = brazilCities
      .map((city) => {
        const cityProducts = data.filter((item) => item.uf === city.state)
        const prices = cityProducts.map((p) => Number.parseFloat(p.unit_price) || 0).filter((p) => p > 0)
        const markets = Array.from(new Set(cityProducts.map((p) => p.mercado)))
        return {
          ...city,
          productCount: cityProducts.length,
          marketCount: markets.length,
          avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
          hasData: cityProducts.length > 0,
        }
      })
      .filter((city) => city.hasData)
    setCityData(cities)
  }

  const getRegionColor = (coverage: number) => {
    if (coverage >= 80) return "from-green-400 to-green-600"
    if (coverage >= 50) return "from-yellow-400 to-yellow-600"
    if (coverage >= 20) return "from-orange-400 to-orange-600"
    return "from-red-400 to-red-600"
  }

  const createCustomIcon = (avgPrice: number) => {
    let markerColor = "#666666" // Default gray for no data or zero price
    if (avgPrice > 0) {
      if (avgPrice < 10)
        markerColor = "#22c55e" // Green
      else if (avgPrice < 20)
        markerColor = "#f59e0b" // Orange
      else markerColor = "#ef4444" // Red
    }

    return L.divIcon({
      html: `
        <div style="
          background-color: ${markerColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white; /* Changed to white for better contrast */
          font-weight: bold;
          font-size: 12px; /* Slightly larger for visibility */
        ">📍</div>
      `,
      className: "", // Important to clear default Leaflet styles for divIcon
      iconSize: [30, 30], // Adjusted size to contain the border
      iconAnchor: [15, 15], // Center anchor
    })
  }

  const filteredStates = selectedRegion ? stateData.filter((state) => state.region === selectedRegion) : stateData

  if (loading && !isClient) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-camponesa-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa e dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <MapPin className="w-6 h-6 mr-3 text-camponesa-primary" />
            Mapa Interativo - Distribuição Nacional Rubix
          </h3>
          <p className="text-gray-600 mt-2">Explore os marcadores no mapa para ver dados detalhados de cada cidade.</p>
        </div>

        <div className="relative h-[500px]">
          {isClient && cityData.length > 0 ? (
            <MapContainer
              center={[-14.235, -51.9253]}
              zoom={4}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {cityData.map((city) => (
                <Marker key={city.city} position={[city.lat, city.lng]} icon={createCustomIcon(city.avgPrice)}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <h3 className="text-base font-bold text-gray-800 mb-1">
                        {city.city}, {city.state}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{city.region}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Produtos:</span>
                          <strong className="text-gray-800">{city.productCount}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mercados:</span>
                          <strong className="text-gray-800">{city.marketCount}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preço Médio:</span>
                          <strong className="text-green-600">R$ {city.avgPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-camponesa-primary mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Carregando dados do mapa...</p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Sem dados de cidades para exibir no mapa.</p>
                )}
              </div>
            </div>
          )}

          {isClient && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda de Preços</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 border"></div>
                  <span>Preço Baixo (&lt; R$ 10)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 border"></div>
                  <span>Preço Médio (R$ 10-20)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 border"></div>
                  <span>Preço Alto (&gt; R$ 20)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2 border"></div>
                  <span>Sem dados / R$ 0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Análise por Regiões */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Target className="w-6 h-6 mr-3 text-camponesa-primary" />
            Análise por Regiões do Brasil
          </h3>
          <p className="text-gray-600 mt-2">Clique em uma região para filtrar os estados</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {regionData.map((region) => (
              <div
                key={region.name}
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedRegion === region.name ? "ring-4 ring-camponesa-primary ring-opacity-50" : ""
                }`}
                onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
              >
                <div className={`bg-gradient-to-br ${getRegionColor(region.coverage)} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg">{region.name}</h4>
                    <Award className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Estados:</span>
                      <span className="font-semibold">
                        {region.activeStates}/{region.totalStates}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Produtos:</span>
                      <span className="font-semibold">{region.productCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Mercados:</span>
                      <span className="font-semibold">{region.marketCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">Preço Médio:</span>
                      <span className="font-semibold">R$ {region.avgPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Cobertura:</span>
                      <span className="font-bold">{region.coverage.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 bg-white bg-opacity-30 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${region.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detalhes dos Estados */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-camponesa-primary" />
              {selectedRegion ? `Estados da Região ${selectedRegion}` : "Estados por Volume de Produtos"}
            </h3>
            {selectedRegion && (
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-sm text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg transition-colors"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStates.slice(0, 12).map((state) => (
              <div
                key={state.uf}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border transition-all duration-200 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg text-gray-800">{state.uf}</div>
                    <div className="text-sm text-gray-600">{state.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-camponesa-primary">{state.productCount}</div>
                    <div className="text-xs text-gray-500">produtos</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mercados:</span>
                    <span className="font-semibold text-gray-700">{state.marketCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preço Médio:</span>
                    <span className="font-semibold text-green-600">R$ {state.avgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top 5 - Estados com Mais Produtos
          </h4>
          <div className="space-y-3">
            {stateData.slice(0, 5).map((state, index) => (
              <div
                key={state.uf}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-500" : "bg-blue-500"}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {state.uf} - {state.name}
                    </p>
                    <p className="text-sm text-gray-600">{state.marketCount} mercados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-camponesa-primary">{state.productCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">produtos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
            Top 5 - Menores Preços Médios
          </h4>
          <div className="space-y-3">
            {stateData
              .filter((state) => state.avgPrice > 0)
              .sort((a, b) => a.avgPrice - b.avgPrice)
              .slice(0, 5)
              .map((state, index) => (
                <div
                  key={state.uf}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 ${index === 0 ? "bg-green-500" : index === 1 ? "bg-green-400" : index === 2 ? "bg-green-300" : "bg-green-200"}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {state.uf} - {state.name}
                      </p>
                      <p className="text-sm text-gray-600">{state.productCount} produtos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">R$ {state.avgPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">média</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrazilMap
