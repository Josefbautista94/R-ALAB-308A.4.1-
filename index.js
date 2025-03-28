window.Buffer = require("buffer").Buffer;
import * as Carousel from "./Carousel.js";
import axios from "axios";



// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_gg8mehf3me9mhlKCmwg2Q64GKLDw1LgZrFSMzBzSNB0i4LUFlGOLUhhQOIQhIjab";
axios.defaults.baseURL = "https://api.thedogapi.com/v1"; // the base URL Axios would use
axios.defaults.headers.common["x-api-key"] = API_KEY; // using our api key from above ^^ also gets included in every request

// Request interceptor
axios.interceptors.request.use((config) => { // hooking into axios request lifecycle
  console.log("Request sent...");
  config.metadata = { startTime: new Date() }; // adding a custo, property metadata to the request
  // start time requests the exact moment the request data is made
  progressBar.style.width = "0%"; // Reset
  document.body.style.cursor = "progress";
  return config; // returns the config object that we modded so axios can continue with the request
});

// Response interceptor
axios.interceptors.response.use((response) => {
  const endTime = new Date(); // catches the current time at the moment the response is recieved 
  const duration = endTime - response.config.metadata.startTime; // subtracts the previous recorded start time from the end time
  console.log(`Request Duration: ${duration} ms`);
  document.body.style.cursor = "default";

  return response;
},
  (error) => {
    console.error("Request failed:", error);
    document.body.style.cursor = "default";

    return Promise.reject(error);
  }
);


/**
 * 1. Create an async function "initialLoad" that does the following:✅
 * - Retrieve a list of breeds from the cat API using fetch().✅
 * - Create new <options> for each of these breeds, and append them to breedSelect.✅
 *  - Each option should have a value attribute equal to the id of the breed.✅
 *  - Each option should display text equal to the name of the breed.✅
 * This function should execute immediately.✅
 */

async function initialLoad() {
  try {

    const response = await axios.get("/breeds"); // this will automatically get prepended to the base url
    const breeds = response.data; // gets the pasrsed data that was already turned into json!

    // const response = await fetch("https://api.thedogapi.com/v1/breeds"); //This line sends an HTTP GET request to The Doggy API to retrieve a list of dog breeds.
    // // await pauses this line until the API responds.

    // const breeds = await response.json() //converts the raw response into usable JavaScript (an array of breed objects).

    console.log("Breeds", breeds)

    breeds.forEach((breed) => { // This loop goes through each breed object in the breeds array.

      const option = document.createElement("option"); // creating a new <option> element in JavaScript (for use in a dropdown menu).

      option.value = breed.id; // This is what will be passed when someone selects it in the dropdown.

      option.textContent = breed.name; // Sets the visible text in the dropdown to the name of the breed in example Cane Corso

      breedSelect.appendChild(option) // apppening it to the parent breedSelect

    })
  } catch (error) {
    console.error("Error fetching breeds:", error); // throwing an error if something goes wrong
  }
}

initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following: ✅
 * - Retrieve information on the selected breed from the dog API using fetch().✅
 *  - Make sure your request is receiving multiple array items! ✅
 *  - Check the API documentation if you're only getting a single object. ✅
 * - For each object in the response array, create a new element for the carousel.✅
 *  - Append each of these new elements to the carousel. ✅
 * - Use the other data you have been given to create an informational section within the infoDump element.✅
 *  - Be creative with how you create DOM elements and HTML.✅
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!✅
 *  - Remember that functionality comes first, but user experience and design are important.✅
 * - Each new selection should clear, re-populate, and restart the Carousel.✅
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.✅
 */

breedSelect.addEventListener("change", retrieveInfo) // event listner for the breed select input element

