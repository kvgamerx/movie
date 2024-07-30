const parentElement = document.querySelector(".main");
const searchInput = document.querySelector(".input");
const movieRatings = document.querySelector("#rating-select");
const movieGenres = document.querySelector("#genre-select");

let searchValue = "";
let ratings = 0;
let genre = "";
let filteredArrOfMovies = [];
let genreMap = {};

const MOVIE_URL = "https://api.themoviedb.org/3/movie/popular";
const GENRE_URL = "https://api.themoviedb.org/3/genre/movie/list";

const options = {
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxY2MyNzM3NWUyMWVmZTY3OWFkMjM2ZmJkNjlmODQzMSIsIm5iZiI6MTcyMjM2Njk5MC42NTE2NjYsInN1YiI6IjY2YTkzOGI3ZTc0Y2Y3Yjc2NGViYzg4ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rsifCW6W3gPiThYQhgbu0f6GBWEU95zynJBotf_aNOU'
  }
};

const getMovies = async (url) => {
  try {
    const { data } = await axios.get(url, options);
    return data.results;
  } catch (err) {
    console.error(err);
  }
};

const getGenres = async (url) => {
  try {
    const { data } = await axios.get(url, options);
    return data.genres;
  } catch (err) {
    console.error(err);
  }
};

const genres = await getGenres(GENRE_URL);
genres.forEach(genre => {
  genreMap[genre.id] = genre.name;
});

let movies = await getMovies(MOVIE_URL);
console.log(movies);

const createElement = (element) => document.createElement(element);

const createMovieCard = (movies) => {
  for (let movie of movies) {
    const cardContainer = createElement("div");
    cardContainer.classList.add("card", "shadow");

    const imageContainer = createElement("div");
    imageContainer.classList.add("card-image-container");

    const imageEle = createElement("img");
    imageEle.classList.add("card-image");
    imageEle.setAttribute("src", `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`);
    imageEle.setAttribute("alt", movie.title);
    imageContainer.appendChild(imageEle);

    cardContainer.appendChild(imageContainer);

    const cardDetails = createElement("div");
    cardDetails.classList.add("movie-details");

    const titleEle = createElement("p");
    titleEle.classList.add("title");
    titleEle.innerText = movie.title;
    cardDetails.appendChild(titleEle);

    const genreEle = createElement("p");
    genreEle.classList.add("genre");
    const genreNames = movie.genre_ids.map(id => genreMap[id]).join(", ");
    genreEle.innerText = `Genre: ${genreNames}`;
    cardDetails.appendChild(genreEle);

    const movieRating = createElement("div");
    movieRating.classList.add("ratings");

    const ratings = createElement("div");
    ratings.classList.add("star-rating");

    const starIcon = createElement("span");
    starIcon.classList.add("material-icons-outlined");
    starIcon.innerText = "star";
    ratings.appendChild(starIcon);

    const ratingValue = createElement("span");
    ratingValue.innerText = movie.vote_average;
    ratings.appendChild(ratingValue);

    movieRating.appendChild(ratings);

    const length = createElement("p");
    length.innerText = `${movie.runtime} mins`;

    movieRating.appendChild(length);
    cardDetails.appendChild(movieRating);
    cardContainer.appendChild(cardDetails);

    parentElement.appendChild(cardContainer);
  }
};

function getFilteredData() {
  filteredArrOfMovies = searchValue?.length > 0
    ? movies.filter(movie =>
        movie.title.toLowerCase().includes(searchValue) ||
        movie.original_title.toLowerCase().includes(searchValue))
    : movies;

  if (ratings > 0) {
    filteredArrOfMovies = filteredArrOfMovies.filter(movie => movie.vote_average >= ratings);
  }

  if (genre?.length > 0) {
    filteredArrOfMovies = filteredArrOfMovies.filter(movie => {
      const genreNames = movie.genre_ids.map(id => genreMap[id]);
      return genreNames.includes(genre);
    });
  }

  return filteredArrOfMovies;
}

function handleSearch(event) {
  searchValue = event.target.value.toLowerCase();
  let filterBySearch = getFilteredData();
  parentElement.innerHTML = "";
  createMovieCard(filterBySearch);
}

function debounce(callback, delay) {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function handleRatingSelector(event) {
  ratings = Number(event.target.value);
  let filterByRating = getFilteredData();
  parentElement.innerHTML = "";
  createMovieCard(ratings ? filterByRating : movies);
}

const debounceInput = debounce(handleSearch, 500);

searchInput.addEventListener("keyup", debounceInput);
movieRatings.addEventListener("change", handleRatingSelector);

const genreNames = genres.map(genre => genre.name);

for (let genre of genreNames) {
  const option = createElement("option");
  option.classList.add("option");
  option.setAttribute("value", genre);
  option.innerText = genre;
  movieGenres.appendChild(option);
}

function handleGenreSelect(event) {
  genre = event.target.value;
  const filteredMoviesByGenre = getFilteredData();
  parentElement.innerHTML = "";
  createMovieCard(genre ? filteredMoviesByGenre : movies);
}

movieGenres.addEventListener("change", handleGenreSelect);

createMovieCard(movies);
