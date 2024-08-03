document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');


  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

  function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        fetchPlaces(token);
    }
}

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const email = loginForm.email.value;
          const password = loginForm.password.value;

          try {
              const response = await loginUser(email, password);

              if (response.ok) {
                  const data = await response.json();
                  document.cookie = `token=${data.access_token}; path=/`;
                  window.location.href = 'index.html';
              } else {
                  const errorData = await response.json();
                  errorMessage.textContent = `Login failed: ${errorData.message}`;
              }
          } catch (error) {
              errorMessage.textContent = 'Login failed: An unexpected error occurred.';
          }
      });
  }
});

async function loginUser(email, password) {
  return await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  });
}

async function fetchPlaces(token) {
  try {
      const response = await fetch('http://127.0.0.1:5000/places', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch places');
      }

      const places = await response.json();
      displayPlaces(places);
  } catch (error) {
      console.error('Error fetching places:', error);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach(place => {
      const placeElement = document.createElement('div');
      placeElement.className = 'place-item';
      placeElement.innerHTML = `
          <h3>${place.name}</h3>
          <p>${place.description}</p>
          <p>${place.city_name}, ${place.country_name}</p>
          <p>Price per night: $${place.price_per_night}</p>
      `;
      placesList.appendChild(placeElement);
  });
}

document.getElementById('country-filter').addEventListener('change', (event) => {
  const selectedCountry = event.target.value;
  const placeItems = document.querySelectorAll('.place-item');

  placeItems.forEach(item => {
      const countryName = item.querySelector('p').textContent.split(', ')[1];
      if (selectedCountry === 'All' || countryName === selectedCountry) {
          item.style.display = 'block';
      } else {
          item.style.display = 'none';
      }
  });
});
