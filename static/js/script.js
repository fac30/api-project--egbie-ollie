document.addEventListener("DOMContentLoaded", () => {
    const jokeElement = document.getElementById("joke");
  
    // Fetch joke from server and update HTML
    fetch("/joke")
      .then((response) => response.json())
      .then((data) => {
        jokeElement.textContent = data.joke;
      })
      .catch((error) => {
        console.error("Error fetching joke:", error);
        jokeElement.textContent = "Failed to fetch joke";
      });
  });