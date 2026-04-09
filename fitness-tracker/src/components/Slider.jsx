import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: "Set Your Goals",
    desc: "Start strong by setting clear fitness goals that push you to become the best version of yourself.",
    img: "https://images.unsplash.com/photo-1605296867724-fa87a8ef53fd?q=80&w=870&auto=format&fit=crop",
  },
  {
    title: "Track Progress",
    desc: "Every rep, every step, every healthy meal — track it all and see how far you've come.",
    img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1500&q=80",
  },
  {
    title: "Stay Motivated",
    desc: "Surround yourself with purpose, stay consistent, and let your dedication rewrite your story.",
    img: "https://images.unsplash.com/photo-1579364046732-c21c2177730d?q=80&w=870&auto=format&fit=crop",
  },
];

export default function Slider() {
  return (
    <section id="slider" className="mt-3">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        effect="fade"
        loop
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative h-[80vh] bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: `url(${slide.img})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/55" />

              {/* Text content */}
              <div className="relative z-10 text-center text-white px-6 max-w-3xl animate-[fadeUp_0.6s_ease]">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[var(--primary-300)]">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                  {slide.desc}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
