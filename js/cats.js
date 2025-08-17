$(document).ready(function () {
    let allCats = [];
    let filteredCats = [];
    let likedCats = JSON.parse(localStorage.getItem("likedCats") || "[]");

    $("#navbar").load("../components/navbar/navbar.html", function () {
        $(".nav-link").removeClass("active");
        $('.nav-link[href="../pages/cats.html"]').addClass("active");
    });

    loadCats();

    function loadCats() {
        $.getJSON("../data/pets.json")
            .done(function (data) {
                allCats = data.filter((pet) => pet.type === "cat");
                filteredCats = [...allCats];
                $("#loading").hide();
                populateFilters();
                displayCats();
                updateStats();
            })
            .fail(function () {
                $("#loading").html("<p>Error loading cats data</p>");
            });
    }

    function populateFilters() {
        const breeds = [...new Set(allCats.map((cat) => cat.breed))].sort();
        breeds.forEach((breed) => {
            $("#breed-filter").append(`<option value="${breed}">${breed}</option>`);
        });

        const locations = [...new Set(allCats.map((cat) => cat.location))].sort();
        locations.forEach((location) => {
            $("#location-filter").append(`<option value="${location}">${location}</option>`);
        });
    }

    function displayCats() {
        const catsGrid = $("#cats-grid");
        catsGrid.empty();

        if (filteredCats.length === 0) {
            $("#no-results").addClass("show");
            catsGrid.addClass("hidden");
            return;
        }

        $("#no-results").removeClass("show");
        catsGrid.removeClass("hidden");

        filteredCats.forEach((cat) => {
            const isLiked = likedCats.includes(cat.id);
            const catCard = createCatCard(cat, isLiked);
            catsGrid.append(catCard);
        });
    }

    function createCatCard(cat, isLiked) {
        const traits = getTraits(cat);

        return `
      <div class="cat-card" data-cat-id="${cat.id}">
        <div class="cat-image-container">
          <img src="${cat.image}" alt="${cat.name}" class="cat-image">
          <button class="like-btn ${isLiked ? "liked" : ""}" data-cat-id="${cat.id}">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        
        <div class="cat-info">
          <h3 class="cat-name">${cat.name}</h3>
          <p class="cat-breed">${cat.breed}</p>
          
          <div class="cat-details">
            <span><i class="fas fa-venus-mars"></i> ${cat.gender}</span>
            <span><i class="fas fa-birthday-cake"></i> ${cat.age}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${cat.location.split(" ")[0]}</span>
          </div>
          
          <div class="cat-traits">
            ${traits.map((trait) => `<span class="trait-badge">${trait}</span>`).join("")}
          </div>
          
          <p class="cat-about">${cat.about}</p>
          
          <button class="adopt-btn" data-cat-id="${cat.id}">
            <i class="fas fa-heart"></i> Adopt Me
          </button>
        </div>
      </div>
    `;
    }

    function getTraits(cat) {
        const traits = [];
        if (cat.goodWithChildren) traits.push("Kid-friendly");
        if (cat.goodWithOtherPets) traits.push("Pet-friendly");
        if (!cat.goodWithChildren && !cat.goodWithOtherPets) traits.push("Prefers adults");
        return traits;
    }

    function updateStats() {
        $("#total-cats").text(allCats.length);
        $("#filtered-cats").text(filteredCats.length);
        $("#total-likes").text(likedCats.length);
    }

    function applyFilters() {
        const breedFilter = $("#breed-filter").val();
        const ageFilter = $("#age-filter").val();
        const childrenFilter = $("#children-filter").val();
        const petsFilter = $("#pets-filter").val();
        const genderFilter = $("#gender-filter").val();
        const locationFilter = $("#location-filter").val();
        const nameSearch = $("#name-search").val().toLowerCase();
        const favoritesFilter = $("#favorites-filter").val();

        filteredCats = allCats.filter((cat) => {
            if (nameSearch && !cat.name.toLowerCase().includes(nameSearch)) return false;
            if (breedFilter && cat.breed !== breedFilter) return false;
            if (ageFilter) {
                const ageNum = parseInt(cat.age);
                if (ageFilter === "kitten" && !(cat.age.includes("month") || ageNum < 1)) return false;
                if (ageFilter === "young" && !(ageNum >= 1 && ageNum <= 3)) return false;
                if (ageFilter === "adult" && ageNum < 4) return false;
            }
            if (childrenFilter && cat.goodWithChildren.toString() !== childrenFilter) return false;
            if (petsFilter && cat.goodWithOtherPets.toString() !== petsFilter) return false;
            if (genderFilter && cat.gender !== genderFilter) return false;
            if (locationFilter && cat.location !== locationFilter) return false;
            if (favoritesFilter === "favorites" && !likedCats.includes(cat.id)) return false;

            return true;
        });

        displayCats();
        updateStats();
    }

    const filterSelectors = "#breed-filter, #age-filter, #children-filter, #pets-filter, #gender-filter, #location-filter, #favorites-filter";

    $(filterSelectors).on("change", applyFilters);
    $("#name-search").on("input", applyFilters);

    $("#reset-filters").on("click", function () {
        $(filterSelectors).val("");
        $("#name-search").val("");
        filteredCats = [...allCats];
        displayCats();
        updateStats();
    });

    $(document).on("click", ".like-btn", function () {
        const catId = $(this).data("cat-id");
        const isLiked = likedCats.includes(catId);

        if (isLiked) {
            likedCats = likedCats.filter((id) => id !== catId);
            $(this).removeClass("liked");
        } else {
            likedCats.push(catId);
            $(this).addClass("liked");
        }

        localStorage.setItem("likedCats", JSON.stringify(likedCats));
        updateStats();
    });

    $(document).on("click", ".adopt-btn", function () {
        const catId = $(this).data("cat-id");
        const cat = allCats.find((c) => c.id === catId);

        if (cat) {
            localStorage.removeItem("selectedDog");
            localStorage.setItem("selectedCat", JSON.stringify(cat));
            window.location.href = "reservation.html";
        }
    });
});
