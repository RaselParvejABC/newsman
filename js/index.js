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

//Show Network Error Modal
function showNetworkErrorModal() {
  new bootstrap.Modal("#network-error-modal").show();
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
    if (!responseBody["status"]) {
      throw new Error("Status False");
    }
    return responseBody["data"];
  } catch (error) {
    console.log(error);
    showNetworkErrorModal();
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
    const categories = await loadCategories();
    categories.forEach((category) => {
      newsCategoriesElement.insertAdjacentHTML(
        "beforeend",
        `
          <div class="border rounded category" data-id="${category["category_id"]}">
            ${category["category_name"]}
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
        newsSpinner.classList.toggle("d-none");
        foundNumberAndCategoryElement.classList.toggle("d-none");
        newsCardsElement.classList.toggle("d-none");

        const categoryID = this.dataset.id;
        const arrayOfNews = await fetchData(
          `${allNewsOfACategoryEndpoint}${categoryID}`
        );
        console.log(arrayOfNews);
        // After Data Received
        newsSpinner.classList.toggle("d-none");
        foundNumberAndCategoryElement.classList.toggle("d-none");
        newsCardsElement.classList.toggle("d-none");
        // Setting Number of Found News in the Selected Category
        numberOfFoundNewsElement.textContent = arrayOfNews.length && "NO";
        foundNewsInCategoryElement.textContent = this.textContent;
      } catch (error) {}
    });
  });
}
