import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Send, Loader2, Sparkles, RefreshCw, StopCircle, X } from 'lucide-react';

const SkincareAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const abortControllerRef = useRef(null);

  const translations = {
    ar: {
      title: 'استشارة AI للعناية بالبشرة',
      subtitle: 'حلل بشرتك واحصل على نصائح مخصصة',
      uploadImage: 'ارفع صورة',
      takePicture: 'التقط صورة',
      placeholder: 'اكتب سؤالك هنا...',
      send: 'إرسال',
      analyzing: 'جاري التحليل...',
      streaming: 'جاري الكتابة...',
      stopStream: 'إيقاف',
      reset: 'محادثة جديدة',
      welcome: 'مرحباً! أنا مساعد AI للعناية بالبشرة. ارفع صورة وجهك أو اسألني عن أي مشكلة بشرتك.',
      capture: 'التقاط',
      cancel: 'إلغاء',
      cameraError: 'تعذر الوصول إلى الكاميرا'
    },
    fr: {
      title: 'Consultation AI pour Soins de la Peau',
      subtitle: 'Analysez votre peau et obtenez des conseils personnalisés',
      uploadImage: 'Télécharger',
      takePicture: 'Prendre photo',
      placeholder: 'Écrivez votre question ici...',
      send: 'Envoyer',
      analyzing: 'Analyse...',
      streaming: 'Écriture...',
      stopStream: 'Arrêter',
      reset: 'Nouveau chat',
      welcome: 'Bonjour! Je suis votre assistant AI pour les soins de la peau. Téléchargez une photo de votre visage ou posez-moi une question.',
      capture: 'Capturer',
      cancel: 'Annuler',
      cameraError: 'Impossible d\'accéder à la caméra'
    },
    en: {
      title: 'AI Skincare Consultation',
      subtitle: 'Analyze your skin and get personalized advice',
      uploadImage: 'Upload',
      takePicture: 'Take Photo',
      placeholder: 'Type your question here...',
      send: 'Send',
      analyzing: 'Analyzing...',
      streaming: 'Typing...',
      stopStream: 'Stop',
      reset: 'New Chat',
      welcome: 'Hello! I\'m your AI skincare assistant. Upload a face photo or ask me about any skin concerns.',
      capture: 'Capture',
      cancel: 'Cancel',
      cameraError: 'Cannot access camera'
    }
  };

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('skincare_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      window.localStorage.setItem('skincare_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert(t.cameraError);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        closeCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!inputText.trim() && !selectedImage) return;
    if (isLoading || isStreaming) return;
    if (!userId) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      image: imagePreview,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const currentText = inputText;
    setInputText('');

    try {
      const formData = new FormData();
      formData.append('text', currentText);
      formData.append('language', language);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch('http://localhost:3000/ai/chat?userId=' + encodeURIComponent(userId), {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        console.log(response)
        throw new Error('HTTP error! status: ' + response.status);
      }

      const aiMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, {
        type: 'ai',
        text: '',
        timestamp: new Date().toISOString()
      }]);

      setIsLoading(false);
      setIsStreaming(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No reader available');
      }

      let aiResponse = '';

      while (true) {
        const result = await reader.read();
        
        if (result.done) {
          console.log('Stream complete');
          break;
        }
        
        const chunk = decoder.decode(result.value, { stream: true });
        aiResponse += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.type === 'ai') {
            newMessages[newMessages.length - 1].text = aiResponse;
          }
          return newMessages;
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream stopped by user');
      } else {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          type: 'ai',
          text: language === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 
                language === 'fr' ? 'Désolé, une erreur s\'est produite. Réessayez.' :
                'Sorry, an error occurred. Please try again.',
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      setSelectedImage(null);
      setImagePreview(null);
      abortControllerRef.current = null;
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    stopStreaming();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-white to-pink-50">
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={captureImage}
                className="flex-1 py-3 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all"
              >
                {t.capture}
              </button>
              <button
                onClick={closeCamera}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border-b border-rose-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
              <p className="text-sm text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              disabled={isLoading || isStreaming}
            >
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
            
            <button
              onClick={resetChat}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t.reset}
              disabled={isLoading || isStreaming}
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden" style={{ height: '70vh' }}>
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-linear-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-600 leading-relaxed">{t.welcome}</p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={'flex ' + (msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-lg rounded-2xl p-4 shadow-sm ' + (msg.type === 'user' ? 'bg-linear-to-br from-rose-500 to-pink-600 text-white' : 'bg-gray-100 text-gray-800')}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="rounded-lg mb-2 max-w-xs" />
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                    {msg.type === 'ai' && idx === messages.length - 1 && isStreaming && (
                      <span className="inline-block w-2 h-4 bg-gray-600 ml-1 animate-pulse"></span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    <span className="text-gray-600">{t.analyzing}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-4">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  disabled={isLoading || isStreaming}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <button
                onClick={openCamera}
                disabled={isLoading || isStreaming}
                className="p-3 bg-linear-to-br from-blue-400 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.takePicture}
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isStreaming}
                className="p-3 bg-linear-to-br from-rose-400 to-pink-500 text-white rounded-xl hover:from-rose-500 hover:to-pink-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.uploadImage}
              >
                <Upload className="w-5 h-5" />
              </button>

              {isStreaming ? (
                <div className="flex-1 px-4 py-3 border border-rose-300 bg-rose-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    <span className="text-rose-700 font-medium">{t.streaming}</span>
                  </div>
                  <button
                    onClick={stopStreaming}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <StopCircle className="w-4 h-4" />
                    {t.stopStream}
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={isLoading ? t.analyzing : t.placeholder}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-50 disabled:text-gray-500"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  disabled={isLoading}
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || isStreaming || (!inputText.trim() && !selectedImage)}
                className="p-3 bg-linear-to-br from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading && !isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkincareAI;