/**
 * WebGL görüntü işleme hook'u.
 * Canvas'a bağlanır, ham görüntüyü WebGL texture olarak yükler ve
 * ayarlar değiştikçe gerçek zamanlı render yapar.
 */

import { useEffect, useRef, useCallback } from 'react';
import { WebGLRenderer } from '../engine/webglRenderer';

/**
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {string|null} rawImageUrl - Base64 veya blob URL
 * @param {object} settings - Tüm düzenleme ayarları
 */
export function useImageProcessor(canvasRef, rawImageUrl, settings) {
  const rendererRef = useRef(null);
  const imageLoadedRef = useRef(false);

  // WebGL context oluştur
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = new WebGLRenderer(canvas);
    } catch (err) {
      console.error('WebGL başlatılamadı:', err);
    }

    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef]);

  // Görüntü yükle (URL değiştiğinde)
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !rawImageUrl) {
      imageLoadedRef.current = false;
      return;
    }

    imageLoadedRef.current = false;
    renderer
      .loadImage(rawImageUrl)
      .then(() => {
        imageLoadedRef.current = true;
        renderer.updateSettings(settings);
        renderer.render();
      })
      .catch((err) => {
        console.error('Görüntü yüklenemedi:', err);
      });
    // settings'i dependency'den çıkarıyoruz çünkü
    // sadece URL değiştiğinde yükleme yapılmalı
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawImageUrl]);

  // Ayarlar değiştiğinde yeniden render
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !imageLoadedRef.current) return;

    renderer.updateSettings(settings);
    renderer.render();
  }, [settings]);

  return rendererRef;
}
