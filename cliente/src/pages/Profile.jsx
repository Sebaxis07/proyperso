import { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InfoCard, { UserIcon, EmailIcon, PhoneIcon, IdIcon } from '../components/InfoCard';
import axios from 'axios';
import { toast } from 'react-toastify';

// Avatares predeterminados
const avatarsPredeterminados = [
  { id: 'avatar1.png', src: 'src/img/ProfilePred/perro.jpg', alt: 'Avatar 1' },
  { id: 'avatar2.png', src: 'src/img/ProfilePred/gato.jpg', alt: 'Avatar 2' },
  { id: 'avatar3.png', src: 'src/img/ProfilePred/hamster.webp', alt: 'Avatar 3' },
  { id: 'avatar4.png', src: 'src/img/ProfilePred/ave.jpg', alt: 'Avatar 4' },
  { id: 'avatar5.png', src: 'src/img/ProfilePred/raton.jpg', alt: 'Avatar 5' },
];

const Profile = () => {
  const { currentUser, updateProfile, error } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [pedidosCount, setPedidosCount] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: {
      calle: '',
      numero: '',
      comuna: '',
      ciudad: '',
      region: '',
      codigoPostal: ''
    }
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        nombre: currentUser.nombre || '',
        apellido: currentUser.apellido || '',
        telefono: currentUser.telefono || '',
        direccion: {
          calle: currentUser.direccion?.calle || '',
          numero: currentUser.direccion?.numero || '',
          comuna: currentUser.direccion?.comuna || '',
          ciudad: currentUser.direccion?.ciudad || '',
          region: currentUser.direccion?.region || '',
          codigoPostal: currentUser.direccion?.codigoPostal || ''
        }
      });

      // Establecer el avatar predeterminado basado en el usuario actual
      if (currentUser.fotoPerfil) {
        setSelectedAvatar(currentUser.fotoPerfil);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchPedidosCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/pedidos/count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPedidosCount(response.data.count);
      } catch (error) {
        console.error('Error al obtener conteo de pedidos:', error);
      }
    };

    if (currentUser) {
      fetchPedidosCount();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    }

    if (!formData.direccion.calle.trim()) {
      errors['direccion.calle'] = 'La calle es obligatoria';
    }
    if (!formData.direccion.numero.trim()) {
      errors['direccion.numero'] = 'El número es obligatorio';
    }
    if (!formData.direccion.comuna.trim()) {
      errors['direccion.comuna'] = 'La comuna es obligatoria';
    }
    if (!formData.direccion.ciudad.trim()) {
      errors['direccion.ciudad'] = 'La ciudad es obligatoria';
    }
    if (!formData.direccion.region.trim()) {
      errors['direccion.region'] = 'La región es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await updateProfile(formData);
        setIsEditing(false);
        toast.success('Perfil actualizado correctamente');
      } catch (err) {
        console.error("Error al actualizar perfil:", err);
        toast.error('Error al actualizar el perfil');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAvatarClick = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/usuarios/${currentUser._id}/foto-predeterminada`, 
        { fotoPerfil: selectedAvatar },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      // Actualizar el contexto del usuario con la nueva foto
      updateProfile({ fotoPerfil: selectedAvatar, tipoFoto: 'predeterminada' });
      setShowAvatarModal(false);

      // Mostrar notificación de éxito
      toast.success('Foto de perfil actualizada correctamente');

      // Forzar la actualización del componente ProfilePicture
      setAvatarKey(Date.now());

    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
      toast.error('Error al actualizar la foto de perfil');
    }
  };

  const handleFileUpload = (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El tamaño de la imagen no puede exceder 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('fotoPerfil', file);

    const token = localStorage.getItem('token');
    
    axios.post(`/api/usuarios/${currentUser._id}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      }
    })
    .then(response => {
      // Actualizar el contexto del usuario con la nueva foto
      updateProfile({
        fotoPerfil: response.data.data.fotoPerfil,
        tipoFoto: response.data.data.tipoFoto
      });
      setShowAvatarModal(false);
      toast.success('Foto de perfil subida correctamente');
    })
    .catch(error => {
      console.error('Error al subir la foto:', error);
      toast.error('Error al subir la foto de perfil');
    })
    .finally(() => {
      setIsUploading(false);
      setUploadProgress(0);
    });
  };

  const getProfileImageUrl = () => {
  if (!currentUser || !currentUser.fotoPerfil) {
    return 'src/img/ProfilePred/perro.jpg'; // Imagen por defecto
  }

  // Si el usuario eligió una foto predeterminada
  if (currentUser.tipoFoto === 'predeterminada') {
    // Buscar la foto predeterminada en el array
    const avatarPredeterminado = avatarsPredeterminados.find(
      avatar => avatar.id === currentUser.fotoPerfil
    );
    return avatarPredeterminado ? avatarPredeterminado.src : 'src/img/ProfilePred/perro.jpg';
  }

  // Si el usuario subió una foto personalizada
  if (currentUser.tipoFoto === 'personalizada') {
    return `/uploads/profiles/${currentUser.fotoPerfil}`;
  }

  // Si por alguna razón no hay tipo de foto definido, usar imagen por defecto
  return 'src/img/ProfilePred/perro.jpg';
};

  // Componente de Modal para seleccionar o subir avatar
  const AvatarModal = () => {
    if (!showAvatarModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4 transform transition-all animate-modalShow">
          {/* Header */}
          <div className="bg-white px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  Foto de Perfil
                </h3>
                <p className="text-gray-500 text-sm">
                  Personaliza tu imagen de perfil
                </p>
              </div>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Upload Section */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Sube una foto
              </h4>
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                <PhotoUploadButton />
                <p className="text-sm text-gray-500 text-center mt-3">
                  Formato JPG, PNG o WEBP (Max. 5MB)
                </p>
                <UploadProgressBar />
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  O elige un avatar predeterminado
                </span>
              </div>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-5 gap-4">
              {avatarsPredeterminados.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarClick(avatar.id)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300
                    ${selectedAvatar === avatar.id 
                      ? 'ring-4 ring-[#FFD15C] ring-offset-2 scale-105' 
                      : 'hover:ring-2 hover:ring-[#FFD15C]/50 hover:ring-offset-2 hover:scale-105'
                    }`}
                >
                  <img 
                    src={avatar.src} 
                    alt={avatar.alt} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/90 rounded-full p-2">
                        <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-5 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar || isUploading}
              className="px-6 py-2.5 bg-[#FFD15C] text-white rounded-xl hover:bg-[#FFC132] transition-all 
                font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                transform hover:translate-y-[-1px] hover:shadow-lg active:translate-y-[1px]"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span>Guardar cambios</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
            

  // Componentes auxiliares
  const PhotoUploadButton = () => (
    <button
      type="button"
      onClick={() => fileInputRef.current.click()}
      className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      disabled={isUploading}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {isUploading ? 'Subiendo...' : 'Subir foto desde tu dispositivo'}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />
    </button>
  );

  const UploadProgressBar = () => {
    if (!isUploading) return null;
    
    return (
      <div className="w-full mt-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#FFD15C] bg-[#FFD15C]/20">
                Subiendo...
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-[#FFD15C]">
                {uploadProgress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#FFD15C]/20">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#FFD15C] transition-all duration-300"
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const ProfilePicture = () => (
    <div key={avatarKey} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300 p-8">
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FFD15C] mb-4">
            <img
              src={getProfileImageUrl()}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/avatars/default-avatar.png';
              }}
            />
          </div>
          <button
            onClick={() => setShowAvatarModal(true)}
            className="absolute bottom-4 right-0 bg-[#FFD15C] text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#FFC132]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900">
          {currentUser?.nombre} {currentUser?.apellido}
        </h3>
        <p className="text-gray-600 mb-4">{currentUser?.email}</p>
        
        <button
          onClick={() => setShowAvatarModal(true)}
          className="py-2 px-4 bg-[#FFD15C]/10 text-[#FFD15C] rounded-lg text-sm font-medium hover:bg-[#FFD15C]/20 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Cambiar foto
        </button>
      </div>
    </div>
  );

  const ResumenCuenta = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-8 transform hover:scale-[1.02] transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen de Cuenta</h3>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Pedidos realizados</span>
            <span className="text-2xl font-bold text-[#FFD15C]">{pedidosCount}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FFD15C] transition-all duration-1000"
              style={{ width: `${Math.min((pedidosCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <Link
          to="/pedidos"
          className="block text-center py-3 px-6 bg-[#FFD15C] text-white rounded-xl hover:bg-[#FFC132] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
          Ver historial de pedidos
        </Link>
      </div>
    </div>
  );

  const DireccionSection = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-12 h-12 bg-[#FFD15C]/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Dirección de Envío
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#FFD15C] hover:text-[#FFC132] transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {currentUser?.direccion?.calle ? (
          <div className="bg-gray-50 rounded-2xl p-6 animate-fadeIn">
            <p className="text-xl font-medium text-gray-900 mb-2">
              {currentUser.direccion.calle} {currentUser.direccion.numero}
            </p>
            <p className="text-gray-600">
              {currentUser.direccion.comuna}, {currentUser.direccion.ciudad}
            </p>
            <p className="text-gray-600">
              {currentUser.direccion.region}
              {currentUser.direccion.codigoPostal && 
                <span className="ml-2 text-gray-500">CP: {currentUser.direccion.codigoPostal}</span>
              }
            </p>
          </div>
        ) : (
          <div className="text-center py-12 animate-fadeIn">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 mb-4">No has añadido una dirección todavía</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#FFD15C] hover:text-[#FFC132] font-medium"
            >
              Agregar dirección
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mi Perfil
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-[#FFD15C] rounded-full"></div>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona tu información personal y preferencias de envío
          </p>
        </div>

        {/* Modal de foto de perfil */}
        <AvatarModal />

        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <Link
            to="/pedidos"
            className="group bg-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-[#FFD15C] group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="group bg-[#FFD15C] p-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="w-12 h-12 bg-[#FFD15C]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#FFD15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    Información Personal
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#FFD15C] hover:text-[#FFC132] transition-colors duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className={`form-input ${formErrors.nombre ? 'border-red-500' : ''}`}
                        />
                        {formErrors.nombre && <p className="form-error">{formErrors.nombre}</p>}
                      </div>

                      <div>
                        <label htmlFor="apellido" className="form-label">Apellido</label>
                        <input
                          type="text"
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          className={`form-input ${formErrors.apellido ? 'border-red-500' : ''}`}
                        />
                        {formErrors.apellido && <p className="form-error">{formErrors.apellido}</p>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div>
                        <label htmlFor="telefono" className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-4 mt-6">Dirección</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="direccion.calle" className="form-label">Calle</label>
                        <input
                          type="text"
                          id="direccion.calle"
                          name="direccion.calle"
                          value={formData.direccion.calle}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.calle'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.calle'] && <p className="form-error">{formErrors['direccion.calle']}</p>}
                      </div>

                      <div>
                        <label htmlFor="direccion.numero" className="form-label">Número</label>
                        <input
                          type="text"
                          id="direccion.numero"
                          name="direccion.numero"
                          value={formData.direccion.numero}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.numero'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.numero'] && <p className="form-error">{formErrors['direccion.numero']}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor="direccion.comuna" className="form-label">Comuna</label>
                        <input
                          type="text"
                          id="direccion.comuna"
                          name="direccion.comuna"
                          value={formData.direccion.comuna}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.comuna'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.comuna'] && <p className="form-error">{formErrors['direccion.comuna']}</p>}
                      </div>

                      <div>
                        <label htmlFor="direccion.ciudad" className="form-label">Ciudad</label>
                        <input
                          type="text"
                          id="direccion.ciudad"
                          name="direccion.ciudad"
                          value={formData.direccion.ciudad}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.ciudad'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.ciudad'] && <p className="form-error">{formErrors['direccion.ciudad']}</p>}
                      </div>

                      <div>
                        <label htmlFor="direccion.region" className="form-label">Región</label>
                        <input
                          type="text"
                          id="direccion.region"
                          name="direccion.region"
                          value={formData.direccion.region}
                          onChange={handleChange}
                          className={`form-input ${formErrors['direccion.region'] ? 'border-red-500' : ''}`}
                        />
                        {formErrors['direccion.region'] && <p className="form-error">{formErrors['direccion.region']}</p>}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div>
                        <label htmlFor="direccion.codigoPostal" className="form-label">Código Postal</label>
                        <input
                          type="text"
                          id="direccion.codigoPostal"
                          name="direccion.codigoPostal"
                          value={formData.direccion.codigoPostal}
                          onChange={handleChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </span>
                        ) : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <InfoCard 
                      label="Nombre Completo"
                      value={`${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`}
                      icon={<UserIcon />}
                    />
                    <InfoCard 
                      label="Email"
                      value={currentUser?.email}
                      icon={<EmailIcon />}
                    />
                    <InfoCard 
                      label="Teléfono"
                      value={currentUser?.telefono || 'No especificado'}
                      icon={<PhoneIcon />}
                    />
                    <InfoCard 
                      label="RUT"
                      value={currentUser?.rut || 'No especificado'}
                      icon={<IdIcon />}
                    />
                  </div>
                )}
              </div>
            </div>

            <DireccionSection />
          </div>

          {/* Panel Lateral */}
          <div className="lg:col-span-4 space-y-8">
            <ProfilePicture />
            <ResumenCuenta />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;