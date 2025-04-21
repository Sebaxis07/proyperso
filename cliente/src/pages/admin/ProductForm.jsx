import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'alimentos',
    tipoMascota: 'perro',
    imagenUrl: '',
    stock: '',
    destacado: false,
    enOferta: false,
    descuento: 0
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    { id: 'alimentos', nombre: 'Alimentos' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'higiene', nombre: 'Higiene' },
    { id: 'juguetes', nombre: 'Juguetes' },
    { id: 'medicamentos y cuidado', nombre: 'Medicamentos y Cuidado' }, 
    { id: 'camas', nombre: 'Camas' },
    { id: 'transportadoras', nombre: 'Transportadoras' },
    { id: 'otros', nombre: 'Otros' }
  ];

  const tiposMascota = [
    { id: 'perro', nombre: 'Perro' },
    { id: 'gato', nombre: 'Gato' },
    { id: 'ave', nombre: 'Ave' },
    { id: 'pez', nombre: 'Pez' },
    { id: 'roedor', nombre: 'Roedor' },
    { id: 'reptil', nombre: 'Reptil' },
    { id: 'otro', nombre: 'Otro' }
  ];

  useEffect(() => {
    const fetchProducto = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No estás autenticado');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const res = await axios.get(`/api/productos/${id}`, config);

        setFormData({
          nombre: res.data.data.nombre || '',
          descripcion: res.data.data.descripcion || '',
          precio: res.data.data.precio || '',
          categoria: res.data.data.categoria || 'alimentos',
          tipoMascota: res.data.data.tipoMascota || 'perro',
          imagenUrl: res.data.data.imagenUrl || '',
          stock: res.data.data.stock || '',
          destacado: res.data.data.destacado || false,
          enOferta: res.data.data.enOferta || false,
          descuento: res.data.data.descuento || 0
        });

        if (res.data.data.imagenUrl) {
          setImagePreview(res.data.data.imagenUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el producto:', err);
        setError('Error al cargar los datos del producto. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Archivo seleccionado:", file.name, file.type, file.size);

    if (!file.type.match('image.*')) {
      setFormErrors({
        ...formErrors,
        image: 'El archivo debe ser una imagen (JPG, PNG, GIF, etc.)'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        image: 'La imagen no debe superar los 5MB'
      });
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      console.log("Vista previa generada");
    };
    reader.readAsDataURL(file);

    setFormErrors({
      ...formErrors,
      image: null
    });

    // Limpiamos la URL de imagen al seleccionar un archivo
    setFormData(prevState => ({
      ...prevState,
      imagenUrl: ''
    }));
  };

  const uploadImage = async () => {
    if (!imageFile) {
      console.log("No hay archivo de imagen para subir");
      // Si no hay archivo pero hay URL, devolvemos la URL limpia
      if (formData.imagenUrl) {
        return formData.imagenUrl.trim();
      }
      return '';
    }

    try {
      console.log("Iniciando carga de imagen:", imageFile.name);
      setIsUploading(true);
      setUploadProgress(0);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const formDataObj = new FormData();
      formDataObj.append('imagen', imageFile);

      console.log("Contenido del FormData:");
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Importante: No establecer 'Content-Type' aquí, FormData lo configura automáticamente
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
          console.log(`Progreso de carga: ${progress}%`);
        }
      };

      // Usar la URL completa para evitar problemas de proxy en desarrollo
      const uploadUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/upload` 
        : 'http://localhost:5000/api/upload';

      console.log("URL de subida:", uploadUrl);

      const response = await axios.post(
        uploadUrl,
        formDataObj,
        config
      );

      console.log("Respuesta del servidor:", response.data);
      setIsUploading(false);

      if (response.data.success && response.data.data && response.data.data.url) {
        return response.data.data.url.trim(); // Aseguramos que no hay espacios
      } else {
        throw new Error('No se recibió la URL de la imagen correctamente');
      }

    } catch (err) {
      console.error('Error al subir la imagen:', err);
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.data);
        console.error('Estado HTTP:', err.response.status);
        console.error('Headers:', err.response.headers);
      }
      setIsUploading(false);
      throw new Error(err.response?.data?.message || 'Error al subir la imagen');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.precio || isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      errors.precio = 'Ingresa un precio válido mayor a 0';
    }

    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      errors.stock = 'Ingresa una cantidad de stock válida (0 o mayor)';
    }

    if (formData.enOferta && (!formData.descuento || isNaN(formData.descuento) ||
        parseFloat(formData.descuento) <= 0 || parseFloat(formData.descuento) > 100)) {
      errors.descuento = 'Para productos en oferta, ingresa un descuento válido entre 1 y 100';
    }

    if (!imageFile && !formData.imagenUrl) {
      errors.image = 'Debes proporcionar una imagen del producto';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Formulario inválido. Errores:", formErrors);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imagenUrl = formData.imagenUrl ? formData.imagenUrl.trim() : '';

      if (imageFile) {
        console.log("Subiendo nueva imagen");
        imagenUrl = await uploadImage();

        if (!imagenUrl) {
          throw new Error('Error al subir la imagen');
        }

        console.log("Imagen subida exitosamente:", imagenUrl);
      } else {
        console.log("Usando URL de imagen existente:", imagenUrl);
      }

      if (!imagenUrl) {
        throw new Error('No se ha proporcionado una imagen para el producto');
      }

      // Asegurar que la URL comienza con http o https
      if (!imagenUrl.startsWith('http://') && !imagenUrl.startsWith('https://')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        imagenUrl = imagenUrl.startsWith('/') 
          ? `${baseUrl}${imagenUrl}` 
          : `${baseUrl}/${imagenUrl}`;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No estás autenticado');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let categoriaCorregida = formData.categoria;
      
      if (categoriaCorregida.toLowerCase().includes('medicamentos y')) {
        categoriaCorregida = 'medicamentos y cuidado';
      }

      const productoData = {
        ...formData,
        imagenUrl: imagenUrl, // Aseguramos que usamos la URL procesada
        categoria: categoriaCorregida, 
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        descuento: parseFloat(formData.descuento)
      };

      console.log("Datos del producto a guardar:", productoData);

      let res;
      if (isEditMode) {
        console.log(`Actualizando producto con ID: ${id}`);
        res = await axios.put(`/api/productos/${id}`, productoData, config);
      } else {
        console.log("Creando nuevo producto");
        res = await axios.post('/api/productos', productoData, config);
      }

      console.log("Respuesta del servidor (guardar producto):", res.data);

      // Actualizamos el caché para otros componentes (opcional)
      if (window.localStorage) {
        window.localStorage.setItem('productsLastUpdated', Date.now().toString());
      }

      // Forzamos una actualización completa al navegar de vuelta a la lista
      localStorage.setItem('forceProductsRefresh', 'true');
      navigate('/admin/productos');
      
      // Opcional: Si los problemas persisten, puedes forzar un refresco completo
      // setTimeout(() => window.location.href = '/admin/productos', 100);
    } catch (err) {
      console.error('Error al guardar el producto:', err);
      console.error('Detalles del error:', err.response?.data || err.message);
      
      if (err.response?.data?.error?.includes('medicamentos y Cuidado')) {
        setError('Error en la categoría: Hay un problema con el formato de "Medicamentos y Cuidado". Por favor, contacte al administrador del sistema.');
      } else {
        setError(err.response?.data?.msg || `Error al guardar el producto: ${err.message}`);
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`form-input w-full ${formErrors.nombre ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.nombre && <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>}
            </div>
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                id="precio"
                name="precio"
                min="1"
                step="1"
                value={formData.precio}
                onChange={handleChange}
                className={`form-input w-full ${formErrors.precio ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.precio && <p className="text-red-500 text-sm mt-1">{formErrors.precio}</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
              className={`form-input w-full ${formErrors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {formErrors.descripcion && <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="form-input w-full border-gray-300"
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="tipoMascota" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de mascota *
              </label>
              <select
                id="tipoMascota"
                name="tipoMascota"
                value={formData.tipoMascota}
                onChange={handleChange}
                className="form-input w-full border-gray-300"
              >
                {tiposMascota.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`form-input w-full ${formErrors.stock ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.stock && <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del producto *
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${formErrors.image ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                  <div className="space-y-1 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Subir una imagen</span>
                        <input 
                          id="image-upload" 
                          name="image-upload" 
                          type="file" 
                          accept="image/*" 
                          className="sr-only" 
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hasta 5MB
                    </p>
                    {imageFile && (
                      <p className="text-xs text-green-600 font-medium">
                        Archivo seleccionado: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
                {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">O ingresa una URL de imagen:</p>
                  <input
                    type="text"
                    id="imagenUrl"
                    name="imagenUrl"
                    value={formData.imagenUrl}
                    onChange={(e) => {
                      handleChange(e);
                      // Si se ingresa una URL, limpiar el archivo seleccionado
                      if (e.target.value) setImageFile(null);
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className={`form-input w-full ${formErrors.image && !imageFile ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Subiendo: {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              <div>
                {imagePreview ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                    <div className="border rounded-md overflow-hidden h-48 flex items-center justify-center bg-gray-50">
                      <img 
                        src={imagePreview} 
                        alt="Vista previa" 
                        className="max-h-full max-w-full object-contain" 
                        onError={(e) => {
                          console.error("Error al cargar la imagen de vista previa");
                          e.target.src = 'https://via.placeholder.com/150?text=Error+de+imagen';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 border rounded-md p-4 h-48 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-400">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="destacado"
                name="destacado"
                checked={formData.destacado}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                Producto destacado
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enOferta"
                name="enOferta"
                checked={formData.enOferta}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="enOferta" className="ml-2 block text-sm text-gray-700">
                En oferta
              </label>
            </div>
            
            <div className={formData.enOferta ? '' : 'opacity-50'}>
              <label htmlFor="descuento" className="block text-sm font-medium text-gray-700 mb-1">
                Descuento (%)
              </label>
              <input
                type="number"
                id="descuento"
                name="descuento"
                min="0"
                max="100"
                value={formData.descuento}
                onChange={handleChange}
                disabled={!formData.enOferta}
                className={`form-input w-full ${formErrors.descuento ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.descuento && <p className="text-red-500 text-sm mt-1">{formErrors.descuento}</p>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/productos')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed"
            >
              {isSubmitting || isUploading ? 'Guardando...' : isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
