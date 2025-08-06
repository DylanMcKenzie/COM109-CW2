$(document).ready(function() {
  $('#navbar').load('../components/navbar/navbar.html', function() {
    $('.nav-link').removeClass('active');
  });

  const selectedPet = JSON.parse(localStorage.getItem('selectedCat')) || JSON.parse(localStorage.getItem('selectedDog'));
  
  if (selectedPet) {
    document.getElementById('pet-name').textContent = selectedPet.name;
    document.getElementById('pet-breed').textContent = selectedPet.breed;
    document.getElementById('pet-gender').textContent = selectedPet.gender;
    document.getElementById('pet-age').textContent = selectedPet.age;
    document.getElementById('pet-location').textContent = selectedPet.location;
    document.getElementById('pet-img').src = selectedPet.image;
  } else {
    alert("No pet selected. Please go back and select a pet.");
    window.history.back();
  }

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("visit-date").setAttribute("min", today);
});