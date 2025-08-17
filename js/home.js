// Component loaders

function loadComponent(url, selector, callback) {
    return fetch(url)
        .then((response) => response.text())
        .then((html) => {
            if (selector) {
                const element = document.querySelector(selector);
                if (element) element.innerHTML = html;
            } else {
                document.body.insertAdjacentHTML("beforeend", html);
            }
            if (typeof callback === "function") callback();
        });
}

Promise.all([
    loadComponent("components/navbar/navbar.html", "#navbar"),
    loadComponent("components/footer/footer.html", "#footer"),
    loadComponent("pages/home.html", "#home-page", () => {
        initSlider();
        initStepsReveal();
        initLostPetsReveal();
    }),
    loadComponent("components/modals/donate.html", null).then(() => initDonateModal()),
]).catch((err) => console.error("Component load error:", err));

// Pet Slider

function initSlider() {
    const slider = document.querySelector(".pet-slider");
    if (!slider) return;

    const slides = slider.querySelectorAll(".pet-slider-photo");
    const dotsContainer = slider.querySelector(".pet-slider-dots");
    if (!slides.length || !dotsContainer) return;

    let currentIndex = 0;
    let autoSlideTimer;

    dotsContainer.innerHTML = "";
    slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = "pet-slider-dot" + (index === 0 ? " active" : "");
        dot.addEventListener("click", () => {
            goToSlide(index);
            restartAutoSlide();
        });
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll(".pet-slider-dot");

    function goToSlide(index) {
        slides[currentIndex].classList.remove("active");
        dots[currentIndex].classList.remove("active");

        currentIndex = index;

        slides[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    function goToNextSlide() {
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
    }

    function startAutoSlide() {
        autoSlideTimer = setInterval(goToNextSlide, 5000);
    }

    function restartAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }

    startAutoSlide();

    window.addEventListener("beforeunload", () => clearInterval(autoSlideTimer));
}

// Adoption Steps

function initStepsReveal() {
    const revealSteps = document.querySelectorAll(".steps-box, .polaroid");
    if (!revealSteps.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            let delay = 0;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("show");
                    }, delay);

                    delay += 250;
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -10% 0px",
        }
    );

    revealSteps.forEach((item) => observer.observe(item));
}