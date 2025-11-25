'use client';

interface FormHecesProps {
  resultados: any;
  onChange: (field: string, value: any) => void;
}

export default function FormHeces({ resultados, onChange }: FormHecesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🧻 Coprológico
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consistencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consistencia
          </label>
          <select
            value={resultados.consistencia || ''}
            onChange={(e) => onChange('consistencia', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Líquida">Líquida</option>
            <option value="Blanda">Blanda</option>
            <option value="Normal">Normal</option>
            <option value="Dura">Dura</option>
          </select>
        </div>

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
            <option value="Marrón">Marrón</option>
            <option value="Verde">Verde</option>
            <option value="Amarillo">Amarillo</option>
            <option value="Negro">Negro</option>
            <option value="Rojo">Rojo</option>
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
            placeholder="7.0"
          />
        </div>

        {/* Sangre oculta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sangre oculta
          </label>
          <select
            value={resultados.sangre_oculta || ''}
            onChange={(e) => onChange('sangre_oculta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Positivo">Positivo</option>
            <option value="Negativo">Negativo</option>
          </select>
        </div>

        {/* Parásitos */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parásitos
          </label>
          <input
            type="text"
            value={resultados.parasitos || ''}
            onChange={(e) => onChange('parasitos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="No se observan, o descripción de los observados"
          />
        </div>

        {/* Leucocitos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leucocitos
          </label>
          <input
            type="text"
            value={resultados.leucocitos || ''}
            onChange={(e) => onChange('leucocitos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Negativos, 0-5/campo, etc."
          />
        </div>

        {/* Moco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moco
          </label>
          <select
            value={resultados.moco || ''}
            onChange={(e) => onChange('moco', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="Ausente">Ausente</option>
            <option value="Escaso">Escaso</option>
            <option value="Moderado">Moderado</option>
            <option value="Abundante">Abundante</option>
          </select>
        </div>

        {/* Restos alimenticios */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restos alimenticios
          </label>
          <input
            type="text"
            value={resultados.restos_alimenticios || ''}
            onChange={(e) => onChange('restos_alimenticios', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="No, Sí, o descripción"
          />
        </div>
      </div>
    </div>
  );
}
