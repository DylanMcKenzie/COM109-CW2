$(document).ready(function () {
  $("#navbar").load("../components/navbar/navbar.html", function () {
    $(".nav-link").removeClass("active");
  });

  const selectedPet =
    JSON.parse(localStorage.getItem("selectedCat")) ||
    JSON.parse(localStorage.getItem("selectedDog"));

  if (selectedPet) {
    document.getElementById("pet-name").textContent = selectedPet.name;
    document.getElementById("pet-breed").textContent = selectedPet.breed;
    document.getElementById("pet-gender").textContent = selectedPet.gender;
    document.getElementById("pet-age").textContent = selectedPet.age;
    document.getElementById("pet-location").textContent = selectedPet.location;
    document.getElementById("pet-img").src = selectedPet.image;
  } else {
    alert("No pet selected. Please go back and select a pet.");
    window.history.back();
  }

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("visit-date").setAttribute("min", today);
});

$(document).ready(function () {
  
  $("#reservation-form").on("submit", function (e) {
    e.preventDefault();

    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }

    const reservationData = {
      pet: {
        id: getQueryParam('id'),
        name: $("#pet-name").text(),
        breed: $("#pet-breed").text(),
        gender: $("#pet-gender").text(),
        age: $("#pet-age").text(),
        location: $("#pet-location").text(),
        image: $("#pet-img").attr("src"),
      },
      user: {
        title: $("#title").val(),
        firstName: $("#first-name").val(),
        lastName: $("#last-name").val(),
        email: $("#email").val(),
        address: $("#address").val(),
        town: $("#town").val(),
        postcode: $("#postcode").val(),
        number: $("#number").val(),
        visitDate: $("#visit-date").val()
      }
    };

    localStorage.setItem("reservation", JSON.stringify(reservationData));

    window.location.href = "confirmation.html";
  });
});
