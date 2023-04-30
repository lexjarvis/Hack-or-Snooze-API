"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
//selector that finds all DOM elements with the ID `favorited-stories`
const $favoritedStories = $("#favorited-stories");
//selector that finds all DOM elements with the ID `my-stories`
const $ownStories = $("#my-stories");

//selector that finds all DOM elements with the class `stories-list`
const $storiesLists = $(".stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

//selector that finds the submit form
const $submitForm = $("#submit-form");
//selector that finds the html element with the `id` attribute of `nav-submit-story`
const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
//selector that finds the html element with an `id` of `user profile`
const $userProfile = $("#user-profile");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    //add user profile to list of components
    $userProfile
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
