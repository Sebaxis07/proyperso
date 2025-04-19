// servidor/controllers/productos.js
import Producto from '../models/Producto.js';

// @desc    Obtener todos los productos
// @route   GET /api/productos
// @access  Public
export async function getProductos(req, res) {
  try {
    const { 
      categoria, 
      tipoMascota, 
      destacado, 
      enOferta, 
      precioMin, 
      precioMax,
      sort,
      limit = 10,
      page = 1
    } = req.query;

    // Construir query
    const query = {};
    
    if (categoria) query.categoria = categoria;
    if (tipoMascota) query.tipoMascota = tipoMascota;
    if (destacado) query.destacado = destacado === 'true';
    if (enOferta) query.enOferta = enOferta === 'true';
    
    // Filtro de precio
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = parseInt(precioMin);
      if (precioMax) query.precio.$lte = parseInt(precioMax);
    }

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Ordenamiento
    let sortOption = { createdAt: -1 }; // Default: más recientes primero
    if (sort) {
      if (sort === 'precio-asc') sortOption = { precio: 1 };
      if (sort === 'precio-desc') sortOption = { precio: -1 };
      if (sort === 'nombre-asc') sortOption = { nombre: 1 };
      if (sort === 'nombre-desc') sortOption = { nombre: -1 };
    }

    // Ejecutar query
    const productos = await Producto.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total de documentos para la paginación
    const total = await Producto.countDocuments(query);

    res.json({
      success: true,
      count: productos.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: productos
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Obtener un producto por ID
// @route   GET /api/productos/:id
// @access  Public
export async function getProducto(req, res) {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }
    
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Crear un producto (solo admin)
// @route   POST /api/productos
// @access  Private/Admin
export async function crearProducto(req, res) {
  try {
    const { 
      nombre, 
      descripcion, 
      precio, 
      categoria, 
      tipoMascota, 
      imagenUrl, 
      stock, 
      destacado, 
      enOferta, 
      descuento 
    } = req.body;

    // Crear producto
    const producto = new Producto({
      nombre,
      descripcion,
      precio,
      categoria,
      tipoMascota,
      imagenUrl,
      stock,
      destacado,
      enOferta,
      descuento
    });

    await producto.save();

    res.status(201).json({
      success: true,
      data: producto
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Actualizar un producto (solo admin)
// @route   PUT /api/productos/:id
// @access  Private/Admin
export async function actualizarProducto(req, res) {
  try {
    const { 
      nombre, 
      descripcion, 
      precio, 
      categoria, 
      tipoMascota, 
      imagenUrl, 
      stock, 
      destacado, 
      enOferta, 
      descuento 
    } = req.body;

    let producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }

    // Construir objeto de actualización
    const camposActualizacion = {};
    if (nombre) camposActualizacion.nombre = nombre;
    if (descripcion) camposActualizacion.descripcion = descripcion;
    if (precio) camposActualizacion.precio = precio;
    if (categoria) camposActualizacion.categoria = categoria;
    if (tipoMascota) camposActualizacion.tipoMascota = tipoMascota;
    if (imagenUrl) camposActualizacion.imagenUrl = imagenUrl;
    if (stock !== undefined) camposActualizacion.stock = stock;
    if (destacado !== undefined) camposActualizacion.destacado = destacado;
    if (enOferta !== undefined) camposActualizacion.enOferta = enOferta;
    if (descuento !== undefined) camposActualizacion.descuento = descuento;

    // Actualizar producto
    producto = await Producto.findByIdAndUpdate(
      req.params.id,
      camposActualizacion,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: producto
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}

// @desc    Eliminar un producto (solo admin)
// @route   DELETE /api/productos/:id
// @access  Private/Admin
export async function eliminarProducto(req, res) {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }

    await producto.deleteOne();

    res.json({
      success: true,
      msg: 'Producto eliminado'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}