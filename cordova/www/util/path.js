"use strict";

// Pages ---------------------------------------------------------------------------------------------------------------
const SIGNUP_URL = 'signup/index.html';
const LOGIN_URL = 'login/index.html';

/// Pages when logged in -----------------------------
const HOME_URL = 'home/index.html';
const PROFILE_URL = 'profile/index.html';
const NOTIFICATIONS_PAGE_URL = 'notificationCenter/index.html';
const FRIENDS_URL = "friends/index.html";
const SEARCH_USERS_URL = 'searchUsers/index.html';
const RANKING_URL = 'ranking/index.html';
const OTHER_MENU_URL = 'otherMenu/index.html';


//// Game pages --------------------------------------
///// local
const PLAY_LOCAL_URL = 'play/local/index.html';

///// AI
const PLAY_AI_URL = 'play/ai/index.html';
const PLAY_AI_ORDER_URL = 'play/ai/order/index.html';

///// Matchmaking
const PLAY_MATCHMAKING_URL = 'play/matchmaking/index.html';

//// Challenge
const PLAY_CHALLENGE_URL = 'play/challenge/index.html';

// API -----------------------------------------------------------------------------------------------------------------

// login, signup, friends,
// are defined above

const API_URL = 'api/';
const ACHIEVEMENTS_API = "achievements/";
const USERS_API = "users/";
const NOTIFICATIONS_API = "notifications/";
const CHATS_API = "chats/";

const STATS_API = "stats/";

const FRIENDS_API = "friends/";

const LOGIN_API = "login/"

const SIGNUP_API = "signup/"

// export all the constants --------------------------------------------------------------------------------------------
export {
    SIGNUP_URL,
    LOGIN_URL,
    HOME_URL,
    PROFILE_URL,
    NOTIFICATIONS_PAGE_URL,
    FRIENDS_URL,
    SEARCH_USERS_URL,
    RANKING_URL,
    OTHER_MENU_URL,
    PLAY_LOCAL_URL,
    PLAY_AI_URL,
    PLAY_AI_ORDER_URL,
    PLAY_MATCHMAKING_URL,
    API_URL,
    ACHIEVEMENTS_API,
    USERS_API,
    NOTIFICATIONS_API,
    PLAY_CHALLENGE_URL,
    CHATS_API,
    STATS_API,
    FRIENDS_API,
    LOGIN_API,
    SIGNUP_API,
};
