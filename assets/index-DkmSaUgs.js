(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const ErrorMessage = Object.freeze({
  API_CLIENT: "통신 과정에서 예기치 못한 오류가 발생했습니다.",
  FETCH_POPULAR_MOVIES: "영화 정보를 가져오는 중 문제가 발생했습니다.",
  FETCH_SEARCH_MOVIES: "검색 결과를 가져오는 중 문제가 발생했습니다."
});
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5Y2FiYzVjOWI4MDQ0NzkxOTNlNjcxZWI3MGNkYmM4MCIsIm5iZiI6MTc0MjI4MDA1MC4yMTcsInN1YiI6IjY3ZDkxNTcyYmI0MzM5NTFhNzM2NTc0OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2p_rhuPqzjt0xD_54oPVk0UG5i4DfsWZ2oG_PGhgnx8";
const BASE_URL = "https://api.themoviedb.org/3";
const POSTER_IMG_PREFIX = "https://media.themoviedb.org/t/p/w440_and_h660_face";
const BACKDROP_IMG_PREFIX = "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces";
const ApiClient = {
  async get(endpoint, headers = {}) {
    return this.request("GET", endpoint, headers);
  },
  async request(method, endpoint, headers = {}) {
    const url = BASE_URL + endpoint;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`,
        ...headers
      }
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || ErrorMessage.API_CLIENT);
      }
      return data;
    } catch (error) {
      throw error;
    }
  }
};
async function fetchPopularMovies(pageNumber2) {
  const params = new URLSearchParams({
    page: pageNumber2.toString(),
    language: "ko-KR",
    region: "KR"
  });
  try {
    const TMDB_movieList = await ApiClient.get(
      "/movie/popular?" + params.toString()
    );
    const movies = TMDB_movieList.results.map(
      ({ id, backdrop_path, poster_path, vote_average, title }) => {
        return {
          id,
          backdropPath: backdrop_path,
          posterPath: poster_path,
          rate: vote_average,
          title
        };
      }
    );
    return { movies, canMore: TMDB_movieList.total_pages > pageNumber2 };
  } catch (error) {
    if (error instanceof Error)
      throw new Error(ErrorMessage.FETCH_POPULAR_MOVIES || error.message);
  }
}
async function fetchSearchMovies(query, pageNumber2) {
  const params = new URLSearchParams({
    page: pageNumber2.toString(),
    query,
    language: "ko-KR",
    region: "KR"
  });
  try {
    const TMDB_movieList = await ApiClient.get(
      "/search/movie?" + params.toString()
    );
    const movies = TMDB_movieList.results.map(
      ({ id, backdrop_path, poster_path, vote_average, title }) => {
        return {
          id,
          backdropPath: backdrop_path,
          posterPath: poster_path,
          rate: vote_average,
          title
        };
      }
    );
    return { movies, canMore: TMDB_movieList.total_pages > pageNumber2 };
  } catch (error) {
    if (error instanceof Error)
      throw new Error(ErrorMessage.FETCH_SEARCH_MOVIES || error.message);
  }
}
const toggleVisibility = (element, option) => {
  if (option === "show") element.classList.remove("hidden");
  if (option === "hidden") element.classList.add("hidden");
};
const $ = (selector, ancestor = document) => {
  const element = ancestor.querySelector(selector);
  if (!element) {
    throw new Error(`selector가 ${selector}인 엘리먼트를 찾을 수 없습니다.`);
  }
  return element;
};
const $backgroundContainer = $(".background-container");
const $overlay = $(".overlay");
const $topRatedMovie = $(".top-rated-movie");
const $rate = $(".rate-value");
const $headerTitle = $(".top-rated-movie .title");
const $logo = $(".logo > img");
const $searchInput = $(".search-bar");
const $searchButton = $("img#search");
const Header = {
  init({ id, posterPath, rate, title }) {
    $logo.addEventListener("click", () => location.reload());
    this.setTitle({ id, posterPath, rate, title });
  },
  setTitle({ id, posterPath, rate, title }) {
    $overlay.style.backgroundImage = `url(${BACKDROP_IMG_PREFIX + posterPath})`;
    $rate.textContent = rate.toFixed(1);
    $headerTitle.textContent = title;
  },
  setSearchMode() {
    $backgroundContainer.style.height = "auto";
    toggleVisibility($overlay, "hidden");
    toggleVisibility($topRatedMovie, "hidden");
  }
};
const SearchInput = {
  init() {
    const keydownHandler = (e) => this.checkEnterEventHandler(e);
    $searchInput.onfocus = () => {
      addEventListener("keydown", keydownHandler);
    };
    $searchInput.onblur = () => {
      removeEventListener("keydown", keydownHandler);
    };
    $searchButton.addEventListener("click", (e) => this.onButtonClick(e));
  },
  getSearchValue() {
    return $searchInput.value;
  },
  onButtonClick(event) {
    console.log(event.target, "onButtonClick 기능 미구현");
  },
  checkEnterEventHandler(event) {
    if (event.key !== "Enter") return;
    this.onEnterKeydown(event);
  },
  onEnterKeydown(event) {
    console.log(event.target, "onEnterKeydown 기능 미구현");
  }
};
const MovieItem = {
  create({ id, posterPath, rate, title }) {
    const movieItemElement = document.createElement("li");
    movieItemElement.dataset.id = id.toString();
    const content = (
      /*html*/
      `
        <div class="item">
            <img
            class="thumbnail"
            src=${POSTER_IMG_PREFIX + posterPath}
            onerror="this.src='./images/null_image.png'"
            alt=${title}
            />
            <div class="item-desc">
            <p class="rate">
                <img src="./images/star_empty.png" class="star" /><span
                >${rate.toFixed(1)}</span
                >
            </p>
            <strong>${title}</strong>
            </div>
        </div>
    `
    );
    movieItemElement.insertAdjacentHTML("beforeend", content);
    return movieItemElement;
  }
};
const $movieListContainer = $("ul.thumbnail-list");
const MovieList = {
  async init(movieList) {
    try {
      this.set(movieList);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
  },
  set(movieList) {
    $movieListContainer.replaceChildren();
    this.add(movieList);
  },
  add(movieList) {
    movieList.map((movieItem) => MovieItem.create(movieItem)).forEach((movieItem) => $movieListContainer.appendChild(movieItem));
  }
};
const $noThumbnail = $(".no-thumbnail");
const NoThumbnail = {
  show() {
    toggleVisibility($noThumbnail, "show");
  },
  hidden() {
    toggleVisibility($noThumbnail, "hidden");
  }
};
const $seeMoreButton = $("button#seeMore");
const SeeMoreButton = {
  init() {
    $seeMoreButton.addEventListener("click", (e) => this.onButtonClick(e));
  },
  onButtonClick(event) {
    console.log(event.target, "onButtonClick 기능 미구현");
  },
  show() {
    toggleVisibility($seeMoreButton, "show");
  },
  hidden() {
    toggleVisibility($seeMoreButton, "hidden");
  }
};
const $skeletonList = $(".skeleton-list");
const Skeleton = {
  init() {
    Array.from({ length: 20 }).forEach(
      () => $skeletonList.appendChild(this.createItem())
    );
  },
  createItem() {
    const skeletonItemElement = document.createElement("li");
    const content = (
      /*html*/
      `
        <div class="item">
            <div
            class="thumbnail"
            ></div>
        </div>
    `
    );
    skeletonItemElement.insertAdjacentHTML("beforeend", content);
    return skeletonItemElement;
  },
  show() {
    toggleVisibility($skeletonList, "show");
  },
  hidden() {
    toggleVisibility($skeletonList, "hidden");
  }
};
const $subtitle = $(".subtitle");
const Subtitle = {
  init() {
    this.set("지금 있기 있는 영화");
  },
  set(text) {
    $subtitle.textContent = text;
  }
};
let pageNumber = 1;
addEventListener("load", async () => {
  try {
    const { movies, canMore } = await getPopularMovieList();
    Header.init({
      id: movies[0].id,
      title: movies[0].title,
      posterPath: movies[0].backdropPath || "",
      rate: movies[0].rate
    });
    SearchInput.init();
    SearchInput.onButtonClick = async () => search();
    SearchInput.onEnterKeydown = async () => search();
    Subtitle.init();
    MovieList.init(movies);
    Skeleton.init();
    SeeMoreButton.init();
    SeeMoreButton.show();
    SeeMoreButton.onButtonClick = async () => {
      Skeleton.show();
      const { movies: movies2, canMore: canMore2 } = await getPopularMovieList();
      if (!canMore2) SeeMoreButton.hidden();
      MovieList.add(movies2);
      Skeleton.hidden();
    };
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  }
});
async function getPopularMovieList() {
  const movieList = await fetchPopularMovies(pageNumber);
  pageNumber += 1;
  if (!movieList) throw new Error(ErrorMessage.FETCH_POPULAR_MOVIES);
  return movieList;
}
async function getSearchMovieList(query) {
  const movieList = await fetchSearchMovies(query, pageNumber);
  pageNumber += 1;
  if (!movieList) throw new Error(ErrorMessage.FETCH_POPULAR_MOVIES);
  return movieList;
}
async function search() {
  Header.setSearchMode();
  NoThumbnail.hidden();
  MovieList.init([]);
  SeeMoreButton.show();
  pageNumber = 1;
  Skeleton.show();
  const query = SearchInput.getSearchValue();
  const { movies, canMore } = await getSearchMovieList(query);
  Subtitle.set(`"${query}" 검색 결과`);
  Skeleton.hidden();
  MovieList.set(movies);
  if (!canMore) SeeMoreButton.hidden();
  if (movies.length === 0) {
    NoThumbnail.show();
    return;
  }
  SeeMoreButton.onButtonClick = async () => {
    Skeleton.show();
    const { movies: movies2, canMore: canMore2 } = await getSearchMovieList(query);
    if (!canMore2) SeeMoreButton.hidden();
    MovieList.add(movies2);
    Skeleton.hidden();
  };
}
