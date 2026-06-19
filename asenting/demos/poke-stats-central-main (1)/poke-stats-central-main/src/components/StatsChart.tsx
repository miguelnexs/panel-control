
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PokemonDetail, getStatColor } from "../services/pokemonService";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsChartProps {
  pokemon: PokemonDetail;
}

const StatsChart = ({ pokemon }: StatsChartProps) => {
  const isMobile = useIsMobile();
  
  // Preparar datos para la gráfica
  const data = pokemon.stats.map((stat) => {
    // Convertir nombres de estadísticas a formato legible
    const statName = stat.stat.name
      .replace('special-attack', 'Sp. Atk')
      .replace('special-defense', 'Sp. Def')
      .replace('attack', 'Atk')
      .replace('defense', 'Def')
      .replace('speed', 'Spd')
      .replace('hp', 'HP');
      
    return {
      name: statName,
      value: stat.base_stat,
      color: getStatColor(stat.stat.name),
    };
  });

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isMobile ? "vertical" : "horizontal"}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {isMobile ? (
            <>
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis dataKey="name" type="category" scale="band" />
            </>
          ) : (
            <>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 255]} />
            </>
          )}
          <Tooltip 
            formatter={(value) => [`${value}`, 'Valor Base']}
            labelFormatter={(label) => `Estadística: ${label}`}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]} 
            label={{ position: 'top' }} 
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <rect key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
