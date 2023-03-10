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
  // Render success message
  renderFeedbackMessage('success', 'Term was added to memory')
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
      renderFeedbackMessage('error', 'Couldn\'t get a random joke');
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
    renderFeedbackMessage('error', 'You didn\'t enter any terms');
    // Exit function
    return;
  } else if (termsSearched.includes(term)) {
    // Else if terms searched array includes term, render error message
    renderFeedbackMessage('error', 'Term was already searched');
  } else {
    // Else add term to array for searches this session
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
        renderFeedbackMessage('error', 'No jokes found for that term');
        // Exit function
        return;
      }

      // Check that term isn't a duplicate in storage
      if (!searchTerms.includes(term)) {
        // Add search term to local storage
        addTermToLocalStorage(term);
      }
      // If results aren't empty, render jokes
      renderJokeList(term, data.results);
      // Scroll to newly rendered jokes
      document.querySelector(`#${term}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    // Catch error if fetch fails
    .catch(error => {
      console.log(error);
      // Render error message
      renderFeedbackMessage('error', 'Failure retrieving jokes');
    })
}

const renderTermBtns = () => {
  // Loop search terms to get each term previously used
  for (let term of searchTerms) {
    // Initialize empty button element 
    const buttonElem = document.createElement('button');
    // Add Materialize CSS classes to the button
    buttonElem.setAttribute('class', 'btn-small pink lighten-3 teal-text text-darken-2 right');
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
      renderFeedbackMessage('error', 'Term was already searched');
    }
    // Change button display to none
    targetClicked.classList.add('display-none');
  } else {
    // Set term to parent node data attribute
    term = targetClicked.parentNode.dataset.term;
    // Else we assume the 'X' was clicked and remove that term from local storage
    removeTermFromLocalStorage(term);
    // Render success message
    renderFeedbackMessage('success', 'Term removed from memory')
    // Change parent button display to none
    targetClicked.parentNode.classList.add('display-none');
  }
}

const renderJokeList = (term, jokesArray) => {
  // Run term through render function, with heading argument provided
  renderListItem(term, true);
  // Map through joke objects, deconstructing 'joke' property
  jokesArray.map(({ joke }) => {
    // Run joke through render function
    renderListItem(joke);
  })
}

const renderListItem = (joke, heading = false) => {
  // Initialize empty li element 
  const liElem = document.createElement('li');
  // Add Materialize CSS class for styling
  liElem.classList.add('collection-item');

  // Check if heading variable entered
  if (heading) {
    // Switch 'joke' to 'term' variable for clarity
    const term = joke;
    // Create variable to capitalize term
    const capitalizedTerm = `${term[0].toUpperCase()}${term.slice(1, term.length)}`;
    // Initialize empty h3 element 
    const h4Elem = document.createElement('h4');
    // Add Materialize CSS class for styling
    h4Elem.classList.add('teal-text');
    // Use the incoming term as text content
    h4Elem.id = term;
    // Use the incoming term as text content
    h4Elem.textContent = `${capitalizedTerm} Jokes`;
    // Append h4 to li
    liElem.append(h4Elem);
  } else {
    // Initialize empty h5 element 
    const h5Elem = document.createElement('h5');
    // Add Materialize CSS class for styling
    h5Elem.classList.add('teal-text');
    // Use the incoming joke as text content
    h5Elem.textContent = joke;
    // Append h5 to li
    liElem.append(h5Elem);
  }

  // Render random joke in joke list ul element
  jokeListElem.append(liElem);
}

//// Render feedback messages function

const renderFeedbackMessage = (type, message) => {
  // Initialize variables and set icon and color based on type
  let icon, color;
  if (type === 'success') {
    icon = 'check_circle';
    color = 'green darken-2';
  } else if (type === 'error') {
    icon = 'warning';
    color = 'pink darken-1';
  }
  // Use a Materialize CSS toast component to render error message
  M.toast({
    html: `<i class="material-icons left">${icon}</i> ${message}`,
    classes: color,
    displayLength: 2000
  })
}

//////////////////////// Event Listeners

searchFormElem.addEventListener('submit', searchDadJokes);

jokeButtonElem.addEventListener('click', getAnotherRandomJoke);

//////////////////////// Init

getRandomDadJoke();

getLocalStorageTerms();