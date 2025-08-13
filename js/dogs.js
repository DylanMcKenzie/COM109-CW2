$(function() {
  $('#filterReserved').on('change', function() {
    if ($(this).is(':checked')) {
      // Show only dogs with data-reserved="true"
      $('.dog-card').each(function() {
        if ($(this).attr('data-reserved') === "true") {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } else {
      // Show all dogs
      $('.dog-card').show();
    }
  });

  // Keep your adopt button logic if you want
  $('.adopt-btn').not('[disabled]').on('click', function() {
    const dogName = $(this).siblings('h2').text();
    localStorage.setItem('selectedDog', dogName);
    window.location.href = 'reservation.html';
  });
});

$(document).ready(function () {
    $.getJSON("../data/pets.json", function (data) {
        let dogs = data.filter(animal => animal.type === "dog");
        let $list = $(".dog-list").empty();

        dogs.forEach(dog => {
            let reserved = dog.reserved || false;

            let card = $(`
                <article class="dog-card" data-reserved="${reserved}">
                    <img src="${dog.image}" alt="${dog.name} the ${dog.breed}" />
                    <h2>${dog.name}</h2>
                    <div class="dog-info">
                        <div class="info-item">${dog.gender}</div>
                        <div class="info-item">${dog.age}</div>
                        <div class="info-item">${dog.location}</div>
                    </div>
                    <p class="short-desc">${dog.shortDescription}</p>
                    <button class="adopt-btn"${reserved ? " disabled" : ""}>
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
    }).fail(function () {
        console.error("Could not load dogs JSON file.");
    });
});


