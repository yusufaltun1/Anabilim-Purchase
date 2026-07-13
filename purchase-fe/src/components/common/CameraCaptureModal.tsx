import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraCaptureModal = ({ isOpen, onClose, onCapture }: CameraCaptureModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (deviceId: string) => {
      stopStream();
      setLoading(true);
      setError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Bu tarayıcı kamera erişimini desteklemiyor.');
          return;
        }

        const videoConstraints: MediaTrackConstraints = deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoInputs);

        const activeId = stream.getVideoTracks()[0]?.getSettings().deviceId;
        if (activeId) {
          setSelectedDeviceId(activeId);
        } else if (videoInputs.length > 0 && !deviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch {
        setError('Kameraya erişilemedi. Tarayıcı iznini kontrol edin veya harici kameranın bağlı olduğundan emin olun.');
      } finally {
        setLoading(false);
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setError(null);
      setDevices([]);
      setSelectedDeviceId('');
      return;
    }
    void startCamera('');
  }, [isOpen, startCamera, stopStream]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    void startCamera(deviceId);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setError('Kamera görüntüsü hazır değil.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Fotoğraf işlenemedi.');
      return;
    }
    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Kameradan fotoğraf çek</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {devices.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kamera seçin</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId || `cam-${index}`} value={device.deviceId}>
                    {device.label || `Kamera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
                Kamera açılıyor…
              </div>
            )}
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleCapture}
              disabled={loading || !!error}
              className="flex-1 rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Fotoğrafı kullan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
