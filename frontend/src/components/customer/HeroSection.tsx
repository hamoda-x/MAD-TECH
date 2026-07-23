"use client";

import Link from "next/link";
import Image from "next/image";
import { useDirectionStore } from "@/store/directionStore";
import { useThemeStore } from "@/store/themeStore";

export default function HeroSection() {
  const { isRtl } = useDirectionStore();
  const { isDark } = useThemeStore();

  return (
    <section className={`relative min-h-[520px] overflow-hidden ${
      isDark ? "bg-[#0d0d14]" : "bg-gray-100"
    }`}>
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Gaming PC Setup"
          fill
          className="object-cover"
          priority
        />
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/90 via-[#0d0d14]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14]/70 via-transparent to-[#0d0d14]/30" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/30" />
          </>
        )}
      </div>

      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 sm:px-6">
        <div className="max-w-2xl py-16 sm:py-24">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-mad-accent/30 bg-mad-accent/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-mad-accent" />
            <span className="text-sm font-medium text-mad-accent">
              {isRtl ? "تقنية الجيل القادم" : "NEXT-GEN TECH"}
            </span>
          </div>

          <h1 className={`text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl font-ethnocentric ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {isRtl ? (
              <>
                قم ببناء
                <br />
                <span className="text-glow text-mad-accent">جهازك المثالي</span>
              </>
            ) : (
              <>
                Build Your
                <br />
                <span className="text-glow text-mad-accent">Ultimate Rig</span>
              </>
            )}
          </h1>

          <p className={`mt-6 max-w-lg text-lg ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            {isRtl
              ? "قطع PC مميزة مختارة بعناية لتحقيق أقصى أداء."
              : "Premium PC components curated for peak performance."}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#featured"
              className="inline-flex items-center gap-2 rounded-lg bg-mad-accent px-6 py-3 font-semibold text-white transition-all hover:bg-mad-accent-light accent-glow"
            >
              {isRtl ? "تسوق الآن" : "Explore Now"}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>

            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
