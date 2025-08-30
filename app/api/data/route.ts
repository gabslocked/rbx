import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Ler o arquivo CSV da raiz do projeto
    const csvPath = join(process.cwd(), 'camponesa.csv');
    const csvContent = readFileSync(csvPath, 'utf8');
    
    // Estados válidos do Brasil
    const validBrazilStates = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    
    // Processar o CSV com parsing mais robusto
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const parsedData = lines.slice(1).map(line => {
      // Fazer split mais cuidadoso considerando vírgulas dentro de aspas
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Adicionar o último valor
      
      return {
        product_id: values[0]?.trim() || '',
        description: values[1]?.trim() || '',
        unit_price: values[2]?.trim() || '0',
        unit_original_price: values[3]?.trim() || '',
        unit_min_price: values[4]?.trim() || '',
        details: values[5]?.trim() || '',
        logo_url: values[6]?.trim() || '',
        mercado: values[7]?.trim() || '',
        uf: values[8]?.trim().toUpperCase() || '',
        city: values[9]?.trim() || '',
        neighborhood: values[10]?.trim() || '',
        merchant_id: values[11]?.trim() || ''
      };
    }).filter(row => {
      // Filtrar apenas registros válidos
      return row.description && 
             row.mercado && 
             validBrazilStates.includes(row.uf) &&
             row.unit_price && 
             !isNaN(parseFloat(row.unit_price));
    });

    console.log(`✅ Dados processados: ${parsedData.length} registros válidos de ${lines.length - 1} totais`);

    return NextResponse.json({
      success: true,
      data: parsedData,
      count: parsedData.length
    });
  } catch (error) {
    console.error('Erro ao ler arquivo CSV:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar dados',
      data: []
    }, { status: 500 });
  }
}
