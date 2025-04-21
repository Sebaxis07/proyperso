// cliente/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebookF, FaTwitter, FaInstagram, FaClock } from 'react-icons/fa';
import logo from '../../assets/Logo.png';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg shadow-glow-yellow">
                <img src={logo} alt="Lucky PetShop Logo" className="h-12 w-12" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FFD15C] to-[#FFC132] bg-clip-text text-transparent">
                  Lucky PetShop
                </h3>
                <p className="text-sm text-gray-400">Tu tienda de confianza</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Nos dedicamos a brindar los mejores productos y servicios para el bienestar 
              de tus mascotas, porque ellos merecen lo mejor.
            </p>
            <div className="flex space-x-4">
              <SocialButton icon={<FaFacebookF />} href="https://facebook.com/luckypetshop" />
              <SocialButton icon={<FaTwitter />} href="https://twitter.com/luckypetshop" />
              <SocialButton icon={<FaInstagram />} href="https://instagram.com/luckypetshop" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <FooterLink to="/" text="Inicio" />
              <FooterLink to="/productos" text="Productos" />
              <FooterLink to="/nosotros" text="Nosotros" />
              <FooterLink to="/contacto" text="Contacto" />
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Horario de Atención</h3>
            <ul className="space-y-3">
              <HorarioItem dia="Lunes a Viernes" horario="09:00 - 20:00" />
              <HorarioItem dia="Sábados" horario="10:00 - 18:00" />
              <HorarioItem dia="Domingos" horario="11:00 - 15:00" />
              <li className="pt-4">
                <span className="px-3 py-1 bg-[#FFD15C]/10 text-[#FFD15C] rounded-full text-xs">
                  Feriados: Horario especial
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contacto</h3>
            <ul className="space-y-4">
              <ContactItem 
                icon={<FaMapMarkerAlt />}
                text="Av. Esmeralda #1993, Antofagasta"
              />
              <ContactItem 
                icon={<FaEnvelope />}
                text="contacto@luckypetshop.cl"
                href="mailto:contacto@luckypetshop.cl"
              />
              <ContactItem 
                icon={<FaPhone />}
                text="+56 2 2123 4567"
                href="tel:+56221234567"
              />
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {year} Lucky PetShop. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link to="/terminos" className="text-sm text-gray-400 hover:text-[#FFD15C] transition-colors">
                Términos y Condiciones
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/privacidad" className="text-sm text-gray-400 hover:text-[#FFD15C] transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, text }) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-400 hover:text-[#FFD15C] transition-colors duration-300 flex items-center group"
    >
      <span className="h-[2px] w-0 bg-[#FFD15C] mr-2 transition-all duration-300 group-hover:w-4" />
      {text}
    </Link>
  </li>
);

const ContactItem = ({ icon, text, href }) => (
  <li>
    <a 
      href={href} 
      className="flex items-center space-x-3 text-gray-400 hover:text-[#FFD15C] transition-colors duration-300"
    >
      <span className="text-[#FFD15C]">{icon}</span>
      <span>{text}</span>
    </a>
  </li>
);

const HorarioItem = ({ dia, horario }) => (
  <li className="flex justify-between items-center text-sm">
    <span className="text-gray-400">{dia}</span>
    <span className="text-[#FFD15C]">{horario}</span>
  </li>
);

const SocialButton = ({ icon, href }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-[#FFD15C]/10 flex items-center justify-center text-[#FFD15C] 
             hover:bg-[#FFD15C] hover:text-white transition-all duration-300 transform hover:scale-110"
  >
    {icon}
  </a>
);

export default Footer;