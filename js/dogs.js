$(document).ready(function () {
    $.getJSON("../data/pets.json", function (data) {
        const dogs = data.filter((animal) => animal.type === "dog");
        const $list = $(".dog-list").empty();

        dogs.forEach((dog) => {
            const reserved = !!dog.reserved;

            const card = $(`
                <article class="dog-card" data-reserved="${reserved}">
                    <img src="${dog.image}" alt="${dog.name} the ${dog.breed}" />
                    <h2>${dog.name}</h2>
                    <div class="dog-info">
                        <div class="info-item">${dog.gender}</div>
                        <div class="info-item">${dog.age}</div>
                        <div class="info-item">${dog.location}</div>
                    </div>
                    <p class="short-desc">${dog.shortDescription || ""}</p>
                    <button 
                        type="button"
                        class="adopt-btn ${reserved ? "reserved-btn" : ""}"
                        data-pet-id="${dog.id}" 
                        ${reserved ? "disabled" : ""}
                    >
                        ${reserved ? "Reserved" : "Adopt Me"}
                    </button>
                </article>
            `);

            $list.append(card);
        });

        $("#filterReserved").on("change", function () {
            if (this.checked) {
                $(".dog-card").hide().filter('[data-reserved="true"]').show();
            } else {
                $(".dog-card").show();
            }
        });

        $(document).on("click", ".adopt-btn:not([disabled])", function (e) {
            e.preventDefault();
            const petId = $(this).data("pet-id");
            if (!petId) {
                console.error("No pet ID on button");
                return;
            }
            const dog = dogs.find((d) => String(d.id) === String(petId));
            if (dog) {
                localStorage.removeItem("selectedCat");
                localStorage.setItem("selectedDog", JSON.stringify(dog));
                window.location.href = "reservation.html";
            }
        });
    }).fail(function () {
        console.error("Could not load dogs. Please retry.");
    });
});
