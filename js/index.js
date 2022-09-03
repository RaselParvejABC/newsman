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
    const responseBody = await response.json();
    return responseBody["data"];
  } catch (error) {
    console.log(error);
    new bootstrap.Modal("#network-error-modal").show();
    // throw error;
  }
}

async function loadCategories() {
  const data = await fetchData(listOfCategoriesEndpoint);
  const categories = data["news_category"];
  console.log(categories);
}

loadCategories();
