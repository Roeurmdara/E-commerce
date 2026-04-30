"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const slides = [
  {
    id: 1,
    title: "SALE",
    discount: "20%",
    image: "https://i.pinimg.com/736x/96/80/08/9680082add481ac3729f31fc108a5678.jpg", // replace with your image
  },
  {
    id: 2,
    title: "WINTER SALE",
    discount: "30%",
    image: "https://i.pinimg.com/1200x/4f/d9/6e/4fd96e9abc0abee3b37c0286225a2fb8.jpg",
  },
  {
    id: 3,
    title: "FASHION DEALS",
    discount: "50%",
    image: "https://i.pinimg.com/1200x/d6/d9/65/d6d965b8678cc65a96021c61ac824e3a.jpg",
  },
]

export default function PromoSlider() {
  const [current, setCurrent] = useState(0)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full ">
      <div className="relative max-w-8xl mx-auto overflow-hidden rounded-none">

        {/* SLIDES */}
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-[520px] relative flex items-center"
            >
              {/* Background image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
              />

              {/* Dark overlay */}
           

              {/* Content */}
              <div className="relative z-10 w-full flex items-center justify-between px-10 text-white">
                <h2 className="text-5xl font-bold tracking-wide">
                  {slide.title}
                </h2>

                <div className="text-6xl font-extrabold">
                  {slide.discount}
                </div>
              </div>
            </div>
          ))}
        </div>

      

       

        {/* DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
  {slides.map((_, idx) => (
    <button
      key={idx}
      onClick={() => setCurrent(idx)}
      className={`h-1.5  transition-all duration-300 ${
        current === idx
          ? "w-6 bg-white"
          : "w-2.5 bg-white/40 hover:bg-white/70"
      }`}
    />
  ))}
</div>
      </div>
    </section>
  )
}