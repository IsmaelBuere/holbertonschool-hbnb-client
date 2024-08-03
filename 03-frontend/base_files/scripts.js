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
