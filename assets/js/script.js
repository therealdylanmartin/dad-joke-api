//////////////////////// Variables

// Set endpoints for random joke and searching jokes
const randomJokeEndpoint = 'https://icanhazdadjoke.com/';
const searchJokesEndpoint = `${randomJokeEndpoint}search`;

// Select elements
const randomJokeElem = document.getElementById('random_joke');
const searchFormElem = document.getElementById('search_form');
const searchInputElem = document.getElementById('search_input');
const jokeListElem = document.getElementById('joke_list');

// Initialize global terms array
let searchTerms = [];

//////////////////////// Functions

const getLocalStorageTerms = () => {
  // Get local storage terms
  const localStorageTerms = localStorage.getItem('jokeSearchTerms');
  // If terms are found, set searchTerms array to local storage
  if (localStorageTerms) {
    searchTerms = JSON.parse(localStorageTerms);
  }
}

const setLocalStorageTerms = (term) => {
  // Add the term to the end of the terms array
  searchTerms.push(term);
  // Set the stringified terms array to localStorage
  localStorage.setItem('jokeSearchTerms', JSON.stringify(searchTerms));
}

const getRandomDadJoke = () => {
  // Fetch random dad joke, necassary to set headers to accept json
  fetch(randomJokeEndpoint, { headers: { 'Accept': 'application/json' } })
    // Convert json
    .then(response => response.json())
    // Render the random joke
    .then(data => renderRandomJoke(data.joke))
    // Catch error if fetch fails
    .catch(error => console.log(error))
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
  const term = searchInputElem.value;

  // Check if term input is empty and return with message
  if (!term) {
    window.alert('You didn\'t enter any terms!');
    return;
  }

  // Empty the input
  searchInputElem.value = '';
  // Use search API and query terms to build endpoint URL
  const queryEndpoint = `${searchJokesEndpoint}?term=${term}`;

  // Fetch the jokes, necassary to set headers to accept json
  fetch(queryEndpoint, { headers: { 'Accept': 'application/json' } })
    // Convert json
    .then(response => response.json())
    .then(data => {
      // Check if results are empty and return with message
      if (!data.results.length) {
        window.alert('No jokes for that term!');
        return;
      }

      // Add search term to local storage
      setLocalStorageTerms(term);
      // If results aren't empty, render jokes
      renderJokeList(data.results);
    })
    // Catch error if fetch fails
    .catch(error => console.log(error))
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

getLocalStorageTerms();