"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * Returns the markup for the story.
 */
//- add showDeleteBtn
//-add showEditBtn
function generateStoryMarkup(story, showDeleteBtn = false, showEditBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
  //creates a new jQuery object that represents an `<li>` element based on the `story` object, and optionally shows a delete button and/or a star to indicate if the story is a favorite of the `currentUser`
  //the `<li>` element has a unique id attribute set to the storyId of the story object
  //the title of hte story is wrapped in an `<a>` element that links to the `url` property of the `story`
  //the hostName variable is used to display the hostname of the `story`'s URL
  //if `showDeleteBtn` is `true`, a delete button is included in the `<li>` element by calling the `getDeleteBtnHTML()` function
  //if `showStar` is `true`, a star is included in the `<li>` element by calling the `getStarHTML()` function and passing in the `story` and currentUser` objects
  return $(`
    <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? getStarHTML(story, currentUser) : ""}
      <a href="${story.url}" target="a_blank" class="story-link">
       ${story.title}
     </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
     <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

//Make delete button HTML for story
function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

//Make favorite/not-favorite star for story
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//deleteStory() is an async function that is called when the dlete button is clicked in the users own stories list
//it first finds the nearest `li` element containing the trash-can icon that was clicked and extracts the `id` of the sotry from the `li` element
//it then calls the `removeStory()` method of the `storyList` object with the current user adn the `storyId` to remove the story from the API
//it called `putUserStoriesOnPage()` to regenerate the list of stories displayed on the page
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}
//the `deleteStory()` function is attached to the `trash-can` element in the `ownStories` list, which is part of the user profile page
$ownStories.on("click", ".trash-can", deleteStory);

//submitNewStory() is an async function that is called when the user submits the form for adding a new story
//it first prevents default form submittion behavior of reloading the page and then extracts the title, url, author and current username from the form input fields
//it creates a `storyData` object with this information, and then calls the `addStory()` method of the `storyList` object with the current user and the `storyData` to add the story to the API
//it then generates the html markup for the new story using the `generateStoryMarkup()` function and prepends it to the list of all stories
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab all info from form
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username
  const storyData = {title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}
//the `submitNewStory()` function is attached to the `submit` event of the `submitForm` element, which is the form for adding a new story
$submitForm.on("submit", submitNewStory);

//populates the my stories section of the webpage with the stories added by the currently logged in user
//first, empty the my stories element using the `$ownStories.empty()` method
function putUserStoriesOnPage() {
 console.debug("putUserStoriesOnPage");
 $ownStories.empty();

//if the user has not added any stories yet, the function displays a message saying so by appending an HTML element with the message to `$ownStories`
 if (currentUser.ownStories.length === 0) {
   $ownStories.append("<h5>No stories added by user yet!</h5>");
 } else {
// if the user has added stories, the function loops through teh user's `ownStories` array and generates HTML markup for each story using the `generateStoryMarkup(story, true)` function
//the second argument `true` passed to the function sets the `showDeleteBtn` variable to `true`, so that the function generates markup for a delete button as well
//the generated markup is appended to `$ownStories` using the `$ownStories.append($story)` method
//the function shows the `$ownStories` element using the `$ownStories.show()` method
   for (let story of currentUser.ownStories) {
     let $story = generateStoryMarkup(story, true);
     $ownStories.append($story);
   }
 }

 $ownStories.show();
}

//displaying the list of user's favorites stories on the page
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
//the function clears any exisiting content in the `$favoritedStories` element using `.empty()`
  $favoritedStories.empty();
//if the user has no favorites, a message is displayed indivating that there are no favorites

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
//otherwise, the funciton loops through each of the user's favorite stories and generates HTML markup for each using the `generateStoryMarkup()` function
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
//the generated markup is appended to the `$favoritedStories` element using `.append()` and the `$favoritedStories` element is shown on the page using `.show()`

      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}


//adds the ability for the user to toggle a story as a favorite or unfavorite it
//when a user clicks on the star icon associated with a story, the `toggleStoryFavorite` function is called
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
  // currently a favorite: remove from user's fav list and change star
  //the function uses `await` to ensure that the user's favorite list is updated before the star icon is changed
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
  // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);