"use strict";

// Pages ---------------------------------------------------------------------------------------------------------------
const SIGNUP_URL = 'signup/';
const LOGIN_URL = 'login/';

/// Pages when logged in -----------------------------
const HOME_URL = 'home/';
const PROFILE_URL = 'profile/';
const USER_PROFILE_URL = 'userProfile/';
const NOTIFICATIONS_PAGE_URL = 'notificationCenter/';
const FRIENDS_URL = "friends/";
const SEARCH_USERS_URL = 'searchUsers/';


//// Game pages --------------------------------------
///// local
const PLAY_LOCAL_URL = 'play/local/';

///// AI
const PLAY_AI_URL = 'play/ai/';
const PLAY_AI_ORDER_URL = 'play/ai/order/';

///// Matchmaking
const PLAY_MATCHMAKING_URL = 'play/matchmaking/';

//// Challenge
const PLAY_CHALLENGE_URL = 'play/challenge/';

// API -----------------------------------------------------------------------------------------------------------------

// login, signup, friends,
// are defined above

const API_URL = 'api/';
const ACHIEVEMENTS_URL = "achievements/";
const USERS_URL = "users/";
const NOTIFICATIONS_API_URL = "notifications/";
const CHATS_API_URL = "chats/";

// export all the constants --------------------------------------------------------------------------------------------
export {
    SIGNUP_URL,
    LOGIN_URL,
    HOME_URL,
    PROFILE_URL,
    USER_PROFILE_URL,
    NOTIFICATIONS_PAGE_URL,
    FRIENDS_URL,
    SEARCH_USERS_URL,
    PLAY_LOCAL_URL,
    PLAY_AI_URL,
    PLAY_AI_ORDER_URL,
    PLAY_MATCHMAKING_URL,
    API_URL,
    ACHIEVEMENTS_URL,
    USERS_URL,
    NOTIFICATIONS_API_URL,
    PLAY_CHALLENGE_URL,
    CHATS_API_URL
};
