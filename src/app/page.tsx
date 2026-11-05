"use client";
import MaxWdithWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
// import Mask from "@/components/Mask";
import React from "react";
import Autoplay from "embla-carousel-autoplay";

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnFocusin: false })
  );

  return (
    <>
      <div className="min-h-screen overflow-auto relative overflow-x-hidden overflow-y-hidden">
        {/* </div> */}
        {/* Top-right blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible left-[45dvw] sm:left-[70dvw] lg:left-[75dvw] blur-4xl md:blur-5xl"
          // initial={{ y: 0, x: 0 }}
          animate={{
            y: ["0dvh", "45dvh", "100dvh", "0dvh"],
            x: ["0dvw", "5dvw", "-50dvw", "0dvw"],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            // width="712"
            // height="834"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 712 834"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M471.294 1.1718C554.234 6.0053 644.653 38.0039 689.851 107.714C733.756 175.431 699.267 263.378 693.493 343.876C688.98 406.796 678.15 465.025 659.892 525.407C635.967 604.533 633.781 696.931 570.616 750.255C501.059 808.974 394.278 859.272 313.031 818.224C228.288 775.41 260.42 638.163 201.457 563.747C150.822 499.84 26.8125 507.368 4.57708 428.923C-17.1781 352.172 56.069 281.655 103.268 217.341C144.862 160.664 198.127 118.197 258.746 82.5907C325.806 43.2012 393.653 -3.3529 471.294 1.1718Z"
              fill="#CB80FF"
            />
          </svg>
        </motion.div>

        {/* Top-middle blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible left-[15dvw] sm:left-[35dvw] xl:left-[42dvw] blur-4xl md:blur-5xl"
          // initial={{ translateX: "0", translateY: "0" }}
          animate={{
            y: ["0dvh", "85dvh", "65dvh", "0dvh"],
            x: ["0dvw", "-35dvw", "50dvw", "0dvw"],
            rotate: [0, -40.64, -2, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            // width="1150"
            // height="927"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 1150 927"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300 min-w-full min-h-auto"
          >
            <path
              // fill-rule="evenodd"
              clipRule="evenodd"
              d="M568.738 52.996C631.747 85.7131 658.181 160.324 710.518 208.279C747.251 241.936 784.684 275.282 831.108 293.395C929.659 331.846 1072.16 287.817 1134.08 373.536C1183.88 442.469 1104.6 540.818 1063.72 615.379C1027.88 680.745 966.31 724.708 912.983 776.817C865.083 823.624 826.32 883.011 764.193 908.065C702.962 932.757 632.923 931.121 568.738 915.638C509.645 901.383 467.93 851.612 413.995 823.586C361.813 796.473 308.222 777.405 254.915 752.573C169.175 712.633 24.1263 723.659 2.11497 631.72C-19.7593 540.354 134.356 497.759 173.455 412.324C202.608 348.623 171.046 271.258 196.88 206.142C226.355 131.851 258.384 42.3543 332.323 11.9031C407.216 -18.9408 496.859 15.673 568.738 52.996Z"
              fill="#241b35"
            />
          </svg>
        </motion.div>

        {/* Top-left blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible right-[35dvw] sm:right-[66dvw] lg:right-[75dvw] blur-4xl md:blur-5xl"
          // initial={{ translateX: "0", translateY: "0" }}
          animate={{
            // y: ["0vh", "100vh", "100vh", "0vh"],
            // x: ["0vw", "0vw", "100vw", "0vw"],
            y: ["0dvh", "35dvh", "3dvh", "0dvh"],
            x: ["0dvw", "-15dvw", "65dvw", "0dvw"],
            rotate: [0, -7.93, -17.32, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 681 702"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300 min-w-full min-h-auto"
          >
            <path
              // fill-rule="evenodd"
              clipRule="evenodd"
              d="M467.509 10.6547C515.559 36.5984 516.644 107.704 554.359 147.21C589.341 183.853 664.1 182.976 678.432 231.593C693.237 281.811 627.549 323.989 621.823 376.046C616.346 425.85 651.05 472.498 646.449 522.391C640.725 584.467 651.966 681.823 592.054 698.882C519.545 719.528 468.239 611.569 394.949 594.001C354.892 584.399 317.019 616.11 276.437 623.225C212.977 634.351 145.632 675.054 87.1925 647.96C33.5587 623.094 3.84511 554.573 0.885791 495.472C-2.10113 435.82 52.7166 389.914 71.431 333.187C85.4804 290.601 88.0686 246.768 97.4037 202.906C110.149 143.02 90.9721 66.3974 136.839 25.8647C180.71 -12.9051 251.387 17.8694 309.832 15.1811C363.024 12.7344 420.658 -14.6418 467.509 10.6547Z"
              fill="#CB80FF"
            />
          </svg>
        </motion.div>

        {/* Bottom-left corner blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible right-[35dvw] sm:right-[66dvw] lg:right-[75dvw] top-[75dvh] blur-4xl md:blur-5xl"
          // initial={{ translateX: "0", translateY: "0" }}
          animate={{
            // y: ["0vh", "100vh", "100vh", "0vh"],
            // x: ["0vw", "0vw", "100vw", "0vw"],
            y: ["0dvh", "-85dvh", "-75dvh", "0dvh"],
            x: ["0dvw", "35dvw", "-10dvw", "0dvw"],
            // rotate: [0, -7.93, -17.32, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 832 700"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300 min-w-full min-h-auto"
          >
            <path
              // fill-rule="evenodd"
              clipRule="evenodd"
              d="M335.718 19.1903C440.411 7.40601 550.694 -23.7697 639.436 33.0065C744.402 100.162 833.245 212.1 831.987 336.695C830.735 460.674 733.755 561.538 633.366 634.314C548.061 696.156 441.082 695.68 335.718 696.462C229.144 697.254 102.508 720.078 33.6157 638.768C-34.0558 558.898 19.4576 440.747 30.898 336.695C40.3727 250.521 33.4192 157.002 93.4613 94.4617C154.338 31.0516 248.363 29.023 335.718 19.1903Z"
              fill="#FFC7FF"
            />
          </svg>
        </motion.div>

        {/* Bottom-middle blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible left-[15dvw] sm:left-[35dvw] xl:left-[42dvw] top-[75dvh] blur-4xl md:blur-5xl"
          // initial={{ translateX: "0", translateY: "0" }}
          animate={{
            y: ["0dvh", "8dvh", "-5dvh", "0dvh"],
            x: ["0dvw", "35dvw", "-35dvw", "0dvw"],
            rotate: [0, 7.05, -9, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            // width="922"
            // height="861"
            viewBox="0 0 922 861"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300 min-w-full min-h-auto"
          >
            <path
              // fill-rule="evenodd"
              clipRule="evenodd"
              d="M517.552 3.74373C600.454 12.3211 713.308 12.2134 747.489 88.2461C786.327 174.639 644.215 268.478 676.583 357.5C713.874 460.064 928.198 456.35 920.923 565.247C914.52 661.098 735.341 608.808 656.162 663.18C589.25 709.128 583.646 822.589 507.056 849.447C429.983 876.474 335.464 849.884 272.665 797.662C212.621 747.731 233.057 648.107 188.121 584.231C138.788 514.104 17.4431 498.171 2.57082 413.719C-11.8051 332.086 70.5776 266.687 120.556 200.563C167.618 138.297 214.838 75.0338 284.757 40.3701C356.596 4.75462 437.803 -4.50738 517.552 3.74373Z"
              fill="#A364FF"
            />
          </svg>
        </motion.div>

        {/* Bottom-right blob */}
        <motion.div
          className="pointer-events-none absolute -z-10 transform-gpu overflow-visible left-[45dvw] sm:left-[70dvw] lg:left-[75dvw] top-[75dvh] blur-3xl md:blur-4xl"
          // initial={{ translateX: "0", translateY: "0" }}
          animate={{
            y: ["0dvh", "-75dvh", "-95dvh", "0dvh"],
            x: ["0dvw", "-35dvw", "-25dvw", "0dvw"],
            rotate: [0, -12.05, 9, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.33, 0.66, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
            // width="748"
            // height="876"
            viewBox="0 0 748 876"
            fill="none"
            className="w-full h-auto transform scale-100 md:scale-150 lg:scale-200 xl:scale-300 min-w-full min-h-auto"
          >
            <path
              // fill-rule="evenodd"
              clipRule="evenodd"
              d="M302.296 155.102C378.474 113.284 420.524 6.75172 507.249 1.25454C589.519 -3.96018 669.984 59.3422 714.122 128.998C757.147 196.896 749.991 285.443 737.661 364.873C727.724 428.884 667.896 472.569 651.08 535.123C633.481 600.59 669.953 674.709 638.264 734.631C603.671 800.043 544.842 867.022 471.301 875.072C396.687 883.239 341.382 807.773 274.091 774.493C218.926 747.21 156.504 737.072 110.225 696.494C61.3389 653.63 15.2644 601.162 3.47658 537.214C-8.17628 473.999 22.6433 412.241 46.8518 352.703C69.2961 297.503 92.1399 239.712 139.263 203.259C184.864 167.985 251.761 182.843 302.296 155.102Z"
              fill="#6C35DE"
            />
          </svg>
        </motion.div>
        {/* Testing Component */}
        <MaxWdithWrapper className="md:px-2.5 mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
          <Carousel
            plugins={[plugin.current]}
            className="w-full "
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.play}
            orientation="vertical"
          >
            <CarouselContent className="-mt-1 h-[75px]">
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="pt-1">
                  <Link href="/dashboard" target="_blank">
                    <div className="flex items-center justify-center p-1">
                      <svg
                        width="34"
                        height="19"
                        viewBox="0 0 34 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                        className="mr-2.5 w-auto h-auto flex-shrink-0"
                      >
                        <rect width="34" height="19" rx="6" fill="#6C35DE" />
                        <path
                          d="M12.3738 13H10.3218L6.88975 7.804V13H4.83775V4.576H6.88975L10.3218 9.796V4.576H12.3738V13ZM20.1732 9.544C20.1732 9.736 20.1612 9.936 20.1372 10.144H15.4932C15.5252 10.56 15.6572 10.88 15.8892 11.104C16.1292 11.32 16.4212 11.428 16.7652 11.428C17.2772 11.428 17.6332 11.212 17.8332 10.78H20.0172C19.9052 11.22 19.7012 11.616 19.4052 11.968C19.1172 12.32 18.7532 12.596 18.3132 12.796C17.8732 12.996 17.3812 13.096 16.8372 13.096C16.1812 13.096 15.5972 12.956 15.0852 12.676C14.5732 12.396 14.1732 11.996 13.8852 11.476C13.5972 10.956 13.4532 10.348 13.4532 9.652C13.4532 8.956 13.5932 8.348 13.8732 7.828C14.1612 7.308 14.5612 6.908 15.0732 6.628C15.5852 6.348 16.1732 6.208 16.8372 6.208C17.4852 6.208 18.0612 6.344 18.5652 6.616C19.0692 6.888 19.4612 7.276 19.7412 7.78C20.0292 8.284 20.1732 8.872 20.1732 9.544ZM18.0732 9.004C18.0732 8.652 17.9532 8.372 17.7132 8.164C17.4732 7.956 17.1732 7.852 16.8132 7.852C16.4692 7.852 16.1772 7.952 15.9372 8.152C15.7052 8.352 15.5612 8.636 15.5052 9.004H18.0732ZM30.8677 6.304L29.0557 13H26.7877L25.7317 8.656L24.6397 13H22.3837L20.5597 6.304H22.6117L23.5597 11.092L24.6877 6.304H26.8597L27.9997 11.068L28.9357 6.304H30.8677Z"
                          fill="url(#paint0_linear_400_24)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_400_24"
                            x1="21.5"
                            y1="-5.5"
                            x2="15.5"
                            y2="18"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#CB80FF" />
                            <stop offset="1" stopColor="#FFC7FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <p className="text-sm md:text-2xl min-[381px]:text-lg font-semibold text-gray">
                        Revolutionize your documents with the power of AI - Join
                        now
                      </p>
                      <svg
                        width="52"
                        height="24"
                        viewBox="0 0 52 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid meet"
                        className="ml-2.5 w-auto h-auto flex-shrink-0"
                      >
                        <path
                          d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807611 39.9792 0.807611 39.3934 1.3934C38.8076 1.97919 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z"
                          fill="#FFC7FF"
                        />
                      </svg>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <h1 className="max-w-5xl text-5xl font-bold md:text-6xl lg:text-7xl lg:leading-snug text-white">
            Chat with your
            <span className="text-light-purple"> documents </span>
            in seconds. Instant Feedback
          </h1>
          <p className="mt-5 max-w-prose text-gray sm:text-lg">
            Dekge allows you to explore PDFs in a whole new way. With the help
            of AI, you can quickly summarize lengthy documents, clarify complex
            concepts, and locate important information in mere seconds.
          </p>
          {/* target="_blank" opens a new tab for new user accessing the dashboard */}
          <Link
            className={`${buttonVariants({
              size: "lg",
              className:
                "mt-7 rounded-[1.75rem] h-[4.25rem] w-[16.5rem] relative overflow-hidden",
              variant: "pink",
            })} before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:animate-shine`}
            href="/dashboard"
            target="_blank"
          >
            {/* <ArrowRight className="mr-2 h-5 w-10"></ArrowRight> */}
            <div className="relative flex items-center overflow-hidden">
              <div className="relative z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="52"
                  height="24"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 52 24"
                  fill="none"
                  className="mr-3 animate-arrow-slide"
                >
                  <path
                    d="M51.0607 13.0607C51.6464 12.4749 51.6464 11.5251 51.0607 10.9393L41.5147 1.3934C40.9289 0.807612 39.9792 0.807612 39.3934 1.3934C38.8076 1.97918 38.8076 2.92893 39.3934 3.51472L47.8787 12L39.3934 20.4853C38.8076 21.0711 38.8076 22.0208 39.3934 22.6066C39.9792 23.1924 40.9289 23.1924 41.5147 22.6066L51.0607 13.0607ZM0 13.5H50V10.5H0V13.5Z"
                    fill="#FFC7FF"
                  />
                </svg>
              </div>
              <p className="text-white text-xl md:text-2xl relative z-20">
                Try for Free
              </p>
            </div>
          </Link>

          <div className="relative flex flex-wrap place-content-center items-center overflow-hidden pt-4">
            <p className="mt-5 text-gray sm:text-xl">Supported Formats: </p>
            <div
              className={`${buttonVariants({
                size: "sm",
                className:
                  "ml-3 mt-5 !rounded-full h-[2.25rem] w-[4.5rem] relative overflow-hidden",
                variant: "lightpink",
              })} before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:animate-shine`}
            >
              <p className="text-light-pink p-4 text-[1.15rem]">PDF</p>
            </div>
            <div
              className={`${buttonVariants({
                size: "sm",
                className:
                  "ml-3 mt-5 !rounded-[3.00rem] h-[2.25rem] min-w-max relative overflow-hidden",
                variant: "lightpink",
              })} before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:animate-shine`}
            >
              <p className="text-light-pink p-4 text-[1.15rem]">
                More Coming Soon
              </p>
            </div>
            <div className="w-full justify-center mt-2">
              <p className="mt-5 text-gray sm:text-xl">
                Scroll down to learn more
              </p>
              {/* Animated Scroll Indicator */}
              <div className="w-full flex justify-center mt-4 mb-8">
                <div className="relative flex flex-col items-center">
                  {/* Mouse Container */}
                  <motion.div
                    className="relative"
                    animate={{
                      y: [0, 20, 0],
                      transition: {
                        y: {
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut",
                          repeatType: "loop",
                          times: [0, 0.5, 1],
                        },
                      },
                    }}
                  >
                    {/* Mouse Outline */}
                    <svg
                      width="28"
                      height="44"
                      viewBox="0 0 28 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative"
                    >
                      <rect
                        x="1"
                        y="1"
                        width="26"
                        height="42"
                        rx="13"
                        stroke="#CB80FF"
                        strokeWidth="2"
                      />
                      {/* Scroll Wheel */}
                      <motion.rect
                        x="12"
                        y="1"
                        width="4"
                        height="8"
                        rx="2"
                        fill="#CB80FF"
                        animate={{
                          y: [7, 10, 7],
                          transition: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut",
                            repeatType: "loop",
                          },
                        }}
                      />
                    </svg>
                  </motion.div>

                  {/* Down Arrows */}
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      transition: {
                        opacity: {
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut",
                          repeatType: "loop",
                          times: [0, 0.2, 1],
                          delay: 1.5,
                        },
                      },
                    }}
                  >
                    <svg
                      width="20"
                      height="12"
                      viewBox="0 0 20 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-1"
                    >
                      <path
                        d="M1 1L10 10L19 1"
                        stroke="#CB80FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      width="20"
                      height="12"
                      viewBox="0 0 20 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L10 10L19 1"
                        stroke="#CB80FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </MaxWdithWrapper>
      </div>
    </>
  );
}
