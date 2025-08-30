'use client';

import React, { useState, useEffect } from 'react';
import ProductGroupGrid from './ProductGroupGrid';

interface Product {
  product_id: string;
  description: string;
  unit_price: string;
  unit_original_price?: string;
  unit_min_price?: string;
  details: string;
  logo_url: string;
  mercado: string;
  uf: string;
  city: string;
  neighborhood: string;
}

interface ProductGridProps {
  data?: Product[];
  title?: string;
}

export default function ProductGrid({ data = [], title = "Produtos Camponesa" }: ProductGridProps) {
  const [filters, setFilters] = useState({
    category: 'all',
    state: 'all',
    market: 'all',
    priceRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const getProductCategory = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('leite condensado')) return 'Leite Condensado';
    if (desc.includes('leite em pó')) return 'Leite em Pó';
    if (desc.includes('leite uht') || desc.includes('leite integral') || desc.includes('leite desnatado')) return 'Leite UHT';
    if (desc.includes('doce de leite')) return 'Doce de Leite';
    if (desc.includes('manteiga')) return 'Manteiga';
    if (desc.includes('requeijão')) return 'Requeijão';
    if (desc.includes('queijo')) return 'Queijo';
    if (desc.includes('creme de leite')) return 'Creme de Leite';
    return 'Outros';
  };

  // Estados válidos do Brasil (UFs)
  const validBrazilStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const categories = ['all', ...Array.from(new Set(data.map(p => getProductCategory(p.description))))];
  const states = ['all', ...Array.from(new Set(data.map(p => p.uf)))
    .filter(state => validBrazilStates.includes(state))
    .sort()];
  const markets = ['all', ...Array.from(new Set(data.map(p => p.mercado.split(' ')[0])))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="text-sm text-gray-500">
            Visualização agrupada por produto
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        {/* Busca */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar produtos, mercados ou cidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="input-high-contrast px-3 py-2 rounded-lg"
          >
            <option value="all">Todas as Categorias</option>
            {categories.filter(c => c !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filters.state}
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="input-high-contrast px-3 py-2 rounded-lg"
          >
            <option value="all">Todos os Estados</option>
            {states.filter(s => s !== 'all').map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            className="input-high-contrast px-3 py-2 rounded-lg"
          >
            <option value="all">Todos os Preços</option>
            <option value="low">Até R$ 8</option>
            <option value="medium">R$ 8 - R$ 15</option>
            <option value="high">Acima de R$ 15</option>
          </select>
        </div>
      </div>

      {/* Grid Agrupado */}
      <ProductGroupGrid 
        data={data}
        filters={filters}
        searchTerm={searchTerm}
        title=""
      />
    </div>
  );
}
