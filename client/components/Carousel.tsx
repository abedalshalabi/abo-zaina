import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  children: React.ReactNode[]
  slidesToShow?: {
    mobile: number
    tablet: number
    desktop: number
  }
  showDots?: boolean
  showArrows?: boolean
  autoplay?: boolean
  rtl?: boolean
  gap?: number
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  slidesToShow = { mobile: 3, tablet: 5, desktop: 6 },
  showDots = true,
  showArrows = true,
  autoplay = false,
  rtl = true,
  gap = 8
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    direction: rtl ? 'rtl' : 'ltr',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    align: 'start'
  })
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onInit, onSelect])

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi || !autoplay || isHovered) return

    const autoplayInterval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0)
      }
    }, 4000)

    return () => clearInterval(autoplayInterval)
  }, [emblaApi, autoplay, isHovered])

  // Calculate slide width based on screen size
  const getSlideWidth = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 768) return `${100 / slidesToShow.mobile}%`
      if (width < 1024) return `${100 / slidesToShow.tablet}%`
      return `${100 / slidesToShow.desktop}%`
    }
    return `${100 / slidesToShow.desktop}%`
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hidden md:flex items-center justify-center ${
              !canScrollNext ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
            }`}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="الشريحة التالية"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-200 hidden md:flex items-center justify-center ${
              !canScrollPrev ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
            }`}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="الشريحة السابقة"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </>
      )}

      {/* Mobile Swipe Indicator */}
      <div className="md:hidden text-center mb-2 sm:mb-4">
        <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
          <span className="text-sm sm:text-base">👆</span>
          <span>اسحب لليمين أو اليسار</span>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing embla" ref={emblaRef}>
        <div className="flex embla__container w-full" style={{ marginLeft: `-${gap / 2}px`, marginRight: `-${gap / 2}px` }}>
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 touch-pan-y embla__slide w-full"
              style={{
                flex: `0 0 ${getSlideWidth()}`,
                minWidth: 0,
                paddingLeft: `${gap / 2}px`,
                paddingRight: `${gap / 2}px`
              }}
            >
              <div className="w-full h-full">
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar for Mobile */}
      <div className="md:hidden mt-2 sm:mt-4 mx-4 bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${((selectedIndex + 1) / scrollSnaps.length) * 100}%` 
          }}
        />
      </div>

      {/* Dots Navigation */}
      {showDots && scrollSnaps.length > 1 && (
        <div className="hidden md:flex justify-center absolute bottom-4 left-1/2 transform -translate-x-1/2 gap-2 z-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-200 ${
                index === selectedIndex 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-white/80 hover:bg-white shadow-sm'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`الانتقال للشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter for Mobile */}
      <div className="md:hidden text-center mt-2 sm:mt-3">
        <span className="text-xs sm:text-sm text-gray-500">
          {selectedIndex + 1} من {scrollSnaps.length}
        </span>
      </div>
    </div>
  )
}

export default Carousel
