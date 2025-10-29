import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import './BarcodeScanner.css'

function BarcodeScanner({ onScan, onClose }) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef(null)
  const html5QrcodeScannerRef = useRef(null)

  useEffect(() => {
    // Prevenir scroll en el body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (isScanning) {
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        startScanner()
      }, 100)
    }

    return () => {
      stopScanner()
    }
  }, [isScanning])

  const startScanner = () => {
    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        // Solo QR_CODE y CODE_128 (máximo 2 permitidos)
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ],
        videoConstraints: {
          facingMode: "environment" // Cámara trasera
        }
      }

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "barcode-scanner-container",
        config,
        false
      )

      html5QrcodeScannerRef.current.render(
        (decodedText) => {
          console.log('🔍 Código escaneado:', decodedText)
          onScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Solo capturar errores críticos
          if (errorMessage && typeof errorMessage === 'string') {
            if (errorMessage.includes('NotAllowedError') || 
                errorMessage.includes('PermissionDenied') ||
                errorMessage.includes('NotFoundError')) {
              setError('⚠️ No se puede acceder a la cámara. Verifica los permisos.')
            }
          }
        }
      )
    } catch (err) {
      console.error('Error al iniciar escáner:', err)
      setError('❌ Error al inicializar el escáner. Intenta de nuevo.')
    }
  }

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch((err) => {
        console.error('Error al detener el escáner:', err)
      })
      html5QrcodeScannerRef.current = null
    }
  }

  const handleStartScanning = async () => {
    setError('')
    setIsScanning(true)
  }

  const handleClose = () => {
    stopScanner()
    setIsScanning(false)
    onClose()
  }

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        {/* Header */}
        <div className="scanner-header">
          <h2>📷 Escanear Código de Barras</h2>
          <button className="scanner-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="scanner-body">
          {!isScanning ? (
            <div className="scanner-start">
              <div className="scanner-icon">📦</div>
              <h3>Escanea el código del producto</h3>
              <p>Usa la cámara de tu dispositivo para escanear códigos de barras o QR</p>
              
              <div className="scanner-instructions">
                <div className="instruction-item">
                  <span className="instruction-icon">📱</span>
                  <span>Permite el acceso a la cámara</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span>Centra el código en el recuadro</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">✨</span>
                  <span>Mantén buena iluminación</span>
                </div>
              </div>

              <button className="btn-start-scan" onClick={handleStartScanning}>
                🎥 Iniciar Escaneo
              </button>
            </div>
          ) : (
            <div className="scanner-active">
              <div id="barcode-scanner-container"></div>
              
              <div className="scanner-tips">
                <p>💡 <strong>Tip:</strong> Mantén el código a 10-20 cm de la cámara</p>
              </div>
            </div>
          )}

          {error && (
            <div className="scanner-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="scanner-footer">
          <button className="btn-cancel" onClick={handleClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default BarcodeScanner
