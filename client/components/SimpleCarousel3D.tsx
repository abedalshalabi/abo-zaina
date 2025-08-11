import React, { useState, useEffect, useRef } from 'react';

interface SimpleCarousel3DProps {
  children: React.ReactNode[];
  autoplay?: boolean;
  rtl?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
}

const SimpleCarousel3D: React.FC<SimpleCarousel3DProps> = ({
  children,
  autoplay = false,
  rtl = false,
  showNavigation = true,
  showPagination = true,
}) => {
  // بدء السلايدر من المنتصف
  const [currentIndex, setCurrentIndex] = useState(Math.floor(children.length / 2));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (autoplay && children.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, autoplay, children.length]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % children.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // معالجة أحداث اللمس
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      rtl ? prevSlide() : nextSlide();
    }
    if (isRightSwipe) {
      rtl ? nextSlide() : prevSlide();
    }

    // إعادة تعيين القيم
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const getSlideStyle = (index: number) => {
    const diff = index - currentIndex;
    const totalSlides = children.length;
    
    // تحديد أحجام responsive
    const isMobile = windowWidth <= 768;
    const isSmallMobile = windowWidth <= 480;
    
    const slideWidth = isSmallMobile ? 200 : isMobile ? 250 : 280;
    const spacing = isSmallMobile ? 30 : isMobile ? 40 : 50;
    
    // حساب الموضع الأفقي لكل شريحة
    let translateX = diff * (slideWidth + spacing);
    
    // إذا كان RTL، نعكس الاتجاه
    if (rtl) {
      translateX = -translateX;
    }
    
    let opacity = 1;
    let scale = 1;
    let rotateY = 0;
    let translateZ = 0;
    let zIndex = 10;
    
    if (diff === 0) {
      // الشريحة النشطة - في المقدمة
      opacity = 1;
      scale = 1.1;
      rotateY = 0;
      translateZ = 100;
      zIndex = 20;
    } else if (diff === 1 || (diff === -(totalSlides - 1))) {
      // الشريحة اليمنى
      opacity = 0.8;
      scale = 0.9;
      rotateY = rtl ? 25 : -25;
      translateZ = -50;
      zIndex = 15;
    } else if (diff === -1 || (diff === totalSlides - 1)) {
      // الشريحة اليسرى
      opacity = 0.8;
      scale = 0.9;
      rotateY = rtl ? -25 : 25;
      translateZ = -50;
      zIndex = 15;
    } else if (Math.abs(diff) === 2) {
      // الشرائح الثانوية
      opacity = 0.6;
      scale = 0.8;
      rotateY = diff > 0 ? (rtl ? 45 : -45) : (rtl ? -45 : 45);
      translateZ = -100;
      zIndex = 10;
    } else {
      // الشرائح البعيدة
      opacity = 0.3;
      scale = 0.7;
      rotateY = diff > 0 ? (rtl ? 60 : -60) : (rtl ? -60 : 60);
      translateZ = -150;
      zIndex = 5;
    }
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      transition: isTransitioning ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    };
  };

  if (!children || children.length === 0) {
    return <div>لا توجد عناصر للعرض</div>;
  }

  return (
    <div 
      className="relative w-full h-96 overflow-hidden" 
      style={{ perspective: '1200px', perspectiveOrigin: 'center center' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        {children.map((child, index) => {
          const isMobile = windowWidth <= 768;
          const isSmallMobile = windowWidth <= 480;
          
          const slideWidth = isSmallMobile ? 200 : isMobile ? 250 : 280;
          const slideHeight = isSmallMobile ? 240 : isMobile ? 300 : 320;
          
          return (
          <div
            key={index}
            className="absolute cursor-pointer"
            style={{
               ...getSlideStyle(index),
               width: `${slideWidth}px`,
               height: `${slideHeight}px`,
               left: '50%',
               top: '50%',
               marginLeft: `-${slideWidth / 2}px`,
               marginTop: `-${slideHeight / 2}px`,
               transformOrigin: 'center center',
             }}
            onClick={() => goToSlide(index)}
          >
            <div className="w-full h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300" style={{ backfaceVisibility: 'hidden' }}>
              {child}
            </div>
          </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showPagination && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleCarousel3D;