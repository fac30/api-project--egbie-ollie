document.addEventListener("DOMContentLoaded", () => {
    const jokeElement = document.getElementById("joke");
    const form = document.getElementById("search-form"); // Get the form element by its ID
    const searchInput = document.getElementById("search-bar"); // Get the search input by its ID

    // Function to handle form submission
    const handleFormSubmit = async (event) => {
        console.log("Submit happened")
        event.preventDefault(); // Prevent the default form submission behavior

        const searchTerm = searchInput.value; // Get the search term from the input field
        try {
            // Make a GET request to the server with search term in route
            const response = await fetch(`/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
                method: "GET"
            });
            console.log(`response: ${response}`)
            // Check if response is successful
            if (!response.ok) {
                throw new Error("Failed to fetch joke");
            }
            // Parse the JSON response to get joke data
            const data = await response.json();
            // Deal with different joke structures
            if (data.type === "single") {
                jokeElement.textContent = data.joke;
            } else if (data.type === "twopart") {
                jokeElement.textContent = `${data.setup} ... ${data.delivery}`;
            } else {
                throw new Error("Unknown joke format");
            }
        } catch (error) {
            // Catch errors that might occur during fetch or parsing 
            console.error("Error fetching joke:", error);
            jokeElement.textContent = "Sorry, we couldn't find a relevant joke!";
        }
    };

    // Attach the event listener to the form to handle submission
    form.addEventListener("submit", handleFormSubmit);
});