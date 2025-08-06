function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
$(document).ready(function () {
  $('#navbar').load('../components/navbar/navbar.html', function () {
    // Remove 'active' class from all links
    $('.nav-link').removeClass('active');
  });
});

fetch('../data/pets.json')
  .then(response => response.json())
  .then(pets => {
    const petId = getQueryParam('id');
    const pet = pets.find(p => p.id === petId);
    
    console.log(petId)

    if (pet) {
      document.getElementById('pet-name').textContent = pet.name;
      document.getElementById('pet-breed').textContent = pet.breed;
      document.getElementById('pet-gender').textContent = pet.gender;
      document.getElementById('pet-age').textContent = pet.age;
      document.getElementById('pet-location').textContent = pet.location;
      document.getElementById('pet-img').src = pet.image;
    } else {
      alert("Pet not found");
    }
  })
  .catch(error => {
    console.error("Error loading pet data:", error);
  });

  document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("visit-date").setAttribute("min", today);
});