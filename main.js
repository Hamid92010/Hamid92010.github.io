document.addEventListener("DOMContentLoaded", () => {
    initializeSmoothNavigation();
    initializeProjectSliders();
});

function initializeSmoothNavigation() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const targetSection = document.querySelector(targetId);

            if (!targetSection) {
                return;
            }

            event.preventDefault();

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

function initializeProjectSliders() {
    const sliders = document.querySelectorAll(
        "[data-project-slider]"
    );

    sliders.forEach((slider) => {
        const slides = Array.from(
            slider.querySelectorAll(".project-slide")
        );

        const indicators = Array.from(
            slider.querySelectorAll(".slider-indicator")
        );

        const previousButton = slider.querySelector(
            "[data-slider-previous]"
        );

        const nextButton = slider.querySelector(
            "[data-slider-next]"
        );

        if (
            slides.length === 0 ||
            !previousButton ||
            !nextButton
        ) {
            return;
        }

        let currentIndex = 0;
        let animationInProgress = false;

        function pauseAllVideos() {
            slides.forEach((slide) => {
                const video = slide.querySelector("video");

                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        }

        function playCurrentVideo() {
            const currentSlide = slides[currentIndex];
            const video = currentSlide.querySelector("video");

            if (!video) {
                return;
            }

            video.currentTime = 0;

            const playPromise = video.play();

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log(
                        "El navegador bloqueó la reproducción automática."
                    );
                });
            }
        }

        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                const isActive = index === currentIndex;

                indicator.classList.toggle(
                    "active",
                    isActive
                );

                indicator.setAttribute(
                    "aria-current",
                    isActive ? "true" : "false"
                );
            });
        }

        function showSlide(newIndex, direction) {
            if (
                animationInProgress ||
                newIndex === currentIndex
            ) {
                return;
            }

            animationInProgress = true;
            pauseAllVideos();

            const currentSlide = slides[currentIndex];
            const nextSlide = slides[newIndex];

            const enterFrom =
                direction === "next" ? "100%" : "-100%";

            const exitTo =
                direction === "next" ? "-100%" : "100%";

            nextSlide.style.transition = "none";
            nextSlide.style.visibility = "visible";
            nextSlide.style.opacity = "1";
            nextSlide.style.transform =
                `translateX(${enterFrom})`;
            nextSlide.style.zIndex = "3";

            void nextSlide.offsetWidth;

            currentSlide.style.transition =
                "transform 0.45s ease, opacity 0.45s ease";

            nextSlide.style.transition =
                "transform 0.45s ease, opacity 0.45s ease";

            currentSlide.style.transform =
                `translateX(${exitTo})`;

            currentSlide.style.opacity = "0";
            nextSlide.style.transform = "translateX(0)";

            currentIndex = newIndex;
            updateIndicators();

            window.setTimeout(() => {
                slides.forEach((slide, index) => {
                    const isCurrent =
                        index === currentIndex;

                    slide.classList.toggle(
                        "active",
                        isCurrent
                    );

                    if (!isCurrent) {
                        slide.style.visibility = "hidden";
                        slide.style.opacity = "0";
                        slide.style.transform =
                            "translateX(100%)";
                        slide.style.zIndex = "0";
                    }
                });

                nextSlide.style.visibility = "visible";
                nextSlide.style.opacity = "1";
                nextSlide.style.transform = "translateX(0)";
                nextSlide.style.zIndex = "2";

                playCurrentVideo();
                animationInProgress = false;
            }, 470);
        }

        function showNextSlide() {
            const nextIndex =
                (currentIndex + 1) % slides.length;

            showSlide(nextIndex, "next");
        }

        function showPreviousSlide() {
            const previousIndex =
                (currentIndex - 1 + slides.length) %
                slides.length;

            showSlide(previousIndex, "previous");
        }

        nextButton.addEventListener(
            "click",
            showNextSlide
        );

        previousButton.addEventListener(
            "click",
            showPreviousSlide
        );

        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => {
                if (index === currentIndex) {
                    return;
                }

                const direction =
                    index > currentIndex
                        ? "next"
                        : "previous";

                showSlide(index, direction);
            });
        });

        slider.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showPreviousSlide();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showNextSlide();
            }
        });

        slides.forEach((slide, index) => {
            const isFirstSlide = index === 0;

            slide.classList.toggle(
                "active",
                isFirstSlide
            );

            slide.style.visibility =
                isFirstSlide ? "visible" : "hidden";

            slide.style.opacity =
                isFirstSlide ? "1" : "0";

            slide.style.transform =
                isFirstSlide
                    ? "translateX(0)"
                    : "translateX(100%)";

            slide.style.zIndex =
                isFirstSlide ? "2" : "0";
        });

        pauseAllVideos();
        updateIndicators();
    });
}
