import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Carousel3DProps {
  children: React.ReactNode[];
  slidesToShow?: number;
  showDots?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  rtl?: boolean;
  gap?: number;
}

const Carousel3D: React.FC<Carousel3DProps> = ({
  children,
  slidesToShow = 3,
  showDots = true,
  showArrows = true,
  autoplay = false,
  rtl = true,
  gap = 30
}) => {
  return (
    <div className="carousel-3d-container">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={slidesToShow}
        loop={true}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={showDots ? {
          clickable: true,
          dynamicBullets: true,
        } : false}
        navigation={showArrows}
        autoplay={autoplay ? {
          delay: 3000,
          disableOnInteraction: false,
        } : false}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="swiper-3d"
        dir={rtl ? 'rtl' : 'ltr'}
        spaceBetween={gap}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: slidesToShow,
            spaceBetween: gap,
          },
        }}
      >
        {children.map((child, index) => (
          <SwiperSlide key={index} className="swiper-slide-3d">
            {child}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel3D;