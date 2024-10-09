const url = 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList';
const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': '683e536ef5mshe8358cfc575d40ep1198a9jsnfc23a843a67c',
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
};

// Function to fetch body parts
async function fetchBodyParts() {
    try {
        const response = await fetch(url, options);

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const bodyParts = await response.json();
        const bodyPartListDiv = document.getElementById('bodyPartList');

        // Loop through the body parts and display them
        bodyParts.forEach(bodyPart => {
            const bodyPartDiv = document.createElement('button');
            bodyPartDiv.className = 'body-part';
            bodyPartDiv.textContent = bodyPart;

            // Add click event listener
            bodyPartDiv.addEventListener('click', () => fetchExercises(bodyPart));
            bodyPartListDiv.appendChild(bodyPartDiv);
        });
    } catch (error) {
        console.error('Error fetching body parts:', error);
    }
}

// Function to fetch exercises based on the selected body part
async function fetchExercises(bodyPart) {
    const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=10&offset=0`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '683e536ef5mshe8358cfc575d40ep1198a9jsnfc23a843a67c',
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const exercises = await response.json();
        displayExercises(exercises); // Function to display exercises
    } catch (error) {
        console.error('Error fetching exercises:', error);
    }
}

// Function to display exercises on the page
function displayExercises(exercises) {
    const exerciseListDiv = document.getElementById('exerciseList');
    exerciseListDiv.innerHTML = ''; // Clear previous exercises

    if (exercises.length === 0) {
        exerciseListDiv.textContent = 'No exercises found for this body part.'; // Display message if no exercises found
        return;
    }

    exercises.forEach(exercise => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise';

        // Create a title for the exercise
        const title = document.createElement('h3');
        title.textContent = exercise.name;

        // Create an image for the exercise
        const gifImg = document.createElement('img');
        gifImg.src = exercise.gifUrl;
        gifImg.alt = exercise.name;


        // Append elements to the exercise div
        exerciseDiv.appendChild(title);
        exerciseDiv.appendChild(gifImg);
        exerciseListDiv.appendChild(exerciseDiv);
    });
}

// Call the function to fetch body parts
fetchBodyParts();
