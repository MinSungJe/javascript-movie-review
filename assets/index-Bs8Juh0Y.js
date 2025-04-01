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
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
  API_CLIENT: "통신 과정에서 예기치 못한 오류가 발생했습니다.",
  FETCH_POPULAR_MOVIES: "영화 정보를 가져오는 중 문제가 발생했습니다.",
  FETCH_SEARCH_MOVIES: "검색 결과를 가져오는 중 문제가 발생했습니다.",
  FETCH_MOVIE_DETAIL: "영화 상세 정보를 가져오는 중 문제가 발생했습니다."
});
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5Y2FiYzVjOWI4MDQ0NzkxOTNlNjcxZWI3MGNkYmM4MCIsIm5iZiI6MTc0MjI4MDA1MC4yMTcsInN1YiI6IjY3ZDkxNTcyYmI0MzM5NTFhNzM2NTc0OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2p_rhuPqzjt0xD_54oPVk0UG5i4DfsWZ2oG_PGhgnx8";
const BASE_URL = "https://api.themoviedb.org/3";
const POSTER_IMG_PREFIX = "https://media.themoviedb.org/t/p/w440_and_h660_face";
const BACKDROP_IMG_PREFIX = "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces";
const DETAIL_POSTER_PREFIX = "https://image.tmdb.org/t/p/original";
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
async function fetchMovieDetail(id) {
  const params = new URLSearchParams({
    language: "ko-KR"
  });
  try {
    const TMDBMovieDetail = await ApiClient.get(
      `/movie/${id}?` + params.toString()
    );
    const movieDetail = {
      id: TMDBMovieDetail.id,
      posterPath: TMDBMovieDetail.poster_path,
      title: TMDBMovieDetail.title,
      releaseYear: TMDBMovieDetail.release_date.split("-")[0],
      category: TMDBMovieDetail.genres.map((genre) => genre.name),
      rate: TMDBMovieDetail.vote_average,
      detail: TMDBMovieDetail.overview
    };
    return movieDetail;
  } catch (error) {
    if (error instanceof Error)
      throw new Error(ErrorMessage.FETCH_MOVIE_DETAIL || error.message);
  }
}
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
const toggleDisplay = (element, isVisible) => {
  if (isVisible) element.classList.remove("hidden");
  else element.classList.add("hidden");
};
const toggleVisibility = (element, isVisible) => {
  if (isVisible) element.classList.add("active");
  else element.classList.remove("active");
};
const $ = (selector, ancestor = document) => {
  const element = ancestor.querySelector(selector);
  if (!element) {
    throw new Error(`selector가 ${selector}인 엘리먼트를 찾을 수 없습니다.`);
  }
  return element;
};
const $$ = (selector, ancestor = document) => {
  const elements = ancestor.querySelectorAll(selector);
  if (!elements) {
    throw new Error(`selector가 ${selector}인 엘리먼트들을 찾을 수 없습니다.`);
  }
  return elements;
};
const $backgroundContainer = $(".background-container");
const $overlay = $(".overlay");
const $topRatedMovie = $(".top-rated-movie");
const $rate = $(".rate-value");
const $headerTitle = $(".top-rated-movie .title");
const $headerDetailButton = $(
  ".top-rated-movie .detail"
);
const $logo = $(".logo > img");
const $searchInput = $(".search-bar");
const $searchButton = $("img#search");
const Header = {
  init({ id, posterPath, rate, title }) {
    $logo.addEventListener("click", () => location.reload());
    this.setTitle({ id, posterPath, rate, title });
  },
  setTitle({ id, posterPath, rate, title }) {
    $headerDetailButton.dataset.id = id.toString();
    $headerDetailButton.addEventListener(
      "click",
      (e) => this.onDetailButtonClick(e)
    );
    $overlay.style.backgroundImage = `url(${BACKDROP_IMG_PREFIX + posterPath})`;
    $rate.textContent = rate.toFixed(1);
    $headerTitle.textContent = title;
  },
  setSearchMode() {
    $backgroundContainer.style.height = "auto";
    toggleDisplay($overlay, false);
    toggleDisplay($topRatedMovie, false);
  },
  onDetailButtonClick(event) {
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
  },
  checkEnterEventHandler(event) {
    if (event.key !== "Enter") return;
    this.onEnterKeydown(event);
  },
  onEnterKeydown(event) {
  }
};
const setPageScroll = (isVisible) => {
  if (isVisible) document.body.style.overflowY = "auto";
  else document.body.style.overflowY = "hidden";
};
const $modalBackground = $("#modalBackground");
const $modal = $(".modal");
const $modalCloseButton = $("#closeModal");
const $modalContainer = $(".modal-container");
const escapeEventListener = (e) => {
  const targetKey = e.key;
  if (targetKey !== "Escape") return;
  Modal.hidden();
};
const Modal = {
  init() {
    $modalBackground.addEventListener("click", (e) => {
      if (e.target === $modalBackground) this.hidden();
    });
    $modalCloseButton.addEventListener("click", () => this.hidden());
  },
  reset() {
    $modalContainer.replaceChildren();
  },
  setContent(element) {
    this.reset();
    $modalContainer.appendChild(element);
  },
  show() {
    toggleVisibility($modalBackground, true);
    setPageScroll(false);
    addEventListener("keydown", escapeEventListener);
    if (window.innerWidth < 1024)
      $modal.style.animation = "modal-up 0.5s forwards";
  },
  hidden() {
    toggleVisibility($modalBackground, false);
    setPageScroll(true);
    removeEventListener("keydown", escapeEventListener);
    if (window.innerWidth < 1024) $modal.style.animation = "none";
  }
};
const MOVIE_RATE_LIST_KEY = "movieRateList";
const MOVIE_RATE_COMMENT = {
  2: "최악이예요",
  4: "별로예요",
  6: "보통이에요",
  8: "재미있어요",
  10: "명작이에요"
};
const MOVIE_NO_RATE_COMMENT = "";
const MOVIE_NO_DESCRIPTION = "이런! 아직 영화의 상세정보가 영화 정보 사이트에 등록되지 않았습니다. 🥲";
const CATEGORY_SEPARATOR = ", ";
const LocalStorage = {
  setJSON(key, JSONdata) {
    localStorage.setItem(key, JSON.stringify(JSONdata));
  },
  getJSON(key) {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    return void 0;
  }
};
const MyRateSelect = {
  create(movieId) {
    const myRateElement = document.createElement("div");
    myRateElement.classList.add("my-rate");
    const content = (
      /*html*/
      `
      <div class="star-container">
        <img data-value="2" src="./images/star_empty.png" class="star" />
        <img data-value="4" src="./images/star_empty.png" class="star" />
        <img data-value="6" src="./images/star_empty.png" class="star" />
        <img data-value="8" src="./images/star_empty.png" class="star" />
        <img data-value="10" src="./images/star_empty.png" class="star" />
      </div>
      <p class="my-rate-description">
        ${MOVIE_NO_RATE_COMMENT} <span class="my-rate-score">(-/10)</span>
      </p>
    `
    );
    myRateElement.insertAdjacentHTML("beforeend", content);
    const score = LocalStorage.getJSON(MOVIE_RATE_LIST_KEY)[movieId];
    this.set(score, myRateElement);
    this.handleClickStar(movieId, myRateElement);
    return myRateElement;
  },
  set(score = 0, myRateElement = $(".my-rate")) {
    const stars = $$(".star", myRateElement);
    stars.forEach((star) => {
      star.src = score >= Number(star.dataset.value) ? "./images/star_filled.png" : "./images/star_empty.png";
    });
    const rateDescription = $(
      ".my-rate-description",
      myRateElement
    );
    rateDescription.innerHTML = /*html*/
    `
    ${MOVIE_RATE_COMMENT[score] ?? MOVIE_NO_RATE_COMMENT} <span class="my-rate-score">(${score !== 0 ? score : "-"}/10)</span>
    `;
  },
  handleClickStar(movieId, myRateElement = $(".my-rate")) {
    const starContainer = $(".star-container", myRateElement);
    starContainer.addEventListener(
      "click",
      (e) => this.onClickStar(movieId, e)
    );
  },
  onClickStar(movieId, e) {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.classList.contains("star")) return;
    const updatedMovieRate = LocalStorage.getJSON(MOVIE_RATE_LIST_KEY);
    const score = Number(e.target.dataset.value);
    updatedMovieRate[movieId] = score;
    LocalStorage.setJSON(MOVIE_RATE_LIST_KEY, updatedMovieRate);
    this.set(score);
  }
};
const ModalDetail = {
  create({
    id,
    posterPath,
    title,
    releaseYear,
    category,
    rate,
    detail
  }) {
    const modalDetailElement = document.createElement("div");
    modalDetailElement.classList.add("modal-detail");
    const content = (
      /*html*/
      `
        <div class="modal-image">
            <img
            class="skeleton-poster"
            src=${DETAIL_POSTER_PREFIX + posterPath}
            onerror="this.onerror=null; this.src='./images/null_image.png'"
            />
        </div>
        <div class="modal-description">
            <h2>${title}</h2>
            <p class="category">
            ${releaseYear} · ${category.join(CATEGORY_SEPARATOR)}
            </p>
            <div class="rate-container">
              <p>평균</p>
              <p class="rate">
              <img src="./images/star_filled.png" class="star" /><span
                  >${rate}</span
              >
              </p>
            </div>
            <hr />
            <p class="subtitle">내 별점</p>
            <div class="my-rate-container"></div>
            <hr />
            <p class="subtitle">줄거리</p>
            <p class="detail">${detail !== "" ? detail : MOVIE_NO_DESCRIPTION}</p>
        </div>
    `
    );
    modalDetailElement.insertAdjacentHTML("beforeend", content);
    this.createMyRate(modalDetailElement, id);
    return modalDetailElement;
  },
  createMyRate(modalContainerElement, movieId) {
    var _a;
    const myRateSelect = MyRateSelect.create(movieId);
    (_a = modalContainerElement.querySelector(".my-rate-container")) == null ? void 0 : _a.appendChild(myRateSelect);
  }
};
const $modalLoadingSpinner = $(".modal-loading-spinner");
const ModalLoadingSpinner = {
  show() {
    toggleDisplay($modalLoadingSpinner, true);
  },
  hidden() {
    toggleDisplay($modalLoadingSpinner, false);
  }
};
const MovieItem = {
  create({ id, posterPath, rate, title }) {
    const movieItemElement = document.createElement("li");
    movieItemElement.addEventListener("click", (e) => this.onClickItem(e));
    movieItemElement.dataset.id = id.toString();
    const content = (
      /*html*/
      `
      <div class="item">
          <div class="item-img">
            <img
            class="thumbnail"
            src=${POSTER_IMG_PREFIX + posterPath}
            onerror="this.onerror=null; this.src='./images/null_image.png'"
            alt=${title}
            />
          </div>
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
  },
  onClickItem(event) {
  }
};
const $movieListContainer = $("ul.thumbnail-list");
const MovieList = {
  init(movieList) {
    this.set(movieList);
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
    toggleDisplay($noThumbnail, true);
  },
  hidden() {
    toggleDisplay($noThumbnail, false);
  }
};
const $observerTarget = $(".observer-target");
const ScrollObserver = {
  get() {
    const option = {
      threshold: 0.5
    };
    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.intersect();
      });
    };
    const observer = new IntersectionObserver(onIntersect, option);
    return observer;
  },
  turnOn(observer) {
    observer.observe($observerTarget);
  },
  turnOff(observer) {
    observer.unobserve($observerTarget);
  },
  intersect() {
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
    toggleDisplay($skeletonList, true);
  },
  hidden() {
    toggleDisplay($skeletonList, false);
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
const handleError = (error, customMessage) => {
  if (error instanceof Error) alert(error.message);
  else alert(ErrorMessage.UNKNOWN);
};
let pageNumber = 1;
addEventListener("load", async () => {
  try {
    if (!LocalStorage.getJSON(MOVIE_RATE_LIST_KEY))
      LocalStorage.setJSON(MOVIE_RATE_LIST_KEY, {});
    const { movies } = await getPopularMovieList();
    const observer = ScrollObserver.get();
    Modal.init();
    Header.init({
      id: movies[0].id,
      title: movies[0].title,
      posterPath: movies[0].backdropPath || "",
      rate: movies[0].rate
    });
    Header.onDetailButtonClick = (e) => showMovieDetailModal(e);
    SearchInput.init();
    SearchInput.onButtonClick = () => search(observer);
    SearchInput.onEnterKeydown = () => search(observer);
    Subtitle.init();
    MovieList.init(movies);
    MovieItem.onClickItem = (e) => showMovieDetailModal(e);
    Skeleton.init();
    ScrollObserver.intersect = () => seeMorePopularMovies(observer);
    ScrollObserver.turnOn(observer);
  } catch (error) {
    handleError(error);
  }
});
async function getPopularMovieList() {
  try {
    const movieList = await fetchPopularMovies(pageNumber);
    pageNumber += 1;
    if (!movieList) throw new Error(ErrorMessage.FETCH_POPULAR_MOVIES);
    return movieList;
  } catch (error) {
    handleError(error);
    return { movies: [], canMore: false };
  }
}
async function getSearchMovieList(query) {
  try {
    const movieList = await fetchSearchMovies(query, pageNumber);
    pageNumber += 1;
    if (!movieList) throw new Error(ErrorMessage.FETCH_POPULAR_MOVIES);
    return movieList;
  } catch (error) {
    handleError(error);
    return { movies: [], canMore: false };
  }
}
async function seeMorePopularMovies(observer) {
  Skeleton.show();
  ScrollObserver.turnOn(observer);
  try {
    const { movies, canMore } = await getPopularMovieList();
    if (!canMore) ScrollObserver.turnOff(observer);
    MovieList.add(movies);
    Skeleton.hidden();
  } catch (error) {
    handleError(error);
  }
}
async function search(observer) {
  Header.setSearchMode();
  NoThumbnail.hidden();
  MovieList.init([]);
  pageNumber = 1;
  ScrollObserver.turnOn(observer);
  Skeleton.show();
  ScrollObserver.intersect = () => seeMoreSearchMovies(query, observer);
  const query = SearchInput.getSearchValue();
  try {
    const { movies, canMore } = await getSearchMovieList(query);
    Subtitle.set(`"${query}" 검색 결과`);
    Skeleton.hidden();
    MovieList.set(movies);
    if (!canMore) ScrollObserver.turnOff(observer);
    if (movies.length === 0) {
      NoThumbnail.show();
      return;
    }
  } catch (error) {
    handleError(error);
  }
}
async function seeMoreSearchMovies(query, observer) {
  Skeleton.show();
  try {
    const { movies, canMore } = await getSearchMovieList(query);
    if (!canMore) ScrollObserver.turnOff(observer);
    MovieList.add(movies);
    Skeleton.hidden();
  } catch (error) {
    handleError(error);
  }
}
async function showMovieDetailModal(e) {
  const clickedMovieItem = e.currentTarget;
  if (!clickedMovieItem.dataset.id) return;
  Modal.show();
  ModalLoadingSpinner.show();
  Modal.reset();
  try {
    const movieDetail = await fetchMovieDetail(clickedMovieItem.dataset.id);
    if (!movieDetail) throw new Error(ErrorMessage.FETCH_MOVIE_DETAIL);
    ModalLoadingSpinner.hidden();
    Modal.setContent(
      ModalDetail.create({
        id: movieDetail.id,
        posterPath: movieDetail.posterPath,
        category: movieDetail.category,
        title: movieDetail.title,
        releaseYear: movieDetail.releaseYear,
        rate: movieDetail.rate,
        detail: movieDetail.detail
      })
    );
  } catch (error) {
    handleError(error);
  }
}
