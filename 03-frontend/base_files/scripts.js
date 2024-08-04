document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }
        const placeId = getPlaceIdFromURL();
        fetchPlaceDetails(token, placeId);
    }
    return token;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('place_id');
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch place details');
        }

        const place = await response.json();
        displayPlaceDetails(place);
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    placeDetails.innerHTML = '';

    const placeName = document.createElement('h2');
    placeName.textContent = place.name;

    const placeDescription = document.createElement('p');
    placeDescription.textContent = place.description;

    const placeLocation = document.createElement('p');
    placeLocation.textContent = `${place.city_name}, ${place.country_name}`;

    placeDetails.appendChild(placeName);
    placeDetails.appendChild(placeDescription);
    placeDetails.appendChild(placeLocation);

    if (place.images && place.images.length > 0) {
        const imageContainer = document.createElement('div');
        place.images.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = place.name;
            imageContainer.appendChild(img);
        });
        placeDetails.appendChild(imageContainer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = reviewForm.review.value;
            const token = getCookie('token');
            const placeId = getPlaceIdFromURL();

            if (token) {
                try {
                    const response = await submitReview(token, placeId, reviewText);
                    handleResponse(response);
                } catch (error) {
                    alert(`Failed to submit review: ${error.message}`);
                }
            } else {
                alert('Authentication required');
                window.location.href = 'index.html';
            }
        });
    }
});


async function submitReview(token, placeId, reviewText) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ review: reviewText })
        });

        console.log('Request Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit review');
        }

        return response;
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

function handleResponse(response) {
    if (response.ok) {
      alert('Review submitted successfully!');
      document.getElementById('review-form').reset();
    } else {
      response.json().then(data => {
        alert(`Failed to submit review: ${data.message}`);
      });
    }
  }