var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _title, _rate, _posterPath, _element, _SearchBar_instances, getInputElement_fn, getImageButton_fn, handleEnterKeyDown_fn, changeTitleStyle_fn, renderSearchResult_fn, getSearchResult_fn, _SkeletonUl_instances, createSkeletonLi_fn, _id, _title2, _onClick, _type;
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
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5Y2FiYzVjOWI4MDQ0NzkxOTNlNjcxZWI3MGNkYmM4MCIsIm5iZiI6MTc0MjI4MDA1MC4yMTcsInN1YiI6IjY3ZDkxNTcyYmI0MzM5NTFhNzM2NTc0OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2p_rhuPqzjt0xD_54oPVk0UG5i4DfsWZ2oG_PGhgnx8";
const ERROR = {
  FAIL_CONNECT: `서버와의 통신에 실패했습니다. 다시 시도해주세요.`
};
const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};
const GETWithAuth = async (url) => {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};
const api = {
  async getMovieData(pageNumber) {
    const url = `https://api.themoviedb.org/3/movie/popular?language=ko-KR&region=KR&page=${pageNumber}`;
    try {
      return await GETWithAuth(url);
    } catch (error) {
      if (error instanceof Error) throw new Error(ERROR.FAIL_CONNECT);
    }
  },
  async getSearchData(pageNumber, query) {
    const url = `https://api.themoviedb.org/3/search/movie?page=${pageNumber}&query=${query}&language=ko-KR`;
    try {
      return await GETWithAuth(url);
    } catch (error) {
      if (error instanceof Error) throw new Error(ERROR.FAIL_CONNECT);
    }
  }
};
const IMG_PREFIX = "https://media.themoviedb.org/t/p/w440_and_h660_face";
const BACKDROP_IMG_PREFIX = "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces";
const MOVIE_AMOUNT_IN_PAGE = 20;
class MovieItem {
  constructor({ title, vote_average, poster_path }) {
    __privateAdd(this, _title);
    __privateAdd(this, _rate);
    __privateAdd(this, _posterPath);
    __privateSet(this, _title, title);
    __privateSet(this, _rate, vote_average);
    __privateSet(this, _posterPath, poster_path);
  }
  create() {
    const movieItemElement = document.createElement("li");
    const content = (
      /*html*/
      `
    <div class="item">
        <img
        class="thumbnail"
        src=${IMG_PREFIX + __privateGet(this, _posterPath)}
        onload="this.src='${IMG_PREFIX + __privateGet(this, _posterPath)}"
        onerror="this.src='./images/null_image.png'"
        alt=${__privateGet(this, _title)}
        />
        <div class="item-desc">
        <p class="rate">
            <img src="./images/star_empty.png" class="star" /><span>${__privateGet(this, _rate)}</span>
        </p>
        <strong>${__privateGet(this, _title)}</strong>
        </div>
    </div>
    `
    );
    movieItemElement.insertAdjacentHTML("beforeend", content);
    return movieItemElement;
  }
}
_title = new WeakMap();
_rate = new WeakMap();
_posterPath = new WeakMap();
const DOM = {
  $noThumbnail: document.querySelector(".no-thumbnail")
};
const toggleVisibility = (element, option) => {
  if (option === "show") element == null ? void 0 : element.classList.remove("hidden");
  if (option === "hidden") element == null ? void 0 : element.classList.add("hidden");
};
class SearchBar {
  constructor() {
    __privateAdd(this, _SearchBar_instances);
    __privateAdd(this, _element);
    __privateSet(this, _element, document.createElement("div"));
  }
  create() {
    __privateGet(this, _element).classList.add("search-container");
    __privateGet(this, _element).appendChild(__privateMethod(this, _SearchBar_instances, getInputElement_fn).call(this));
    __privateGet(this, _element).appendChild(__privateMethod(this, _SearchBar_instances, getImageButton_fn).call(this));
    return __privateGet(this, _element);
  }
  async onSearchClick() {
    const searchBar2 = document.querySelector(".search-bar");
    const thumbnailList2 = document.querySelector("ul.thumbnail-list");
    const query = searchBar2.value;
    const seeMoreButton2 = document.querySelector(
      "#seeMore"
    );
    __privateMethod(this, _SearchBar_instances, changeTitleStyle_fn).call(this, query);
    toggleVisibility(DOM.$noThumbnail, "hidden");
    thumbnailList2 == null ? void 0 : thumbnailList2.replaceChildren();
    await __privateMethod(this, _SearchBar_instances, renderSearchResult_fn).call(this, query);
    seeMoreButton2.onclick = async () => {
      await __privateMethod(this, _SearchBar_instances, renderSearchResult_fn).call(this, query);
    };
  }
}
_element = new WeakMap();
_SearchBar_instances = new WeakSet();
getInputElement_fn = function() {
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.classList.add("search-bar");
  searchInput.placeholder = "검색어를 입력하세요";
  searchInput.onfocus = () => {
    window.addEventListener("keydown", (e) => __privateMethod(this, _SearchBar_instances, handleEnterKeyDown_fn).call(this, e));
  };
  searchInput.onblur = () => {
    window.removeEventListener("keydown", (e) => __privateMethod(this, _SearchBar_instances, handleEnterKeyDown_fn).call(this, e));
  };
  return searchInput;
};
getImageButton_fn = function() {
  const imgButton = document.createElement("img");
  imgButton.id = "search";
  imgButton.src = "./images/search_button.png";
  imgButton.alt = "SearchButton";
  imgButton.onclick = () => this.onSearchClick();
  return imgButton;
};
handleEnterKeyDown_fn = function(event) {
  if (event.key === "Enter") {
    this.onSearchClick();
  }
};
changeTitleStyle_fn = function(query) {
  const overlay = document.querySelector(".overlay");
  const topRatedContainer = document.querySelector(
    ".top-rated-movie"
  );
  const backgroundContainer = document.querySelector(
    ".background-container"
  );
  const subTitle = document.querySelector(".subTitle");
  subTitle.textContent = `"${query}" 검색 결과`;
  overlay.style.display = "none";
  topRatedContainer.style.display = "none";
  backgroundContainer.style.height = "auto";
};
renderSearchResult_fn = async function(query) {
  const thumbnailList2 = document.querySelector("ul.thumbnail-list");
  const itemCount = document.querySelectorAll("ul.thumbnail-list li").length;
  const pageNumber = itemCount / MOVIE_AMOUNT_IN_PAGE + 1;
  const seeMoreButton2 = document.querySelector("#seeMore");
  const skeletonUlElement = document.querySelector(".skeleton-list");
  toggleVisibility(skeletonUlElement, "show");
  toggleVisibility(seeMoreButton2, "hidden");
  const searchResult = await __privateMethod(this, _SearchBar_instances, getSearchResult_fn).call(this, pageNumber, query);
  if (searchResult && pageNumber < searchResult.total_pages)
    toggleVisibility(seeMoreButton2, "show");
  if (searchResult && searchResult.total_results === 0)
    toggleVisibility(DOM.$noThumbnail, "show");
  toggleVisibility(skeletonUlElement, "hidden");
  searchResult == null ? void 0 : searchResult.results.forEach(({ title, poster_path, vote_average }) => {
    const movieItem = new MovieItem({
      title,
      vote_average,
      poster_path
    });
    const movieItemElement = movieItem.create();
    thumbnailList2 == null ? void 0 : thumbnailList2.appendChild(movieItemElement);
  });
};
getSearchResult_fn = async function(pageNumber, query) {
  try {
    return await api.getSearchData(pageNumber, query);
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  }
};
class SkeletonUl {
  constructor() {
    __privateAdd(this, _SkeletonUl_instances);
  }
  create() {
    const skeletonUlElement = document.createElement("ul");
    skeletonUlElement.classList.add("skeleton-list");
    Array.from({ length: MOVIE_AMOUNT_IN_PAGE }).forEach(
      () => skeletonUlElement.appendChild(__privateMethod(this, _SkeletonUl_instances, createSkeletonLi_fn).call(this))
    );
    return skeletonUlElement;
  }
}
_SkeletonUl_instances = new WeakSet();
createSkeletonLi_fn = function() {
  const skeletonLiElement = document.createElement("li");
  const content = (
    /*html*/
    `
    <div class="item skeleton-item">
      <div class="thumbnail"></div>
    </div>
    `
  );
  skeletonLiElement.insertAdjacentHTML("beforeend", content);
  return skeletonLiElement;
};
class TextButton {
  constructor({ id, title, onClick, type }) {
    __privateAdd(this, _id);
    __privateAdd(this, _title2);
    __privateAdd(this, _onClick);
    __privateAdd(this, _type);
    __privateSet(this, _id, id);
    __privateSet(this, _title2, title);
    __privateSet(this, _onClick, onClick);
    __privateSet(this, _type, type);
  }
  create() {
    const buttonElement = document.createElement("button");
    buttonElement.id = __privateGet(this, _id);
    buttonElement.classList.add(__privateGet(this, _type));
    buttonElement.textContent = __privateGet(this, _title2);
    buttonElement.onclick = __privateGet(this, _onClick);
    return buttonElement;
  }
}
_id = new WeakMap();
_title2 = new WeakMap();
_onClick = new WeakMap();
_type = new WeakMap();
const thumbnailList = document.querySelector("ul.thumbnail-list");
const mainSection = document.querySelector("main section");
const skeletonUl = new SkeletonUl();
const seeMoreButton = new TextButton({
  id: "seeMore",
  title: "더보기",
  onClick: renderMovieData,
  type: "primary"
});
const searchBar = new SearchBar();
const logo = document.querySelector(".logo");
const logoImage = document.querySelector(".logo img");
renderTitleMovie();
logoImage == null ? void 0 : logoImage.addEventListener("click", () => {
  window.location.reload();
});
logo == null ? void 0 : logo.appendChild(searchBar.create());
mainSection == null ? void 0 : mainSection.appendChild(skeletonUl.create());
mainSection == null ? void 0 : mainSection.appendChild(seeMoreButton.create());
renderMovieData();
async function getMovieData() {
  const itemCount = document.querySelectorAll("ul.thumbnail-list li").length;
  const pageNumber = itemCount / MOVIE_AMOUNT_IN_PAGE + 1;
  try {
    return await api.getMovieData(pageNumber);
  } catch (error) {
    if (error instanceof Error) alert(error.message);
  }
}
async function renderTitleMovie() {
  var _a;
  const topMovieData = (_a = await getMovieData()) == null ? void 0 : _a.results[0];
  const movieTitle = topMovieData.title;
  const movieRate = topMovieData.vote_average;
  const movieBackdropUrl = BACKDROP_IMG_PREFIX + topMovieData.backdrop_path;
  const topMovieTitle = document.querySelector(
    ".top-rated-movie .title"
  );
  const topMovieRateValue = document.querySelector(
    ".top-rated-movie .rate-value"
  );
  const backgroundOverlay = document.querySelector(
    ".background-container .overlay"
  );
  topMovieTitle.textContent = movieTitle;
  topMovieRateValue.textContent = String(movieRate);
  backgroundOverlay.style.backgroundImage = `url("${movieBackdropUrl}")`;
}
async function renderMovieData() {
  var _a;
  const skeletonUlElement = document.querySelector(".skeleton-list");
  toggleVisibility(skeletonUlElement, "show");
  const movieData = (_a = await getMovieData()) == null ? void 0 : _a.results;
  movieData.forEach(({ title, poster_path, vote_average }) => {
    const movieItem = new MovieItem({ title, vote_average, poster_path });
    const movieItemElement = movieItem.create();
    thumbnailList == null ? void 0 : thumbnailList.appendChild(movieItemElement);
  });
  toggleVisibility(skeletonUlElement, "hidden");
}
