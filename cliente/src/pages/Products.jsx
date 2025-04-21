// cliente/src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/productos/ProductCard';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Estados
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1
  });
  
  // Filtros
  const [filtros, setFiltros] = useState({
    categoria: queryParams.get('categoria') || '',
    tipoMascota: queryParams.get('tipoMascota') || '',
    destacado: queryParams.get('destacado') || '',
    enOferta: queryParams.get('enOferta') || '',
    precioMin: queryParams.get('precioMin') || '',
    precioMax: queryParams.get('precioMax') || '',
    sort: queryParams.get('sort') || '',
    page: parseInt(queryParams.get('page') || '1'),
    limit: parseInt(queryParams.get('limit') || '12')
  });
  
  // Opciones para filtros
  const categorias = [
    { id: 'alimentos', nombre: 'Alimentos' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'higiene', nombre: 'Higiene' },
    { id: 'juguetes', nombre: 'Juguetes' },
    { id: 'medicamentos y Cuidado', nombre: 'Medicamentos' },
  ];
  
  const tiposMascota = [
    { id: 'perro', nombre: 'Perros' },
    { id: 'gato', nombre: 'Gatos' },
    { id: 'ave', nombre: 'Aves' },
    { id: 'pez', nombre: 'Peces' },
    { id: 'roedor', nombre: 'Roedores' },
    { id: 'reptil', nombre: 'Reptiles' },
    { id: 'otro', nombre: 'Otros' }
  ];
  
  const opcionesSorteo = [
    { id: 'precio-asc', nombre: 'Precio: Menor a Mayor' },
    { id: 'precio-desc', nombre: 'Precio: Mayor a Menor' },
    { id: 'nombre-asc', nombre: 'Nombre: A-Z' },
    { id: 'nombre-desc', nombre: 'Nombre: Z-A' },
    { id: '', nombre: 'Más Recientes' }
  ];
  
  // Efecto para cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        
        // Construir query string con los filtros
        const params = new URLSearchParams();
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.tipoMascota) params.append('tipoMascota', filtros.tipoMascota);
        if (filtros.destacado) params.append('destacado', filtros.destacado);
        if (filtros.enOferta) params.append('enOferta', filtros.enOferta);
        if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
        if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
        if (filtros.sort) params.append('sort', filtros.sort);
        params.append('page', filtros.page);
        params.append('limit', filtros.limit);
        
        // Actualizar URL con los parámetros de filtro
        navigate({
          pathname: location.pathname,
          search: params.toString()
        }, { replace: true });
        
        const res = await axios.get(`/api/productos?${params.toString()}`);
        
        setProductos(res.data.data);
        setPagination({
          currentPage: res.data.pagination.currentPage,
          totalPages: res.data.pagination.totalPages
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('Hubo un problema al cargar los productos. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };
    
    fetchProductos();
  }, [filtros, location.pathname, navigate]);
  
  // Manejar cambios en filtros
  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes (destacado, enOferta)
    if (type === 'checkbox') {
      setFiltros({
        ...filtros,
        [name]: checked ? 'true' : '',
        page: 1 // Resetear página al cambiar filtros
      });
    } else {
      setFiltros({
        ...filtros,
        [name]: value,
        page: 1 // Resetear página al cambiar filtros
      });
    }
  };
  
  // Limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      categoria: '',
      tipoMascota: '',
      destacado: '',
      enOferta: '',
      precioMin: '',
      precioMax: '',
      sort: '',
      page: 1,
      limit: filtros.limit
    });
  };
  
  // Cambiar página
  const handlePageChange = (page) => {
    setFiltros({
      ...filtros,
      page
    });
    
    // Scroll al inicio de los resultados
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Generar paginación
  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    // Ajustar startPage si endPage está limitado
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Botón de página anterior
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
      >
        &laquo;
      </button>
    );
    
    // Páginas
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border ${
            pagination.currentPage === i
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Botón de página siguiente
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
      >
        &raquo;
      </button>
    );
    
    return pages;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filtros (lateral) */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-xl rounded-2xl p-8 sticky top-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
              <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              </svg>
              Filtros
            </h2>
            <button
              onClick={handleLimpiarFiltros}
              className="text-[#FFD15C] hover:text-[#FFC132] text-sm font-bold flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          </div>
  
          {/* Categoría */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Categoría
            </h3>
            <select
              name="categoria"
              value={filtros.categoria}
              onChange={handleFiltroChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
  
          {/* Tipo de Mascota */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tipo de Mascota
            </h3>
            <select
              name="tipoMascota"
              value={filtros.tipoMascota}
              onChange={handleFiltroChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            >
              <option value="">Todas las mascotas</option>
              {tiposMascota.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
  
          {/* Rango de Precio */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
              Rango de Precio
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                id="precioMin"
                name="precioMin"
                value={filtros.precioMin}
                onChange={handleFiltroChange}
                placeholder="Mínimo"
                className="form-input w-full text-sm rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
                min="0"
              />
              <input
                type="number"
                id="precioMax"
                name="precioMax"
                value={filtros.precioMax}
                onChange={handleFiltroChange}
                placeholder="Máximo"
                className="form-input w-full text-sm rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
                min="0"
              />
            </div>
          </div>

          {/* Marca */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Marca
            </h3>
            <select
              name="marca"
              value={filtros.marca}
              onChange={handleFiltroChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            >
              <option value="">Todas las marcas</option>
              {/* Aquí deberías cargar las marcas desde tu base de datos */}
              <option value="marca1">Marca 1</option>
              <option value="marca2">Marca 2</option>
              <option value="marca3">Marca 3</option>
            </select>
          </div>
  
          {/* Descuento */}
          <div className="mb-8">
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Descuento
            </h3>
            <select
              name="descuento"
              value={filtros.descuento}
              onChange={handleFiltroChange}
              className="form-input w-full rounded-lg border-gray-300 focus:border-[#FFD15C] focus:ring-[#FFD15C] transition"
            >
              <option value="">Todos los descuentos</option>
              <option value="10">10% o más</option>
              <option value="20">20% o más</option>
              <option value="30">30% o más</option>
              <option value="50">50% o más</option>
            </select>
          </div>
  
          {/* Opciones adicionales */}
          <div>
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Opciones adicionales
            </h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="destacado"
                  name="destacado"
                  checked={filtros.destacado === 'true'}
                  onChange={handleFiltroChange}
                  className="h-4 w-4 text-[#FFD15C] focus:ring-[#FFD15C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Productos destacados</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="enOferta"
                  name="enOferta"
                  checked={filtros.enOferta === 'true'}
                  onChange={handleFiltroChange}
                  className="h-4 w-4 text-[#FFD15C] focus:ring-[#FFD15C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Productos en oferta</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Listado de productos */}
      <div className="lg:col-span-3">
        {/* Cabecera: ordenamiento y cantidad */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0 flex items-center gap-2">
            <svg className="w-7 h-7 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            {filtros.categoria ? (
              categorias.find(c => c.id === filtros.categoria)?.nombre || 'Productos'
            ) : filtros.tipoMascota ? (
              `Productos para ${tiposMascota.find(t => t.id === filtros.tipoMascota)?.nombre || 'mascotas'}`
            ) : (
              'Todos los Productos'
            )}
            <span className="ml-3 bg-[#FFD15C] text-white px-3 py-1 rounded-full text-xs font-bold animate-fadeIn">{productos.length}</span>
          </h1>
          <div className="flex items-center space-x-3">
            <select
              name="sort"
              value={filtros.sort}
              onChange={handleFiltroChange}
              className="form-input sm:w-auto border-gray-300 rounded-md text-sm"
            >
              {opcionesSorteo.map(opcion => (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Mensajes de estado */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD15C]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow">
            <p>{error}</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white shadow-lg rounded-2xl p-10 text-center animate-fadeIn">
            <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
            <p className="text-gray-600 mb-6">Prueba con otros filtros o criterios de búsqueda.</p>
            <button
              onClick={handleLimpiarFiltros}
              className="bg-[#FFD15C] hover:bg-[#FFC132] text-white font-bold py-2 px-6 rounded-full shadow transition-all duration-300"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {productos.map((producto) => (
                <div key={producto._id} className="animate-fadeIn">
                  <ProductCard producto={producto} />
                </div>
              ))}
            </div>
            
            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="inline-flex space-x-1">
                  {renderPagination()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;