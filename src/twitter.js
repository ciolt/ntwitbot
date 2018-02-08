/**
 * NTwitBot - twitter.js
 * @file Twitter data API.
 * @author Jordan Sne <jordansne@gmail.com>
 * @license MIT
 */

const TwitterModule = require('twitter');

/**
 * Twitter API interactor class. Gets data directly from Twitter.
 * @constructor
 */
module.exports = class Twitter {

    /**
     * Initialize the class.
     * @param {{consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string}} secretData The secret data for the Twitter API.
     * @param {Util} utils - The utilities object needed for logging, etc.
     */
    constructor(secretData, utils) {
        this.twitterAPI = new TwitterModule(secretData);
        this.utils = utils;
    }

    /**
     * Verifies secret data with Twitter's API.
     * @return {Promise} Resolves with the bot's user ID.
     */
    verify() {
        const data = {
            include_entities: false,
            skip_status: true
        };

        return this.getRequest('account/verify_credentials', data).then((account) => {
            this.ownID = account.id_str;
            return this.ownID;
        }, (error) => {
            this.utils.logError('Failed to verify twitter configuration');
            throw error;
        });
    }

    /**
     * Gets a list of usernames and returns a list of IDs.
     * @param {Array<string|number>} listOfUsernames An array containing stringed usernames.
     * @returns {Promise} Resolves with an array of user IDs.
     */
    getUserID(listOfUsernames) {
        let usernames = [];
        let userIDs = [];
        for (const i in listOfUsernames) {
            /**
             * if - Tests to see if a username is actually a user ID 
             * else if - Tests to see if a username is a normal one
             */
            if (RegExp('^\d+$','g').test(listOfUsernames[i])) {
                userIDs.push(listOfUsernames[i]);
            } else {
                usernames.push(listOfUsernames[i].replace(/[@]/, ''));
            }
        }
        
        const data = {
            include_entities: false,
            screen_name: usernames.join(','),
            user_id: userIDs.join(',')
        };
        return this.postRequest('users/lookup', data).then((users) => {
            const userList = users.map((val) => {
                return val.id_str;
            });
            return userList;
        }).catch((error) => {
            this.utils.logError('Failed to get Twitter IDs');
            if (listOfUsernames.length > 100) {
                this.utils.logError('Cannot get user IDs for more than 100 users at a time.');
            }
            throw error;
        });
    }

    /**
     * Posts a tweet on the bot's account.
     * @param {string} tweetMessage - The tweet to be posted.
     * @param {string} [idToReply] - The ID of which the tweet should be replying to.
     * @param {string} [userToReply] - The username of the user that is being replied to.
     * @return {Promise} Resolve if successful sending tweet.
     */
    postTweet(tweetMessage, idToReply, userToReply) {
        const data = {
            status: tweetMessage
        };

        if (idToReply) {
            data.in_reply_to_status_id = idToReply;
            data.status = '@' + userToReply + ' ' + data.status;
        }

        return this.postRequest('statuses/update', data).catch((error) => {
            this.utils.logError('Failed to send tweet');
            throw error;
        });
    }

    /**
     * Sends a Direct Message from the bot to another user.
     * @param {string} message - The message to be sent.
     * @param {int} userID - The user ID of the recipient.
     * @return {Promise} Resolves on successful send.
     */
    sendDM(message, userID) {
        const data = {
            text: message,
            user_id: userID
        };

        return this.postRequest('direct_messages/new', data).catch((error) => {
            this.utils.logError('Failed to send Direct Message to: ' + userID);
            throw error;
        });
    }

    /**
     * Retrieves and returns mentions of the bot.
     * @param {Object} requestData - The request data to be sent with request.
     * @return {Promise} Resolves with the mention data.
     */
    getMentions(requestData) {
        return this.getRequest('statuses/mentions_timeline', requestData).then((mentions) => {
            return mentions;
        }, (error) => {
            this.utils.logError('Failed to retrieve mentions from bot');
            throw error;
        });
    }

    /**
     * Retrieves a list of following users of the bot.
     * @param {string} userID - User ID of the user to check.
     * @return {Promise} Resolves with the following list.
     */
    getFollowing() {
        const data = {
            user_id: this.ownID,
            stringify_ids: true
        };

        return this.getRequest('friends/ids', data).catch((error) => {
            this.utils.logError('Failed to retrieve following list of bot');
            throw error;
        });
    }

    /**
     * Retrieves tweets from the specified request data.
     * @param {Object} requestData - Data to be sent with the API request.
     * @return {Promise} Resolves with the tweet list.
     */
    getTweets(requestData) {
        return this.getRequest('statuses/user_timeline', requestData).catch((error) => {
            this.utils.logError('Failed to retrieve tweets from user: ' + requestData.user_id);
            throw error;
        });
    }

    /**
     * Makes a generic twitter GET API request.
     * @param {string} path - The request type. Example: 'statuses/user_timeline'
     * @param {Object} requestData - Data to be sent with the API request.
     * @return {Promise} Resolves with the received data.
     */
    getRequest(path, requestData) {
        return new Promise((resolve, reject) => {
            this.twitterAPI.get(path, requestData, (error, data, response) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(data, response);
            });
        });
    }

    /**
     * Makes a generic twitter POST API request.
     * @param {string} path - The request type. Example: 'statuses/update'
     * @param {Object} requestData - Data to be sent with the API request.
     * @return {Promise} Resolves with the received data.
     */
    postRequest(path, requestData) {
        return new Promise((resolve, reject) => {
            this.twitterAPI.post(path, requestData, (error, data, response) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(data, response);
            });
        });
    }

};
