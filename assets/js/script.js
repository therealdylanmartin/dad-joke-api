//////////////////////// Variables

// Set endpoints for random joke and searching jokes
const randomJokeEndpoint = 'https://icanhazdadjoke.com/';
const searchJokesEndpoint = `${randomJokeEndpoint}search`;

// Select elements for interaction
const randomJokeElem = document.getElementById('random_joke');
const searchFormElem = document.getElementById('search_form');
const searchInputElem = document.getElementById('search_input');
const jokeListElem = document.getElementById('joke_list');

//////////////////////// Functions

const getRandomDadJoke = () => {
  // Fetch random dad joke, necassary to set headers to accept json
  fetch(randomJokeEndpoint, { headers: { 'Accept': 'application/json' } })
    .then(response => response.json())
    .then(data => renderRandomJoke(data.joke))
    .catch(error => window.alert(error))
}

const renderRandomJoke = (joke) => {
  // Initialize empty h4 element 
  const h4Elem = document.createElement('h4');
  // Use the incoming joke as text content
  h4Elem.textContent = joke;
  // Render random joke in blockqoute section
  randomJokeElem.append(h4Elem);
}

const searchDadJokes = (event) => {
  // prevent default form submitting behavior
  event.preventDefault();
  // Get variable for input value
  const terms = searchInputElem.value;

  // Check if terms are empty and return with message
  if (!terms) {
    window.alert('You didn\'t enter any terms!');
    return;
  }

  // Empty the input
  searchInputElem.value = '';
  // Use search API and query terms to build endpoint URL
  const queryEndpoint = `${searchJokesEndpoint}?term=${terms}`;

  // Fetch the jokes
  fetch(queryEndpoint, { headers: { 'Accept': 'application/json' } })
    .then(response => response.json())
    .then(data => {
      // Check if results are empty and return with message
      if (!data.results.length) {
        window.alert('No jokes for that term!');
        return;
      }

      // If results aren't empty, render jokes
      renderJokeList(data.results);
    })
    .catch(error => window.alert(error))
}

const renderJokeList = (jokesArray) => {
  // Map through joke objects, deconstructing 'joke' property
  jokesArray.map(({ joke }) => {
    // Run joke through render function
    renderListItem(joke);
  })
}

const renderListItem = (joke) => {
  // Initialize empty li element 
  const liElem = document.createElement('li');
  // Add Materialize CSS class for styling
  liElem.classList.add('collection-item');

  // Initialize empty h5 element 
  const h5Elem = document.createElement('h5');
  // Add Materialize CSS class for styling
  h5Elem.classList.add('teal-text');
  // Use the incoming joke as text content
  h5Elem.textContent = joke;
  // Append h5 to li
  liElem.append(h5Elem);

  // Render random joke in joke list ul element
  jokeListElem.append(liElem);
}

//////////////////////// Event Listeners

searchFormElem.addEventListener('submit', searchDadJokes);

//////////////////////// Init

getRandomDadJoke();