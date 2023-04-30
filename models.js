"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    return new URL(this.url).host;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

//addStorytakes in a `user` and an object containing `title`, `author`, and `ur;`
//const token gets the login token from the `user` parameter
//const response sends a POST request to the `/stories` endpoint of the API with the `token` and `story` data in the request body
//it returns a promise that resolves to the response data
  async addStory(user, newStory) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });
//const story creates a new `story` instance from the response data
//this.stories.unshift(story) adds the new `story` object to the `stories` array at the beginning
//user.ownStories.unshift(story) adds the new `story` object to the `ownStories` array of the given `user`.
//return story returns the new `story` instance
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);

    return story;
  }

/** Delete story from API and remove from the story lists.
   *
   * - user: the current User instance
   * - storyId: the ID of the story you want to remove
   */

 async removeStory(user, storyId) {
  const token = user.loginToken;
  await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: { token: user.loginToken }
  });

  // filter out the story whose ID we are removing
  this.stories = this.stories.filter(story => story.storyId !== storyId);

  // do the same thing for the user's list of stories & their favorites
  user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
  user.favorites = user.favorites.filter(s => s.storyId !== storyId);
}
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
//Add a story to the list of favorites and update API
//addFavorite adds a given story to the list of favorites for the user and updates the API
//This method takes a `story` parameter that is a `story` instance to be added to the user's favorites list.
//The `favorites` list for the user is updated by pushing the `story` object into it. 
//The method then calls `_addOrRemoveFavorite` with the "add" state and the `story` object.

 async addFavorite(story) {
  this.favorites.push(story);
  await this._addOrRemoveFavorite("add", story)
}

//Remove a story from the list of user favorites and update the API
//removeFavorite removes a given story from the list of favorites for the user and updates the API
//This method takes a `story` parameter that is a `story` instance to be removed from the user's favorites list. 
//The `favorites` list for the user is updated by filtering out any objects in the list where `storyId` property does not match the `story` object's `storyId`.
//This method then calls `_addOrRemoveFavorite` with teh "remove" state and the `story` object.

async removeFavorite(story) {
  this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
  await this._addOrRemoveFavorite("remove", story);
}

//_addOrRemoveFavorite updates the API to add or remove a favorite story for the user
//This method takes two parameters: `newState` (which is either "add" or "remove") and `story` (which is the `story` instance to make a favorite or not favorite)
//The method determines the HTTP method to be used for the API call based on the `newState` parameter, and then sends a request to the API using Axios with the approrpiate URL, method, and data (which includes the user's `token`)
//This method is prefixed with an underscore to indivate that it is intended to be a "private" method and should not be called from outside the class

async _addOrRemoveFavorite(newState, story) {
  const method = newState === "add" ? "POST" : "DELETE";
  const token = this.loginToken;
  await axios({
    url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
    method: method,
    data: { token },
  });
}

//isFavorite checks if a given `story` instance is a favorite of the user
//This method takes a `story` parameter that is a `story` instance to check if it is a favorite of the user
//The method uses the `favorites` list to check if the given `story` objects `storyId` matches the `storyId` of any object in the `favorites` list
//If there is a match, the method returns `true`, otherwise it returns `false`.

isFavorite(story) {
  return this.favorites.some(s => (s.storyId === story.storyId));
}
}
