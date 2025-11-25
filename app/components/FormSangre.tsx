'use client';

interface FormSangreProps {
  resultados: any;
  onChange: (field: string, value: any) => void;
}

export default function FormSangre({ resultados, onChange }: FormSangreProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🩸 Análisis de Sangre (Hematología)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hemoglobina */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hemoglobina (g/dL)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.hemoglobina || ''}
            onChange={(e) => onChange('hemoglobina', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="14.5"
          />
        </div>

        {/* Hematocrito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hematocrito (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.hematocrito || ''}
            onChange={(e) => onChange('hematocrito', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="42"
          />
        </div>

        {/* Leucocitos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leucocitos (/mm³)
          </label>
          <input
            type="number"
            value={resultados.leucocitos || ''}
            onChange={(e) => onChange('leucocitos', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="7500"
          />
        </div>

        {/* Plaquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plaquetas (/mm³)
          </label>
          <input
            type="number"
            value={resultados.plaquetas || ''}
            onChange={(e) => onChange('plaquetas', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="250000"
          />
        </div>

        {/* Glucosa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Glucosa (mg/dL)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.glucosa || ''}
            onChange={(e) => onChange('glucosa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="95"
          />
        </div>

        {/* VCM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VCM (fL)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.vcm || ''}
            onChange={(e) => onChange('vcm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="85"
          />
        </div>

        {/* HCM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HCM (pg)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.hcm || ''}
            onChange={(e) => onChange('hcm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="28"
          />
        </div>

        {/* CHCM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CHCM (g/dL)
          </label>
          <input
            type="number"
            step="0.1"
            value={resultados.chcm || ''}
            onChange={(e) => onChange('chcm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="33"
          />
        </div>
      </div>
    </div>
  );
}
