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

fetchData(listOfCategoriesEndpoint);

async function loadCategories() {}
