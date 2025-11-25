'use client';

interface FormOrinaProps {
  resultados: any;
  onChange: (field: string, value: any) => void;
}

export default function FormOrina({ resultados, onChange }: FormOrinaProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💧 Uroanálisis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <select
            value={resultados.color || ''}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Amarillo">Amarillo</option>
            <option value="Ámbar">Ámbar</option>
            <option value="Amarillo pálido">Amarillo pálido</option>
            <option value="Amarillo oscuro">Amarillo oscuro</option>
            <option value="Rojo">Rojo</option>
          </select>
        </div>

        {/* Aspecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aspecto
          </label>
          <select
            value={resultados.aspecto || ''}
            onChange={(e) => onChange('aspecto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Claro">Claro</option>
            <option value="Ligeramente turbio">Ligeramente turbio</option>
            <option value="Turbio">Turbio</option>
          </select>
        </div>

        {/* pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pH
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.ph || ''}
            onChange={(e) => onChange('ph', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="6.0"
          />
        </div>

        {/* Densidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Densidad
          </label>
          <input
            type="number"
            step="0.001"
            value={resultados.densidad || ''}
            onChange={(e) => onChange('densidad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="1.020"
          />
        </div>

        {/* Glucosa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Glucosa
          </label>
          <select
            value={resultados.glucosa || ''}
            onChange={(e) => onChange('glucosa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Negativo">Negativo</option>
            <option value="Trazas">Trazas</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
          </select>
        </div>

        {/* Proteínas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proteínas
          </label>
          <select
            value={resultados.proteinas || ''}
            onChange={(e) => onChange('proteinas', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Negativo">Negativo</option>
            <option value="Trazas">Trazas</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
          </select>
        </div>

        {/* Sangre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sangre
          </label>
          <select
            value={resultados.sangre || ''}
            onChange={(e) => onChange('sangre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Negativo">Negativo</option>
            <option value="Trazas">Trazas</option>
            <option value="+">+</option>
            <option value="++">++</option>
            <option value="+++">+++</option>
          </select>
        </div>

        {/* Leucocitos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leucocitos (/campo)
          </label>
          <input
            type="text"
            value={resultados.leucocitos || ''}
            onChange={(e) => onChange('leucocitos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="5-10"
          />
        </div>

        {/* Bacterias */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bacterias
          </label>
          <select
            value={resultados.bacterias || ''}
            onChange={(e) => onChange('bacterias', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Ausentes">Ausentes</option>
            <option value="Escasas">Escasas</option>
            <option value="Moderadas">Moderadas</option>
            <option value="Abundantes">Abundantes</option>
          </select>
        </div>

        {/* Cristales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cristales
          </label>
          <input
            type="text"
            value={resultados.cristales || ''}
            onChange={(e) => onChange('cristales', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Ninguno, Oxalato de calcio, etc."
          />
        </div>
      </div>
    </div>
  );
}
