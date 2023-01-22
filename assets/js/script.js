//////////////////////// Variables

// Set endpoints for random joke and searching jokes
const randomJokeEndpoint = 'https://icanhazdadjoke.com/';
const searchJokesEndpoint = `${randomJokeEndpoint}search`;

// Select elements
const randomJokeElem = document.getElementById('random_joke');
const jokeButtonElem = document.getElementById('joke_button');
const searchFormElem = document.getElementById('search_form');
const searchInputElem = document.getElementById('search_input');
const termBtnsBoxElem = document.getElementById('term_buttons');
const jokeListElem = document.getElementById('joke_list');

// Initialize global array for local storage terms
let searchTerms = [];

// Initialize global array for terms used this session
let termsSearched = [];

//////////////////////// Functions

//// Local storage functions

const getLocalStorageTerms = () => {
  // Get local storage terms
  const localStorageTerms = localStorage.getItem('jokeSearchTerms');
  // If terms are found, set searchTerms array to local storage
  if (localStorageTerms) {
    searchTerms = JSON.parse(localStorageTerms);
    renderTermBtns();
  }
}

const addTermToLocalStorage = (term) => {
  // Add the term to the end of the terms array
  searchTerms.push(term);
  // Set the stringified terms array to localStorage
  localStorage.setItem('jokeSearchTerms', JSON.stringify(searchTerms));
}

const removeTermFromLocalStorage = (term) => {
  // set the search terms array to filter out term
  searchTerms = searchTerms.filter(item => item !== term);
  // Set the stringified terms array to localStorage
  localStorage.setItem('jokeSearchTerms', JSON.stringify(searchTerms));
}

//// Random dad joke functions

const getRandomDadJoke = () => {
  // Fetch random dad joke, necassary to set headers to accept json
  fetch(randomJokeEndpoint, { headers: { 'Accept': 'application/json' } })
    // Convert json
    .then(response => response.json())
    // Render the random joke
    .then(data => renderRandomJoke(data.joke))
    // Catch error if fetch fails
    .catch(error => {
      console.log(error);
      // Render error message
      renderErrorMessage('Couldn\'t get a random joke');
    })
}

const renderRandomJoke = (joke) => {
  // Initialize empty h4 element 
  const h4Elem = document.createElement('h4');
  // Use the incoming joke as text content
  h4Elem.textContent = joke;
  // Render random joke in blockqoute section
  randomJokeElem.append(h4Elem);
}

const getAnotherRandomJoke = () => {
  // Remove current rendered joke
  randomJokeElem.removeChild(randomJokeElem.childNodes[0]);
  // Run function to get random joke
  getRandomDadJoke();
}

//// Search dad jokes functions

const searchDadJokes = (event) => {
  // prevent default form submitting behavior
  event.preventDefault();
  // Get variable for input value
  const term = searchInputElem.value;

  // Check if term input is empty and return with message
  if (!term) {
    // Render error message
    renderErrorMessage('You didn\'t enter any terms');
    // Exit function
    return;
  } else if (termsSearched.includes(term)) {
    // Else if terms searched array includes term, render error message
    renderErrorMessage('That term was already searched');
  } else {
    // Add term to array for searches this session
    termsSearched.push(term);
    // Fetch jokes based on searched term
    getSearchedJokes(term);
  }
  // Empty the input
  searchInputElem.value = '';
}

const getSearchedJokes = (term) => {
  // Use search API and query terms to build endpoint URL
  const queryEndpoint = `${searchJokesEndpoint}?term=${term}`;

  // Fetch the jokes, necassary to set headers to accept json
  fetch(queryEndpoint, { headers: { 'Accept': 'application/json' } })
    // Convert json
    .then(response => response.json())
    .then(data => {
      // Check if results are empty and return with message
      if (!data.results.length) {
        // Render error message
        renderErrorMessage('No jokes found for that term');
        // Exit function
        return;
      }

      // Check that term isn't a duplicate in storage
      if (!searchTerms.includes(term)) {
        // Add search term to local storage
        addTermToLocalStorage(term);
      }
      // If results aren't empty, render jokes
      renderJokeList(data.results);
    })
    // Catch error if fetch fails
    .catch(error => {
      console.log(error);
      // Render error message
      renderErrorMessage('Failure retrieving jokes');
    })
}

const renderTermBtns = () => {
  // Loop search terms to get each term previously used
  for (let term of searchTerms) {
    // Initialize empty button element 
    const buttonElem = document.createElement('button');
    // Add Materialize CSS classes to the button
    buttonElem.setAttribute('class', 'btn-small pink lighten-3 teal-text text-darken-2');
    // Add data attribute to store term info
    buttonElem.dataset.term = term;
    // Set the inner HTML with term text and a 'close' icon
    buttonElem.innerHTML = `${term} <i class="material-icons right">close</i>`;
    // Append the button to the term buttons box
    termBtnsBoxElem.append(buttonElem);
    // Add event listener to button
    buttonElem.addEventListener('click', searchPreviousTerm);
  }
}

const searchPreviousTerm = (event) => {
  // Initialize term to be assigned when we verify target clicked
  let term;
  // Get the element clicked
  const targetClicked = event.target;
  // If target matches button, perform search of that term
  if (targetClicked.matches('button')) {
    // Set term to data attribute
    term = targetClicked.dataset.term;
    // Check if 
    if (!termsSearched.includes(term)) {
      // Add term to array for searches this session
      termsSearched.push(term);
      // Fetch jokes based on term
      getSearchedJokes(term);
    } else {
      // Else terms searched array includes term, so render error message
      renderErrorMessage('That term was already searched');
    }
    // Change button display to none
    targetClicked.classList.add('display-none');
  } else {
    // Set term to parent node data attribute
    term = targetClicked.parentNode.dataset.term;
    // Else we assume the 'X' was clicked and remove that term from local storage
    removeTermFromLocalStorage(term);
    // Change parent button display to none
    targetClicked.parentNode.classList.add('display-none');
  }
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

//// Render error messages function

const renderErrorMessage = (message) => {
  // Use a Materialize CSS toast component to render error message
  M.toast({
    html: `<i class="material-icons left">warning</i> ${message}`,
    classes: 'pink darken-2',
    displayLength: 2000
  })
}

//////////////////////// Event Listeners

searchFormElem.addEventListener('submit', searchDadJokes);

jokeButtonElem.addEventListener('click', getAnotherRandomJoke);

//////////////////////// Init

getRandomDadJoke();

getLocalStorageTerms();