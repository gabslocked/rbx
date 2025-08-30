"use client"

import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import {
  MapPin,
  TrendingUp,
  Package,
  DollarSign,
  Search,
  RefreshCw,
  Store,
  Package2,
  Map,
  LineChart,
} from "lucide-react"
import CamponesaLogo from "./components/CamponesaLogo"
import { LoadingSkeleton, ChartSkeleton } from "./components/LoadingSkeleton"
import BrazilMap from "./components/BrazilMap"
import ProductGrid from "./components/ProductGrid"
import { motion, AnimatePresence } from "framer-motion"

// Definição dos tipos
interface DataItem {
  product_id: string
  description: string
  unit_price: string
  unit_original_price: string
  unit_min_price: string
  details: string
  logo_url: string
  mercado: string
  uf: string
  city: string
  neighborhood: string
  merchant_id: string
}

export default function Dashboard() {
  const [data, setData] = useState<DataItem[]>([])
  const [filteredData, setFilteredData] = useState<DataItem[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [activeTab, setActiveTab] = useState("products")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/data")
        const result = await response.json()

        if (result.success && result.data) {
          setData(result.data)
          setFilteredData(result.data)
        } else {
          const mockData = generateMockData()
          setData(mockData)
          setFilteredData(mockData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        const mockData = generateMockData()
        setData(mockData)
        setFilteredData(mockData)
      } finally {
        setTimeout(() => setIsLoading(false), 1500)
      }
    }

    loadData()
  }, [])

  const generateMockData = (): DataItem[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      product_id: `CAMP_${i + 1}`,
      description: ["Leite Condensado", "Leite UHT", "Queijo Minas", "Manteiga", "Iogurte"][i % 5],
      unit_price: (Math.random() * 20 + 5).toFixed(2),
      unit_original_price: (Math.random() * 25 + 8).toFixed(2),
      unit_min_price: (Math.random() * 15 + 3).toFixed(2),
      details: "Produto Camponesa Premium",
      logo_url: "",
      mercado: ["Atacadão", "Extra", "Carrefour", "Pão de Açúcar"][i % 4],
      uf: ["SP", "RJ", "MG", "CE", "PE"][i % 5],
      city: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Fortaleza", "Recife"][i % 5],
      neighborhood: "Centro",
      merchant_id: `MERC_${i + 1}`,
    }))
  }

  useEffect(() => {
    let filtered = data
    if (selectedState) filtered = filtered.filter((item) => item.uf === selectedState)
    if (selectedProduct)
      filtered = filtered.filter((item) => item.description.toLowerCase().includes(selectedProduct.toLowerCase()))
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mercado.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    setFilteredData(filtered)
  }, [data, selectedState, selectedProduct, searchTerm])

  const validBrazilStates = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]
  const validStatesFromData = Array.from(new Set(data.map((item) => item.uf)))
    .filter((state) => validBrazilStates.includes(state))
    .sort()

  const stats = {
    totalProducts: filteredData.length,
    avgPrice:
      filteredData.length > 0
        ? filteredData.reduce((acc, item) => acc + Number.parseFloat(item.unit_price), 0) / filteredData.length
        : 0,
    totalStores: new Set(filteredData.map((item) => `${item.mercado}_${item.city}`)).size,
    totalStates: new Set(filteredData.map((item) => item.uf)).size,
  }

  const handleRefresh = () => window.location.reload()

  const tabs = [
    { id: "products", label: "Produtos", icon: Package2 },
    { id: "map", label: "Mapa", icon: Map },
    { id: "prices", label: "Análise de Preços", icon: LineChart },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <>
      <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between p-4 gap-2 sm:gap-4">
            <div className="flex items-center space-x-4">
              <CamponesaLogo width={120} height={40} />
            </div>

            <div className="flex items-center space-x-3 flex-grow justify-center">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  // Potentially reset other filters or trigger data reload if needed
                }}
                className="hidden sm:block px-3 py-2 text-xs sm:text-sm border bg-stone-100/80 border-stone-200 rounded-lg focus:ring-2 focus:ring-viridian focus:border-transparent transition-all duration-200"
              >
                <option value="">Estado</option>
                {validStatesFromData.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Navigation - Moved Here */}
            <div className="flex items-center justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? "text-white" : "text-gray-600 hover:text-black"} relative rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-viridian rounded-md z-0"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  <span className="relative z-10 hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Ensure searchTerm updates state
                  className="pl-10 pr-4 py-2 w-28 sm:w-40 border bg-stone-100/80 border-stone-200 rounded-lg focus:ring-2 focus:ring-viridian focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="p-2.5 text-gray-600 hover:text-viridian transition-colors duration-200 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total de Produtos",
                value: stats.totalProducts.toLocaleString(),
                icon: Package,
                color: "text-viridian",
              },
              {
                title: "Preço Médio",
                value: `R$ ${stats.avgPrice.toFixed(2)}`,
                icon: DollarSign,
                color: "text-giants_orange",
              },
              { title: "Lojas Cobertas", value: stats.totalStores, icon: Store, color: "text-sunglow-600" },
              { title: "Estados", value: stats.totalStates, icon: MapPin, color: "text-viridian-600" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  className="bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-md border border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-stone-100 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Filters - Original position removed, can be re-added here or elsewhere if needed */}
          {/* Example: Add filters back here if not in header */}
          {/* <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8 justify-center"> ... filters ... </motion.div> */}

          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "products" &&
                  (isLoading ? <LoadingSkeleton /> : <ProductGrid data={filteredData} title="Catálogo de Produtos" />)}
                {activeTab === "map" && (isLoading ? <ChartSkeleton /> : <BrazilMap data={filteredData} />)}
                {activeTab === "prices" && (
                  <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-giants_orange" />
                      Análise Detalhada de Preços
                    </h3>
                    {isLoading ? (
                      <ChartSkeleton />
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={filteredData.slice(0, 150)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="unit_original_price" stroke="#999" name="Preço Original" unit=" R$" />
                          <YAxis dataKey="unit_price" stroke="#999" name="Preço de Venda" unit="R$ " />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              border: "1px solid #ddd",
                              borderRadius: "1rem",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Scatter dataKey="unit_price" fill="#36846E" opacity={0.7} name="Produto" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}
