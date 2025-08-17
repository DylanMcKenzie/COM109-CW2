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

// Donate modal

function initDonateModal() {
    const $form = $("#donor-details-form");
    if (!$form.length) return;

    const setValidity = ($input, message) => {
        const input = $input[0];
        input.setCustomValidity(message);
        input.reportValidity();
        input.setCustomValidity("");
    };

    const digitsOnly = (value) => String(value || "").replace(/\D/g, "");

    const formatSortCode = (rawValue) =>
        digitsOnly(rawValue)
            .slice(0, 6)
            .replace(/(\d{2})(?=\d)/g, "$1-");

    const $sortCodeInput = $form.find("#sortCode");
    const $accountNumberInput = $form.find("#accNumber");
    const $accountNameInput = $form.find('[name="accName"]');
    const $firstNameInput = $form.find('[name="firstName"]');
    const $lastNameInput = $form.find('[name="lastName"]');
    const $phoneInput = $form.find('[name="phone"]');
    const $donationAmountInput = $form.find("#donationAmount");
    const $emailInput = $form.find('[name="email"]');

    // Masks

    $sortCodeInput
        .on("input blur", function () {
            this.value = formatSortCode(this.value);
        })
        .on("paste", function () {
            setTimeout(() => {
                this.value = formatSortCode(this.value);
            }, 0);
        });

    $accountNumberInput.on("input", function () {
        this.value = digitsOnly(this.value).slice(0, 8);
    });

    const filterNameInput = function () {
        this.value = String(this.value || "").replace(/[^-\p{L}\s']/gu, "");
    };
    $accountNameInput.on("input", filterNameInput);
    $firstNameInput.on("input", filterNameInput);
    $lastNameInput.on("input", filterNameInput);

    $phoneInput.on("input", function () {
        this.value = digitsOnly(this.value).slice(0, 11);
    });

    $donationAmountInput.on("input", function () {
        let value = String(this.value || "").replace(/[^\d.]/g, "");
        value = value.replace(/(\..*)\./g, "$1"); // keep only one dot
        if (value.includes(".")) {
            const [integerPart, decimalPart = ""] = value.split(".");
            value = integerPart.replace(/^0+(?=\d)/, "") + "." + decimalPart.slice(0, 2);
        } else {
            value = value.replace(/^0+(?=\d)/, "");
        }
        this.value = value;
    });

    // Submit

    $form.on("submit", function (event) {
        event.preventDefault();

        const firstName = ($firstNameInput.val() || "").trim();
        const lastName = ($lastNameInput.val() || "").trim();
        const accountName = ($accountNameInput.val() || "").trim();
        const accountNum = ($accountNumberInput.val() || "").trim();
        const sortCode = ($sortCodeInput.val() || "").trim();
        const phoneNumber = ($phoneInput.val() || "").trim();
        const emailEl = $emailInput[0];

        // Validation rules

        const nameRegex = /^[-\p{L}\s']+$/u;
        const sortRegex = /^\d{2}-\d{2}-\d{2}$/;
        const accountRegex = /^\d{8}$/;
        const phoneRegex = /^07\d{9}$/;

        // Names

        if (!nameRegex.test(firstName)) {
            return setValidity($firstNameInput, "First name can only contain letters, spaces, hyphens, or apostrophes");
        }
        if (!nameRegex.test(lastName)) {
            return setValidity($lastNameInput, "Last name can only contain letters, spaces, hyphens, or apostrophes");
        }
        if (!nameRegex.test(accountName)) {
            return setValidity($accountNameInput, "Account holder name can only contain letters, spaces, hyphens, or apostrophes");
        }

        // Email

        if (!emailEl.checkValidity()) {
            return setValidity($emailInput, "Please enter a valid email address");
        }

        // Phone

        if (phoneNumber && !phoneRegex.test(phoneNumber)) {
            return setValidity($phoneInput, "Phone must start with 07 and be 11 digits long (e.g. 07XXXXXXXXX)");
        }

        // Account number

        if (!accountRegex.test(accountNum)) {
            return setValidity($accountNumberInput, "Please enter exactly 8 digits for the account number");
        }

        // Sort code

        if (!sortRegex.test(sortCode)) {
            return setValidity($sortCodeInput, "Please enter a sort code in the format 00-00-00");
        }

        // Amount

        let normalisedAmount = String($donationAmountInput.val() || "")
            .trim()
            .replace(/[^\d.]/g, "")
            .replace(/(\..*)\./g, "$1");

        if (normalisedAmount.includes(".")) {
            const [intPart, decPart = ""] = normalisedAmount.split(".");
            normalisedAmount = intPart.slice(0, 6) + "." + decPart.slice(0, 2);
        } else {
            normalisedAmount = normalisedAmount.slice(0, 6);
        }

        let amountNumber = parseFloat(normalisedAmount);
        if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
            return setValidity($donationAmountInput, "Please enter a valid amount (e.g. 5 or 12.50)");
        }
        if (amountNumber > 999999) amountNumber = 999999;
        const amountFormatted = amountNumber.toFixed(2);

        const formElement = $form[0];
        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        // Success

        const donateModalEl = document.getElementById("donateModal");
        const donateModal = bootstrap.Modal.getInstance(donateModalEl) || new bootstrap.Modal(donateModalEl);
        donateModal.hide();

        $(donateModalEl).one("hidden.bs.modal", function () {
            const $thankYouModal = $("#thankYouModal");
            $thankYouModal.find("#tyName").text(firstName || "Friend");
            $thankYouModal.find("#tyAmount").text(amountFormatted);

            const thankYouModal = new bootstrap.Modal($thankYouModal[0], { backdrop: "static" });
            thankYouModal.show();

            $thankYouModal.one("shown.bs.modal", function () {
                fireConfetti(1200);
            });
        });

        $form[0].reset();
    });
}

// Pink Confetti !!! :)

function fireConfetti(duration = 1000) {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "2000",
    });
    document.body.appendChild(canvas);

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const colors = ["#ff70c0", "#cba6ea", "#ffe5fd", "#3f2171", "#ffcfef"];
    const particles = Array.from({ length: 160 }, () => ({
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2.5,
        size: Math.random() * 5 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
    }));

    const startTime = performance.now();

    function drawFrame(now) {
        const elapsed = now - startTime;
        ctx.clear(0, 0, window.innerWidth, window.innerHeight);

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }

        if (elapsed < duration) {
            requestAnimationFrame(drawFrame);
        } else {
            canvas.remove();
        }
    }
    requestAnimationFrame(drawFrame);
}
