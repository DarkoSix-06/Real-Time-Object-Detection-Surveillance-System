import React, { useEffect, useRef, useState } from "react";
import { Camera, Eye, Activity, AlertCircle, Monitor, Cpu, Signal } from "lucide-react";

export default function WebcamDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Start webcam
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setIsConnected(true);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("CAMERA_ACCESS_DENIED");
      });
  }, []);

  // Capture frames every 500ms and send to backend
  useEffect(() => {
    let frameCount = 0;
    const startTime = Date.now();
    
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "frame.jpg");

        try {
          const response = await fetch("http://localhost:8000/detect", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          setDetections(data.detections);
          
          // Calculate FPS
          frameCount++;
          const elapsed = (Date.now() - startTime) / 1000;
          setFps(Math.round(frameCount / elapsed));
          
          setError(null);
        } catch (e) {
          console.error(e);
          setError("AI_SERVICE_OFFLINE");
        }
      }, "image/jpeg");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Draw boxes on canvas
  useEffect(() => {
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      detections.forEach(({ label, confidence, box }) => {
        const [x1, y1, x2, y2] = box;

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = "lime";
        ctx.font = "18px Arial";
        ctx.fillText(`${label} ${confidence.toFixed(1)}%`, x1 + 5, y1 + 25);
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [detections]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 font-mono text-sm">
      {/* Top Control Bar */}
      <div className="bg-black border-b-2 border-green-500 px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">SURVEILLANCE SYSTEM v2.1</span>
            </div>
            <div className="text-gray-300">
              STATION-01 | CAM-FEED-PRIMARY
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-green-400">
            <div>{formatDate(currentTime)}</div>
            <div className="text-xl font-bold">{formatTime(currentTime)}</div>
            <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <Signal className="w-4 h-4" />
              <span>{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Main Video Feed */}
        <div className="flex-1 p-4">
          <div className="bg-black border border-green-500 h-full relative">
            {/* Video Header */}
            <div className="bg-green-500 text-black px-3 py-1 text-xs font-bold">
              LIVE FEED - YOLO DETECTION ACTIVE
            </div>
            
            {/* Video Container */}
            <div className="relative h-[calc(100%-28px)] bg-gray-800">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 2 }}
              />
              
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-red-400">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-bold">CAMERA OFFLINE</p>
                    <p className="text-sm">SYSTEM INITIALIZATION...</p>
                  </div>
                </div>
              )}

              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-80 border border-green-500 p-2 text-green-400 text-xs">
                <div>REC ● {formatTime(currentTime)}</div>
                <div>FPS: {fps} | DETECTIONS: {detections.length}</div>
                <div>RES: 640x480 | MODE: AUTO</div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'} border-2 border-black`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Detection Data */}
        <div className="w-80 bg-gray-800 border-l-2 border-green-500">
          {/* System Status */}
          <div className="bg-black border-b border-green-500 p-3">
            <div className="text-green-400 font-bold mb-2 flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              SYSTEM STATUS
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">AI ENGINE:</span>
                <span className={error ? 'text-red-400' : 'text-green-400'}>
                  {error ? 'ERROR' : 'ACTIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">PROCESSING:</span>
                <span className="text-green-400">{fps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">OBJECTS:</span>
                <span className="text-green-400">{detections.length}</span>
              </div>
              {error && (
                <div className="text-red-400 text-xs mt-2 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Detection Log */}
          <div className="bg-black border-b border-green-500 p-3">
            <div className="text-green-400 font-bold mb-2 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              DETECTION LOG
            </div>
          </div>

          {/* Detection Results */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            {detections.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-500 text-xs">
                  NO OBJECTS DETECTED<br/>
                  MONITORING...
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {detections.map(({ label, confidence, cropped_img }, idx) => (
                  <div key={idx} className="bg-black border border-gray-600 p-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-700 border border-gray-600 overflow-hidden">
                        <img
                          src={`data:image/jpeg;base64,${cropped_img}`}
                          alt={label}
                          className="w-full h-full object-cover"
                          onError={e => e.target.style.display = 'none'}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-green-400 text-xs font-bold uppercase">
                          {label}
                        </div>
                        <div className="text-gray-300 text-xs">
                          CONF: {confidence.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatTime(currentTime)}
                        </div>
                        
                        {/* Confidence bar */}
                        <div className="w-full bg-gray-700 h-1 mt-1">
                          <div 
                            className="bg-green-500 h-1 transition-all duration-300"
                            style={{ width: `${confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Status */}
          <div className="bg-black border-t border-green-500 p-2 text-xs">
            <div className="text-green-400">
              YOLO v8 | NEURAL NETWORK ACTIVE
            </div>
            <div className="text-gray-500">
              © 2025 SURVEILLANCE SYS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}