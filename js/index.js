//States
let arrayOfNews = [];
let categories = [];

// Document Queries
const newsArena = document.querySelector("main#news-arena");
const newsSpinner = newsArena.querySelector("div#news-spinner");
const foundNumberAndCategoryElement = newsArena.querySelector(
  "div#number-of-found-news"
);
const newsCardsElement = newsArena.querySelector("section#news-cards");
const numberOfFoundNewsElement =
  foundNumberAndCategoryElement.querySelector("span:nth-child(1)");
const foundNewsInCategoryElement =
  foundNumberAndCategoryElement.querySelector("span:nth-child(2)");

const networkErrorModal = document.querySelector("#network-error-modal");
const newsDetailModal = document.querySelector("#news-detail-modal");

//Show Network Error Modal
function showModal(modalElement) {
  new bootstrap.Modal(modalElement, {
    backdrop: "static",
  }).show();
}

// REST API Endpoints
const listOfCategoriesEndpoint =
  "https://openapi.programming-hero.com/api/news/categories";

const allNewsOfACategoryEndpoint =
  "https://openapi.programming-hero.com/api/news/category/";

const detailOfANewsEndpoint = "https://openapi.programming-hero.com/api/news/";

// General Fetch Function

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Response Not OK");
    }
    const responseBody = await response.json();
    return responseBody["data"];
  } catch (error) {
    console.log(error);
    showModal(networkErrorModal);
    throw error;
  }
}

// Load Categories from Network

async function loadCategories() {
  const data = await fetchData(listOfCategoriesEndpoint);
  return data["news_category"];
}

// Display Categories

async function displayCategories() {
  const newsCategoriesElement = document.querySelector(
    "section#news-categories"
  );
  newsCategoriesElement.innerHTML = "";
  try {
    categories = await loadCategories();
    categories.forEach((category) => {
      newsCategoriesElement.insertAdjacentHTML(
        "beforeend",
        `
          <div>
            <div class="border rounded category p-2 m-2 m-lg-0" data-id="${category["category_id"]}">
              ${category["category_name"]}
            </div>
          </div>
        `
      );
    });

    // Registering Click Handlers for .category Elements
    registerClickHandlerForCategories();
  } catch (error) {
    newsCategoriesElement.innerHTML = `
            <p class="text-danger fw-bold fs-5 mt-2">Network Error while Loading Categories</p>
        `;
  } finally {
    document.querySelector("#category-spinner").classList.add("d-none");
    newsCardsElement.classList.remove("d-none");
  }
}

// Invoke Display Categories
displayCategories();

//Handling Click on Categories
function registerClickHandlerForCategories() {
  const categoryElements = Array.from(
    document.querySelectorAll("section#news-categories .category")
  );

  categoryElements.forEach((categoryElement) => {
    categoryElement.addEventListener("click", async function () {
      try {
        newsSpinner.classList.remove("d-none");
        foundNumberAndCategoryElement.classList.add("d-none");
        newsCardsElement.innerHTML = "";

        const categoryID = this.dataset.id;
        arrayOfNews = await fetchData(
          `${allNewsOfACategoryEndpoint}${categoryID}`
        );
        // After Data Received

        foundNumberAndCategoryElement.classList.remove("d-none");
        // Setting Number of Found News in the Selected Category
        numberOfFoundNewsElement.textContent = arrayOfNews.length || "NO";
        foundNewsInCategoryElement.textContent = this.textContent;
      } catch (error) {
        newsCardsElement.innerHTML = `
          <p class="text-danger text-center fw-bold fs-4">Network Error while Loading News</p>
        `;
        return;
      } finally {
        newsSpinner.classList.add("d-none");
      }
      showNewsCards();
    });
  });
}

function showNewsCards() {
  arrayOfNews
    .sort((a, b) => Number(b["total_view"]) - Number(a["total_view"]))
    .forEach((news) => {
      newsCardsElement.insertAdjacentHTML(
        "beforeend",
        `
        <div class="news-card bg-white my-3 p-4 row align-items-center" data-id=${
          news["_id"]
        }>
          <div class="col-lg-3 text-center my-3 my-lg-0">
            <img class="img-fluid" src=${
              news["thumbnail_url"]
            } alt="Thumbnail"/>
          </div>
          <div class="col-lg-9">
            <h5 class="fw-bold">${news["title"]}</h5>
            <p class="text-secondary">
              ${news["details"].replaceAll(/\n/g, "<br/><br/><br/>")}
            </p>
            <div class="row justify-content-between align-items-end">
              <div class="col-9 row justify-content-start align-items-center g-0">
                <div class="col-auto p-0">
                  <img class="rounded-circle img-thumbnail" src=${
                    news["author"]["img"]
                  } style="width: 4rem;"/>
                </div>
                <div class="col-auto ps-2">
                  <span>${
                    news["author"]["name"] ?? "Author Name Unavailable"
                  }</span>
                  <br/>
                  <span>${
                    news["author"]["published_date"]?.substring(0, 11) ??
                    "Publish Time Not Available"
                  }</span>
                </div>
              </div>
              <div class="col-3 text-end">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                </svg>
                <span>${news["total_view"] ?? "Read Count Unavailable"}</span>
              </div>
            </div>
          </div>
        </div>
      `
      );
    });
  registerClickHandlerForANewsCard();
}

// Handling Click on a News Card
function registerClickHandlerForANewsCard() {
  Array.from(document.querySelectorAll(".news-card")).forEach((newsCard) => {
    newsCard.addEventListener("click", async function () {
      try {
        const newsID = this.dataset.id;

        const data = await fetchData(detailOfANewsEndpoint + newsID);
        const news = data[0];

        newsDetailModal.querySelector(".news-title").textContent =
          news["title"];
        newsDetailModal.querySelector(".news-image").src = news["image_url"];
        newsDetailModal.querySelector(".news-detail").textContent =
          news["details"];
        newsDetailModal.querySelector(".news-author-image").src =
          news["author"]["img"];
        newsDetailModal.querySelector(".news-author-name").textContent =
          news["author"]["name"] ?? "Author Name Unavailable";
        newsDetailModal.querySelector(".news-publish-time").textContent =
          news["author"]["published_date"]?.substring(0, 11) ??
          "Publish Time Not Available";

        newsDetailModal.querySelector(".news-read-count").textContent =
          news["total_view"] ?? "Not Available";
        newsDetailModal.querySelector(".news-rating").textContent =
          news["rating"]["number"] ?? "Not Available";
        newsDetailModal.querySelector(".news-badge").textContent =
          news["rating"]["badge"] ?? "Not Available";
        newsDetailModal.querySelector(".news-category").textContent =
          categories[Number(news["category_id"]) - 1]["category_name"];

        if (news["others_info"]["is_todays_pick"]) {
          newsDetailModal
            .querySelector(".todays-pick")
            .classList.remove("d-none");
        } else {
          newsDetailModal.querySelector(".todays-pick").classList.add("d-none");
        }

        if (news["others_info"]["is_trending"]) {
          newsDetailModal.querySelector(".trending").classList.remove("d-none");
        } else {
          newsDetailModal.querySelector(".trending").classList.add("d-none");
        }

        showModal(newsDetailModal);
        //console.log(news);
      } catch {
        return;
      }
    });
  });
}
