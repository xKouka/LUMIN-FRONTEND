
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Droplet, FileText, Phone, MapPin, CheckCircle, Users } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  const [buttonMessage, setButtonMessage] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });
  }, []);

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
              <a href="#sobre-nosotros" className="text-gray-700 hover:text-brand-500 font-medium transition-colors">
                Sobre Nosotros
              </a>
              <a href="#servicios" className="text-gray-700 hover:text-brand-500 font-medium transition-colors">
                Servicios
              </a>
              <a href="#ubicacion" className="text-gray-700 hover:text-brand-500 font-medium transition-colors">
                Ubicación
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
          <h2 className="text-5xl font-bold mb-6" data-aos="fade-down">Exámenes Clínicos de Alta Precisión</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            Resultados confiables para tu salud y bienestar. Tecnología avanzada y personal especializado a tu servicio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-aos="zoom-in" data-aos-delay="400">
            <a href="#servicios" className="bg-white text-brand-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Ver Servicios
            </a>
            <a href="#contacto" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-700 transition-colors">
              Contactar Ahora
            </a>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="sobre-nosotros" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Column */}
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl" data-aos="fade-right">
              <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <Users className="w-32 h-32 text-brand-500 opacity-50" />
              </div>
            </div>
            
            {/* Text Column */}
            <div data-aos="fade-left">
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Sobre Nosotros</h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                El <strong>Laboratorio Clínico Blanca Trinidad</strong> es un centro de excelencia en análisis clínicos, 
                comprometido con la salud y el bienestar de nuestra comunidad en Puntas de Piedras y sus alrededores.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Con años de experiencia en el campo de la medicina diagnóstica, nuestro equipo de profesionales altamente 
                capacitados utiliza tecnología de punta para garantizar resultados precisos y confiables.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Nos especializamos en ofrecer un servicio personalizado, rápido y de calidad, entendiendo que cada paciente 
                merece atención profesional y resultados que contribuyan a su diagnóstico y tratamiento médico.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-brand-700 mb-1">10+</div>
                  <div className="text-sm text-gray-600">Años de experiencia</div>
                </div>
                <div className="bg-brand-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-brand-700 mb-1">50+</div>
                  <div className="text-sm text-gray-600">Tipos de exámenes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de exámenes clínicos con la más alta calidad y precisión
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Blood Tests */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="100">
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
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="200">
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
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" data-aos="fade-up" data-aos-delay="300">
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

      {/* Location Section with Map */}
      <section id="ubicacion" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Nuestra Ubicación</h3>
            <p className="text-xl text-gray-600">Visítanos en El Guamache, Puntas de Piedras</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg h-96" data-aos="fade-right">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933.123456789!2d-64.123456!3d10.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDA3JzI0LjQiTiA2NMKwMDcnMjQuNCJX!5e0!3m2!1ses!2sve!4v1234567890123!5m2!1ses!2sve"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Laboratorio Clínico Blanca Trinidad"
              ></iframe>
            </div>
            
            {/* Location Info */}
            <div className="space-y-6" data-aos="fade-left">
              <div className="bg-brand-50 p-6 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Dirección</h4>
                    <p className="text-gray-700">Municipio Tubores</p>
                    <p className="text-gray-700">El Guamache, Puntas de Piedras</p>
                    <p className="text-gray-700">Estado Nueva Esparta</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-brand-50 p-6 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Teléfono</h4>
                    <p className="text-gray-700 text-lg">0424-843-6355</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-brand-50 p-6 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Horario de Atención</h4>
                    <p className="text-gray-700">Lunes a Viernes: 7:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h3 className="text-4xl font-bold mb-4">Contáctanos</h3>
            <p className="text-xl text-gray-300">Estamos aquí para atenderte</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="text-center" data-aos="zoom-in" data-aos-delay="100">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Teléfono</h4>
              <p className="text-gray-300">0424-843-6355</p>
            </div>
            <div className="text-center" data-aos="zoom-in" data-aos-delay="200">
              <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Dirección</h4>
              <p className="text-gray-300">Municipio Tubores, El Guamache, Puntas de Piedras</p>
            </div>
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