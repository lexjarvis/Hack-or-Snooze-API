"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
} catch (error) {
  //handle incorrect credentals error
  if (error.response && error.response.status === "401") {
    console.error("Invalid username or password. Please try again.");
    alert("Invalid username or password. Please try again.");
  } else {
    console.error("An error occurred. Please try again.");
    alert("An error occurred. Please try again.");
  }
 }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
} catch (error) {
  //handle username already taken error
  if (error.response && error.response.status === 409) {
    console.error("This username is already taken. Please choose a different username.")
    alert("This username is already taken. Please choose a different username.");
  } else {
    console.error("An error occurred. Please try again.");
    alert("An error occurred. Please try again.");
  }
 }
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

//async keyword is added before the function to indicate that it contains asynchronous code that may take some time to complete
//this helps prevent the program from becoming unresponsive or freezing while waiting for asynchronous code to complete
async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  //ensure only the necessary components are shown when the user logs in
  hidePageComponents();

  //re-display stories so that the favorited stories can appear
  putStoriesOnPage();
  $allStoriesList.show();

  updateNavOnLogin();
  //generating a user profile provides additional information about the logged-in user such as their name, and allows them to view their own stories
  generateUserProfile();
}

//the generateUserProfile function is used to generate the user profile section of the page with info about the current user
function generateUserProfile() {
  console.debug("generateUserProfile");
//jQuery is used to select elements on the page with specific IDs and set their text to various properties of the `currentUser` object
  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}


