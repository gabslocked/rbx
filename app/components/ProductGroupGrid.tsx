"use client"

import { useState, useEffect } from "react"
import { Filter, MapPin, Store, BarChart3, Tag } from "lucide-react"
import { ProductAnalysisModal } from "./product-analysis-modal"
import { useModal } from "./ui/modal"

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
  normalizedDescription: string
  products: Product[]
  minPrice: number
  maxPrice: number
  avgPrice: number
  minPriceLocation: string
  maxPriceLocation: string
  marketCount: number
  stateCount: number
  totalProducts: number
  category: string
  representativeProduct: Product
  priceVariation: number
}

interface ProductGroupGridProps {
  data?: Product[]
  title?: string
  filters?: {
    category: string
    state: string
    market: string
    priceRange: string
  }
  searchTerm?: string
}

export default function ProductGroupGrid({
  data = [],
  title = "Produtos Agrupados",
  filters = { category: "all", state: "all", market: "all", priceRange: "all" },
  searchTerm = "",
}: ProductGroupGridProps) {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<ProductGroup[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductGroup | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "markets" | "variation">("name")

  const { isOpen, openModal, closeModal } = useModal()

  // Normalizar description para agrupamento inteligente
  const normalizeDescription = (description: string): string => {
    return description
      .toLowerCase()
      .normalize("NFD") // Normaliza caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\b\d+\s?(g|gr|grama|gramas|ml|l|litro|litros|kg|kilo|kilos|mg)\b/gi, "") // Remove medidas específicas
      .replace(/\b(embalagem|caixa|pote|pacote|unidade|un|und|cx|pct|lata|vidro|tetra\s?pack|tetra|pack)\b/gi, "") // Remove tipos de embalagem básicos
      .replace(/\b(tradicional|natural|original|especial|premium)\b/gi, "") // Remove apenas alguns modificadores
      .replace(/\b(camponesa)\b/gi, "") // Remove marca
      .replace(/[0-9%]/g, "") // Remove números e porcentagem
      .replace(/[^\w\s]/g, "") // Remove pontuação
      .replace(/\s+/g, " ") // Remove espaços extras
      .trim()
  }

  // Função para agrupar produtos usando similarity mais simples e eficaz
  const groupProductsByNormalizedDescription = (products: Product[]) => {
    if (products.length === 0) return new Map<string, Product[]>()

    const groups = new Map<string, Product[]>()

    // Primeiro passo: agrupar por descrição normalizada exata
    const exactGroups = new Map<string, Product[]>()
    products.forEach((product) => {
      const normalized = normalizeDescription(product.description)
      if (!exactGroups.has(normalized)) {
        exactGroups.set(normalized, [])
      }
      exactGroups.get(normalized)!.push(product)
    })

    // Segundo passo: unir grupos similares usando comparação de palavras
    const processedKeys = new Set<string>()

    for (const [key1, products1] of Array.from(exactGroups.entries())) {
      if (processedKeys.has(key1)) continue

      const mergedProducts = [...products1]
      processedKeys.add(key1)

      // Comparar com outros grupos não processados
      for (const [key2, products2] of Array.from(exactGroups.entries())) {
        if (processedKeys.has(key2) || key1 === key2) continue

        // Verificar similaridade entre as chaves
        if (areDescriptionsSimilar(key1, key2)) {
          mergedProducts.push(...products2)
          processedKeys.add(key2)
        }
      }

      groups.set(key1, mergedProducts)
    }

    return groups
  }

  // Função para verificar se duas descrições normalizadas são similares
  const areDescriptionsSimilar = (desc1: string, desc2: string): boolean => {
    const words1 = desc1.split(" ").filter((w) => w.length > 1)
    const words2 = desc2.split(" ").filter((w) => w.length > 1)

    if (words1.length === 0 || words2.length === 0) return false

    // Verificar se todas as palavras principais da menor descrição estão na maior
    const [shorter, longer] = words1.length <= words2.length ? [words1, words2] : [words2, words1]
    const matchingWords = shorter.filter((word) => longer.includes(word))

    // Requer que pelo menos 80% das palavras da descrição menor estejam na maior
    // E que tenham pelo menos 2 palavras principais em comum
    const similarity = matchingWords.length / shorter.length

    return similarity >= 0.8 && matchingWords.length >= Math.min(2, shorter.length)
  }

  // Obter categoria do produto
  const getProductCategory = (description: string): string => {
    const desc = description.toLowerCase()
    if (desc.includes("leite condensado")) return "Leite Condensado"
    if (desc.includes("leite em pó")) return "Leite em Pó"
    if (desc.includes("leite uht") || desc.includes("leite integral") || desc.includes("leite desnatado"))
      return "Leite UHT"
    if (desc.includes("doce de leite")) return "Doce de Leite"
    if (desc.includes("manteiga")) return "Manteiga"
    if (desc.includes("requeijão")) return "Requeijão"
    if (desc.includes("queijo")) return "Queijo"
    if (desc.includes("creme de leite")) return "Creme de Leite"
    return "Outros"
  }

  // Agrupar produtos
  useEffect(() => {
    if (data.length === 0) return

    // Aplicar filtros primeiro
    let filteredData = [...data]

    if (filters.category !== "all") {
      filteredData = filteredData.filter((product) => getProductCategory(product.description) === filters.category)
    }

    if (filters.state !== "all") {
      filteredData = filteredData.filter((product) => product.uf === filters.state)
    }

    if (filters.market !== "all") {
      filteredData = filteredData.filter((product) =>
        product.mercado.toLowerCase().includes(filters.market.toLowerCase()),
      )
    }

    if (filters.priceRange !== "all") {
      filteredData = filteredData.filter((product) => {
        const price = Number.parseFloat(product.unit_price)
        switch (filters.priceRange) {
          case "low":
            return price < 8
          case "medium":
            return price >= 8 && price <= 15
          case "high":
            return price > 15
          default:
            return true
        }
      })
    }

    if (searchTerm) {
      filteredData = filteredData.filter(
        (product) =>
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.mercado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.city.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Agrupar por description usando similarity baseada em normalização
    const groupMap = groupProductsByNormalizedDescription(filteredData)

    // Processar grupos
    const groups: ProductGroup[] = []

    Array.from(groupMap.entries()).forEach(([normalizedDesc, products]) => {
      if (products.length === 0) return

      const prices = products.map((p) => Number.parseFloat(p.unit_price))
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

      const minPriceProduct = products.find((p) => Number.parseFloat(p.unit_price) === minPrice)!
      const maxPriceProduct = products.find((p) => Number.parseFloat(p.unit_price) === maxPrice)!

      const uniqueMarkets = new Set(products.map((p) => p.mercado))
      const uniqueStates = new Set(products.map((p) => p.uf))

      // Escolher produto representativo (com imagem se possível)
      const representativeProduct = products.find((p) => p.logo_url) || products[0]

      groups.push({
        description: products[0].description,
        normalizedDescription: normalizedDesc,
        products,
        minPrice,
        maxPrice,
        avgPrice,
        minPriceLocation: `${minPriceProduct.mercado} - ${minPriceProduct.city}`,
        maxPriceLocation: `${maxPriceProduct.mercado} - ${maxPriceProduct.city}`,
        marketCount: uniqueMarkets.size,
        stateCount: uniqueStates.size,
        totalProducts: products.length,
        category: getProductCategory(products[0].description),
        representativeProduct,
        priceVariation: maxPrice - minPrice,
      })
    })

    setProductGroups(groups)
  }, [data, filters, searchTerm])

  // Ordenar grupos
  useEffect(() => {
    const sorted = [...productGroups].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.avgPrice - b.avgPrice
        case "price-desc":
          return b.avgPrice - a.avgPrice
        case "markets":
          return b.marketCount - a.marketCount
        case "variation":
          return b.priceVariation - a.priceVariation
        case "name":
        default:
          return a.description.localeCompare(b.description)
      }
    })
    setFilteredGroups(sorted)
  }, [productGroups, sortBy])

  const getImageUrl = (logoUrl: string) => {
    if (!logoUrl || logoUrl === "N/A" || logoUrl.trim() === "") {
      return "/placeholder.svg?height=200&width=200"
    }
    try {
      return `https://static.ifood-static.com.br/image/upload/t_low/pratos/${logoUrl}?imwidth=128`
    } catch (error) {
      return "/placeholder.svg?height=200&width=200"
    }
  }

  const handleProductClick = (group: ProductGroup) => {
    setSelectedProduct(group)
    openModal()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            {filteredGroups.length} grupos de produtos •{" "}
            {productGroups.reduce((acc, group) => acc + group.totalProducts, 0)} produtos únicos
          </p>
        </div>

        {/* Ordenação */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viridian focus:border-transparent"
        >
          <option value="name">Nome A-Z</option>
          <option value="price-asc">Menor Preço Médio</option>
          <option value="price-desc">Maior Preço Médio</option>
          <option value="markets">Mais Mercados</option>
          <option value="variation">Maior Variação</option>
        </select>
      </div>

      {/* Grid de Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGroups.map((group, index) => (
          <div
            key={group.normalizedDescription}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-viridian/20 transition-all duration-300 cursor-pointer group"
            onClick={() => handleProductClick(group)}
          >
            {/* Imagem do Produto */}
            <div className="aspect-square relative overflow-hidden rounded-t-xl bg-gray-50">
              <img
                src={getImageUrl(group.representativeProduct.logo_url) || "/placeholder.svg"}
                alt={group.description}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.src !== "/placeholder.svg?height=200&width=200") {
                    target.src = "/placeholder.svg?height=200&width=200"
                  }
                }}
                onLoad={(e) => {
                  e.currentTarget.style.opacity = "1"
                }}
                style={{ opacity: 0, transition: "opacity 0.3s ease" }}
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                {group.totalProducts} items
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 space-y-4">
              {/* Nome do Produto */}
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-viridian transition-colors">
                {group.description}
              </h3>

              {/* Informações de Cobertura */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Store className="w-4 h-4 text-viridian" />
                  <span>{group.marketCount} mercados</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-viridian" />
                  <span className="text-viridian">{group.stateCount} estados</span>
                </div>
              </div>

              {/* Seção de Preços Principal */}
              <div className="space-y-3">
                {/* Preço Médio Destaque */}
                <div className="text-center py-3 bg-viridian/5 rounded-lg border border-viridian/20">
                  <p className="text-xs text-viridian/70 mb-1">Preço médio</p>
                  <p className="text-2xl font-bold text-viridian">R$ {group.avgPrice.toFixed(2)}</p>
                </div>

                {/* Faixa de Preços */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-semibold">R$ {group.minPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">mínimo</p>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="h-2 bg-gradient-to-r from-green-200 via-sunglow-200 to-giants_orange-200 rounded-full relative">
                      <div
                        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-500 to-sunglow rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-giants_orange font-semibold">R$ {group.maxPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">máximo</p>
                  </div>
                </div>
              </div>

              {/* Melhores Localizações */}
              <div className="space-y-2 text-xs bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <span className="text-green-600 font-medium">💰 Mais barato:</span>
                  <span className="text-gray-700 text-right flex-1 ml-2">{group.minPriceLocation}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-giants_orange font-medium">💸 Mais caro:</span>
                  <span className="text-gray-700 text-right flex-1 ml-2">{group.maxPriceLocation}</span>
                </div>
              </div>

              {/* Variação de Preço */}
              {group.priceVariation > 0 && (
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-sunglow" />
                  <span className="text-sunglow font-medium">Variação: R$ {group.priceVariation.toFixed(2)}</span>
                </div>
              )}

              {/* Categoria */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-viridian/10 text-viridian">
                  <Tag className="w-3 h-3 mr-1" />
                  {group.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há produtos */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou termo de busca.</p>
        </div>
      )}

      {/* Modal de Análise */}
      <ProductAnalysisModal isOpen={isOpen} onClose={closeModal} productGroup={selectedProduct} />
    </div>
  )
}