async function retrieveInfo(event) { // creating async function to add breeds changes
  try {
    const selectedBreedId = event.target.value; // Grabs the id for the selected <option> from the drop down

    console.log("Selected Breed : ", selectedBreedId) // used for debugging in the console


    const doggyRes = await axios.get("/images/search", { // "/images/search": This is the endpoint path (Axios adds the base URL automatically
      params: { //Axios uses this to attach querey parameters to the URL
        limit: 10, // telling the API you want 10 results
        breed_ids: selectedBreedId // sends the selected breed id so I can get images of the specific breed
      },
      onDownloadProgress: updateProgress

    });

    const doggyData = doggyRes.data;

    // //Sendind an api request to fetch 10 random imges of the selected breed
    // const doggyRes = await fetch(`https://api.thedogapi.com/v1/images/search?limit=10&breed_ids=${selectedBreedId}&api_key=${API_KEY}`);
    // const doggyData = await doggyRes.json(); // converting the doggyData to usable JSON

    Carousel.clear(); // clearing previous photos from the carousel
    infoDump.innerHTML = ""; // clearing the info section

    doggyData.forEach((item) => { // looping through the 10 images in the doggy data
      const element = Carousel.createCarouselItem( // using carousel module to build a dom element for each dog
        item.url, // the url for images 
        item.breeds[0]?.name || "Dog image", // getting the name of the dog if its available 
        item.id // gets image id
      );

      Carousel.appendCarousel(element); // appending everything to carousel
      Carousel.start(); // initializes the carousel
    })

    const breedInfo = doggyData[0]?.breeds[0]; // pulling out the breed metadata from the first image's breed info 
    // and using ? to ensure that it doesnt break if the data is missing
    if (breedInfo) { // if the meta data exists
      //injecting breed info such as name, temperament and origin
      infoDump.innerHTML = `
      <h2>${breedInfo.name}</h2>
      <p>${breedInfo.temperament}</p>
      <p>Origin: ${breedInfo.origin}</p>
    `;
    }

  }
  catch (error) {

    console.error("Error fetching dog info:", error);// catching any error if it happens

  }
}


/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab." 🤷🏻‍♂️
 */
/**
 * 4. Change all of your fetch() functions to axios!✅
 * - axios has already been imported for you within index.js.✅
 * - If you've done everything correctly up to this point, this should be simple.✅
 * - If it is not simple, take a moment to re-evaluate your original code.✅
 * - Hint: Axios has the ability to set default headers. Use this to your advantage✅
 *   by setting a default header with your API key so that you do not have to✅
 *   send it manually with all of your requests! You can also set a default base URL!✅
 */


/**
 * 5. Add axios interceptors to log the time between request and response to the console.✅
 * - Hint: you already have access to code that does this!✅
 * - Add a console.log statement to indicate when requests begin.✅
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.✅
 * - The progressBar element has already been created for you.✅
 *  - You need only to modify its "width" style property to align with the request progress.✅
 * - In your request interceptor, set the width of the progressBar element to 0%.✅
 *  - This is to reset the progress with each request.✅
 * - Research the axios onDownloadProgress config option.✅
 * - Create a function "updateProgress" that receives a ProgressEvent object.✅
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.✅
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.✅
 *  - Update the progress of the request using the properties you are given.✅
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire✅
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself✅
 *   with for future projects.
 */

function updateProgress(progressEvent) {
  const prog = Math.round((progressEvent.loaded * 100) / progressEvent.total)
  progressBar.style.width = `${prog}%`
  console.log(`Download Progress: ${prog}%`)

}

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:✅
 * - In your request interceptor, set the body element's cursor style to "progress."✅
 * - In your response interceptor, remove the progress cursor style from the body element.✅
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

const favouritesMap = new Map(); // Stores favourited images and their favourite_id will need later to unfavorite 

export async function favourite(imgId) {
  // your code here
  try {
    // If it's already in the map, DELETE it (unfavourite)
    if (favouritesMap.has(imgId)) {
      const favId = favouritesMap.get(imgId); // gets the favorite_id
      await axios.delete(`/favourites/${favId}`); // sends a DELETE request to the DOG API  to remove the image from favorites
      favouritesMap.delete(imgId); // removes the image from the favoritesMap
      console.log(`Removed favourite for image ${imgId}`);
    } else {
      // If it's not in the map, POST it (favourite)
      const response = await axios.post("/favourites", {
        image_id: imgId
      });
      const favId = response.data.id; // gets the new favourite_id 
      favouritesMap.set(imgId, favId); // stores the new favId, imgId is the key
      console.log(`Favourited image ${imgId} with favId ${favId}`);
    }

  }
  catch (error) {
    console.error("Error toggling favourite:", error); 
  }

}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
