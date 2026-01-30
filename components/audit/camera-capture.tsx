"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClear: () => void;
  capturedImage: string | null;
  isAnalyzing: boolean;
  frameGuide?: "plate" | "person" | "area";
}

export function CameraCapture({
  onCapture,
  onClear,
  capturedImage,
  isAnalyzing,
  frameGuide = "area",
}: CameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startCamera = React.useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsStreaming(true);
                setIsLoading(false);
              })
              .catch(() => {
                setError("Erro ao iniciar o video. Tente novamente.");
                setIsLoading(false);
              });
          }
        };
      }
    } catch {
      setError("Nao foi possivel acessar a camera. Permita o acesso a camera ou carregue uma imagem.");
      setIsLoading(false);
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(imageData);
    stopCamera();
  }, [onCapture, stopCamera]);

  const handleFileUpload = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
        stopCamera();
      };
      reader.readAsDataURL(file);
    },
    [onCapture, stopCamera]
  );

  const handleRetake = React.useCallback(() => {
    onClear();
    startCamera();
  }, [onClear, startCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const frameGuideStyles = {
    plate: "aspect-square max-w-[280px] rounded-full",
    person: "aspect-[3/4] max-w-[200px] rounded-2xl",
    area: "aspect-video max-w-[400px] rounded-lg",
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
        {capturedImage ? (
          <div className="relative aspect-video">
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured"
              className="h-full w-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium">Analisando...</span>
                </div>
              </div>
            )}
          </div>
        ) : (isStreaming || isLoading) ? (
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "h-full w-full object-cover",
                isLoading && "opacity-0"
              )}
            />
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm font-medium text-white">Iniciando camera...</span>
                </div>
              </div>
            )}
            {/* Frame Guide Overlay */}
            {isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={cn(
                    "border-2 border-dashed border-primary/60",
                    frameGuideStyles[frameGuide]
                  )}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-4 p-8">
            {error ? (
              <p className="text-center text-sm text-destructive">{error}</p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Inicie a camera ou carregue uma imagem para comecar a analise
              </p>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex flex-wrap gap-2">
        {capturedImage ? (
          <Button
            onClick={handleRetake}
            variant="outline"
            disabled={isAnalyzing}
            className="flex-1 bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Refazer
          </Button>
        ) : (isStreaming || isLoading) ? (
          <>
            <Button onClick={capturePhoto} className="flex-1" disabled={isLoading}>
              <Camera className="mr-2 h-4 w-4" />
              Capturar
            </Button>
            <Button onClick={stopCamera} variant="outline" disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={startCamera} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Camera
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Carregar Imagem
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
