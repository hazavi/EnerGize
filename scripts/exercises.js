const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
  if (this.readyState === this.DONE) {
    const exercises = JSON.parse(this.responseText);
    const exerciseListDiv = document.getElementById('exerciseList');

    // Clear previous content
    exerciseListDiv.innerHTML = '';

    // Loop through the exercises and display them
    exercises.forEach(exercise => {
      const exerciseCard = document.createElement('div');
      exerciseCard.className = 'exercise-card';

      exerciseCard.innerHTML = `
        <div class="exercise-image">
          <img src="${exercise.gifUrl}" alt="${exercise.name}">
        </div>
        <div class="exercise-content">
          <h2 class="exercise-name">${exercise.name}</h2>
          <div class="exercise-details">
            <p><strong>Body Part:</strong> ${exercise.bodyPart}</p>
            <p><strong>Equipment:</strong> ${exercise.equipment}</p>
            <p><strong>Target:</strong> ${exercise.target}</p>
            <p><strong>Secondary Muscles:</strong> ${exercise.secondaryMuscles.join(', ')}</p>
          </div>
          <div class="exercise-instructions">
            <strong>Instructions:</strong>
            <ul>
              ${exercise.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      exerciseListDiv.appendChild(exerciseCard);
    });
  }
});

xhr.open('GET', 'https://exercisedb.p.rapidapi.com/exercises?limit=10&offset=0');
xhr.setRequestHeader('x-rapidapi-key', '683e536ef5mshe8358cfc575d40ep1198a9jsnfc23a843a67c');
xhr.setRequestHeader('x-rapidapi-host', 'exercisedb.p.rapidapi.com');

xhr.send(data);
