
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Droplet, FileText, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [buttonMessage, setButtonMessage] = useState('');

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setButtonMessage('¡Contacto iniciado!');
    setTimeout(() => setButtonMessage(''), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Laboratorio Clínico Blanca Trinidad</h1>
                <p className="text-sm text-gray-600">Precisión y confianza en cada resultado</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#servicios" className="text-gray-700 hover:text-brand-500 font-medium transition-colors">
                Servicios
              </a>
              <a href="#contacto" className="text-gray-700 hover:text-brand-500 font-medium transition-colors">
                Contacto
              </a>
              <Link href="/login" className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors">
                Ingresar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Exámenes Clínicos de Alta Precisión</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Resultados confiables para tu salud y bienestar. Tecnología avanzada y personal especializado a tu servicio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#servicios" className="bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Ver Servicios
            </a>
            <a href="#contacto" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-700 transition-colors">
              Contactar Ahora
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de exámenes clínicos con la más alta calidad y precisión
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Blood Tests */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Análisis de Sangre</h4>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Hemograma completo</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Perfil lipídico</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Glucosa y diabetes</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Función hepática y renal</li>
              </ul>
              <button onClick={handleButtonClick} className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors">
                Más Información
              </button>
            </div>

            {/* Urine Tests */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Droplet className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Análisis de Orina</h4>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Examen general de orina</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Cultivo de orina</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Detección de drogas</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Proteínas y microalbúmina</li>
              </ul>
              <button onClick={handleButtonClick} className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors">
                Más Información
              </button>
            </div>

            {/* STD Tests */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-brand-300 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FileText className="w-8 h-8 text-brand-700" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Pruebas de ETS</h4>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Panel completo de ETS</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>VIH y Hepatitis</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Sífilis y Gonorrea</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>Resultados confidenciales</li>
              </ul>
              <button onClick={handleButtonClick} className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors">
                Más Información
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Contáctanos</h3>
            <p className="text-xl text-gray-300">Estamos aquí para atenderte</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Teléfono</h4>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Email</h4>
              <p className="text-gray-300">info@laboratorio.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Dirección</h4>
              <p className="text-gray-300">Municipio Tubores, El Guamache, Puntas de Piedras</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <button onClick={handleButtonClick} className="bg-brand-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-700 transition-colors">
              Agendar Cita Ahora
            </button>
            {buttonMessage && (
              <p className="mt-4 text-brand-300 font-semibold">{buttonMessage}</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2024 Laboratorio Clínico Blanca Trinidad. Todos los derechos reservados.</p>
          <p className="mt-2 text-sm">Licencia sanitaria vigente. Resultados con validez médica.</p>
        </div>
      </footer>
    </div>
  );
}