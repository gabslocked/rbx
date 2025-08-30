"use client"

import { useState, useMemo } from "react"
import { MapPin, Store, Package, BarChart3, Target, Award, AlertCircle, TrendingUp, X } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Modal } from "./ui/modal"

interface Product {
  product_id: string
  description: string
  unit_price: string
  unit_original_price?: string
  unit_min_price?: string
  details: string
  logo_url: string
  mercado: string
  uf: string
  city: string
  neighborhood: string
}

interface ProductGroup {
  description: string
  category: string
  normalizedDescription: string
  totalProducts: number
  products: Product[]
  avgPrice: number
  minPrice: number
  maxPrice: number
  priceVariation: number
  marketCount: number
  stateCount: number
  representativeProduct: Product
  minPriceLocation: string
  maxPriceLocation: string
}

interface ProductAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  productGroup: ProductGroup | null
}

const tabs = [
  { id: "overview", label: "Visão Geral", icon: Package },
  { id: "prices", label: "Análise de Preços", icon: BarChart3 },
  { id: "geography", label: "Distribuição Geográfica", icon: MapPin },
  { id: "markets", label: "Análise de Mercados", icon: Store },
  { id: "insights", label: "Insights", icon: Target },
]

export function ProductAnalysisModal({ isOpen, onClose, productGroup }: ProductAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const analysisData = useMemo(() => {
    if (!productGroup) return null

    // Análise de preços por estado
    const pricesByState = productGroup.products.reduce(
      (acc, product) => {
        const price = Number.parseFloat(product.unit_price)
        if (!acc[product.uf]) {
          acc[product.uf] = []
        }
        acc[product.uf].push(price)
        return acc
      },
      {} as Record<string, number[]>,
    )

    const stateAnalysis = Object.entries(pricesByState)
      .map(([state, prices]) => ({
        state,
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        productCount: prices.length,
      }))
      .sort((a, b) => b.productCount - a.productCount)

    // Análise de mercados
    const marketAnalysis = productGroup.products.reduce(
      (acc, product) => {
        const price = Number.parseFloat(product.unit_price)
        const marketName = product.mercado.split(" - ")[0]

        if (!acc[marketName]) {
          acc[marketName] = {
            marketName,
            prices: [],
            locations: [],
          }
        }
        acc[marketName].prices.push(price)
        acc[marketName].locations.push(`${product.city} - ${product.uf}`)
        return acc
      },
      {} as Record<string, any>,
    )

    const marketRanking = Object.values(marketAnalysis)
      .map((market: any) => ({
        marketName: market.marketName,
        avgPrice: market.prices.reduce((a: number, b: number) => a + b, 0) / market.prices.length,
        minPrice: Math.min(...market.prices),
        maxPrice: Math.max(...market.prices),
        productCount: market.prices.length,
        locations: Array.from(new Set(market.locations)).length,
      }))
      .sort((a, b) => a.avgPrice - b.avgPrice)

    // Distribuição de preços
    const prices = productGroup.products.map((p) => Number.parseFloat(p.unit_price))
    const priceRanges = [
      { range: "R$ 0-5", min: 0, max: 5 },
      { range: "R$ 5-10", min: 5, max: 10 },
      { range: "R$ 10-15", min: 10, max: 15 },
      { range: "R$ 15-20", min: 15, max: 20 },
      { range: "R$ 20+", min: 20, max: Number.POSITIVE_INFINITY },
    ]

    const priceDistribution = priceRanges.map((range) => ({
      range: range.range,
      count: prices.filter((price) => price >= range.min && price < range.max).length,
    }))

    return {
      stateAnalysis,
      marketRanking,
      priceDistribution,
      totalVariance: Math.max(...prices) - Math.min(...prices),
      medianPrice: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
    }
  }, [productGroup])

  if (!productGroup || !analysisData) return null

  const getImageUrl = (logoUrl: string) => {
    if (!logoUrl || logoUrl === "N/A") return "/placeholder.svg?height=80&width=80"
    return `https://static.ifood-static.com.br/image/upload/t_low/pratos/${logoUrl}?imwidth=128`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      closeOnOverlayClick={true}
      closeOnEscape={true}
      showCloseButton={false}
      className="flex flex-col"
    >
      {/* Custom Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(productGroup.representativeProduct.logo_url) || "/placeholder.svg"}
              alt={productGroup.description}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=80&width=80"
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 truncate">{productGroup.description}</h1>
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span className="bg-viridian/10 text-viridian px-3 py-1 rounded-full font-medium">
                {productGroup.category}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {productGroup.totalProducts} produtos
              </span>
              <span className="flex items-center gap-1">
                <Store className="w-4 h-4" />
                {productGroup.marketCount} mercados
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {productGroup.stateCount} estados
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-viridian">R$ {productGroup.avgPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Preço médio</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">R$ {productGroup.minPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Menor preço</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600">R$ {productGroup.maxPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Maior preço</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-4"
          aria-label="Fechar modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-viridian text-viridian bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {/* Ensure this div scrolls when content overflows. `flex-1` allows it to take available space, `overflow-y-auto` enables scrolling, and `min-h-0` is crucial in a flex-col context for `overflow` to work correctly when the parent has a defined height. */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas principais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-viridian" />
                Métricas Principais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-viridian/5 border border-viridian/20 p-4 rounded-lg">
                  <p className="text-sm text-viridian font-medium">Cobertura Nacional</p>
                  <p className="text-2xl font-bold text-viridian">
                    {((productGroup.stateCount / 27) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-viridian/70">{productGroup.stateCount} de 27 estados</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Disponibilidade</p>
                  <p className="text-2xl font-bold text-green-900">{productGroup.marketCount}</p>
                  <p className="text-xs text-green-700">mercados únicos</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Mediana de Preço</p>
                  <p className="text-2xl font-bold text-purple-900">R$ {analysisData.medianPrice.toFixed(2)}</p>
                  <p className="text-xs text-purple-700">valor central</p>
                </div>
                <div className="bg-giants_orange/10 border border-giants_orange/20 p-4 rounded-lg">
                  <p className="text-sm text-giants_orange font-medium">Amplitude Total</p>
                  <p className="text-2xl font-bold text-giants_orange">R$ {analysisData.totalVariance.toFixed(2)}</p>
                  <p className="text-xs text-giants_orange/70">diferença máx-mín</p>
                </div>
              </div>
            </div>

            {/* Distribuição de preços */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-viridian" />
                Distribuição de Preços
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analysisData.priceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="count" fill="#36846E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "prices" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-viridian" />
              Análise Detalhada de Preços
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />5 Menores Preços
                </h4>
                <div className="space-y-3">
                  {productGroup.products
                    .sort((a, b) => Number.parseFloat(a.unit_price) - Number.parseFloat(b.unit_price))
                    .slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-900">
                            R$ {Number.parseFloat(product.unit_price).toFixed(2)}
                          </p>
                          <p className="text-sm text-green-700 truncate">{product.mercado}</p>
                          <p className="text-xs text-green-600">
                            {product.city} - {product.uf}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
                          #{index + 1}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />5 Maiores Preços
                </h4>
                <div className="space-y-3">
                  {productGroup.products
                    .sort((a, b) => Number.parseFloat(b.unit_price) - Number.parseFloat(a.unit_price))
                    .slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-red-900">
                            R$ {Number.parseFloat(product.unit_price).toFixed(2)}
                          </p>
                          <p className="text-sm text-red-700 truncate">{product.mercado}</p>
                          <p className="text-xs text-red-600">
                            {product.city} - {product.uf}
                          </p>
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
                          #{index + 1}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "geography" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-viridian" />
              Distribuição Geográfica
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Preços Médios por Estado</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.stateAnalysis.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="state" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="avgPrice" fill="#36846E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Ranking por Quantidade</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {analysisData.stateAnalysis.map((state, index) => (
                    <div key={state.state} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{state.state}</p>
                        <p className="text-sm text-gray-600">{state.productCount} produtos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">R$ {state.avgPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">média</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "markets" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-viridian" />
              Análise de Mercados
            </h3>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rede de Mercados
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produtos
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localizações
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Médio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Menor Preço
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Maior Preço
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisData.marketRanking.slice(0, 15).map((market, index) => (
                      <tr key={market.marketName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">{market.marketName}</p>
                            <p className="text-sm text-gray-500">#{index + 1} menor preço médio</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {market.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {market.locations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-900">
                          R$ {market.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-green-600 font-medium">
                          R$ {market.minPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-medium">
                          R$ {market.maxPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-viridian" />
              Insights e Recomendações
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Melhores oportunidades */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="flex items-center font-medium text-green-900 mb-4 gap-2">
                  <Target className="w-5 h-5" />
                  Melhores Oportunidades
                </h4>
                <div className="space-y-4">
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <p className="font-medium text-green-800 mb-1">Melhor Preço</p>
                    <p className="text-sm text-green-700 mb-2">{productGroup.minPriceLocation}</p>
                    <p className="text-xl font-bold text-green-900">R$ {productGroup.minPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-white border border-green-200 p-4 rounded-lg">
                    <p className="font-medium text-green-800 mb-1">Estado Mais Econômico</p>
                    <p className="text-sm text-green-700 mb-2">
                      {analysisData.stateAnalysis.sort((a, b) => a.avgPrice - b.avgPrice)[0]?.state}
                    </p>
                    <p className="text-xl font-bold text-green-900">
                      R$ {analysisData.stateAnalysis.sort((a, b) => a.avgPrice - b.avgPrice)[0]?.avgPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alertas de preço */}
              <div className="bg-giants_orange/10 border border-giants_orange/20 rounded-lg p-6">
                <h4 className="flex items-center font-medium text-giants_orange mb-4 gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Alertas de Preço
                </h4>
                <div className="space-y-4">
                  <div className="bg-white border border-giants_orange/20 p-4 rounded-lg">
                    <p className="font-medium text-giants_orange mb-1">Maior Variação</p>
                    <p className="text-sm text-giants_orange/80 mb-2">
                      Entre estados: R${" "}
                      {(
                        analysisData.stateAnalysis.reduce((max, curr) => Math.max(max, curr.avgPrice), 0) -
                        analysisData.stateAnalysis.reduce(
                          (min, curr) => Math.min(min, curr.avgPrice),
                          Number.POSITIVE_INFINITY,
                        )
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white border border-giants_orange/20 p-4 rounded-lg">
                    <p className="font-medium text-giants_orange mb-1">Concentração</p>
                    <p className="text-sm text-giants_orange/80">
                      {((analysisData.stateAnalysis[0]?.productCount / productGroup.totalProducts) * 100).toFixed(0)}%
                      em {analysisData.stateAnalysis[0]?.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendações estratégicas */}
            <div className="bg-viridian/5 border border-viridian/20 rounded-lg p-6">
              <h4 className="flex items-center font-medium text-viridian mb-4 gap-2">
                <BarChart3 className="w-5 h-5" />
                Recomendações Estratégicas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-viridian/20 p-4 rounded-lg">
                  <h5 className="font-medium text-viridian mb-3">Para Consumidores</h5>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Comprar em {analysisData.marketRanking[0]?.marketName} para melhor preço médio
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Evitar compras em {productGroup.maxPriceLocation}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Verificar promoções nos estados de maior concentração
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-viridian/20 p-4 rounded-lg">
                  <h5 className="font-medium text-viridian mb-3">Para Negócios</h5>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Oportunidade de arbitragem entre estados
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Expandir presença em{" "}
                      {analysisData.stateAnalysis
                        .slice(-3)
                        .map((s) => s.state)
                        .join(", ")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-viridian">•</span>
                      Competir com pricing agressivo em mercados premium
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
