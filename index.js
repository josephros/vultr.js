'use strict';
var request = require('request');
var token = "";

/**
 * Check if there is an error.
 * @param code {int} Request status code.
 */
function checkError(code) {
  if (code == 400) throw new Error('Invalid API location. Check the URL that you are using.');
  else if (code == 403) throw new Error('Invalid or missing API key. Check that your API key is present and matches your assigned key.');
  else if (code == 405) throw new Error('Invalid HTTP method. Check that the method (POST|GET) matches what the documentation indicates.');
  else if (code == 412) throw new Error('Request failed. Check the response body for a more detailed description.');
  else if (code == 500) throw new Error('Internal server error. Try again at a later time.');
  else if (code == 503) throw new Error('Rate limit hit. API requests are limited to an average of 2/s. Try your request again later.');
}

/**
 * Do request to the vultr api.
 * @param action {String}
 * @param callback {Function}
 */
function doRequest(action, callback) {
  request({url: 'https://api.vultr.com' + action, headers: {'API-Key': token}}, function (error, response, body) {
    try {
      if (error) throw error;
      checkError(response.statusCode);
      callback(null, body);
    } catch (e) {
      callback(e, body);
    }
  })
}

/**
 * Do post request to the vultr api.
 * @param action {String}
 * @param data {Object}
 * @param callback {Function}
 */
function doPostRequest(action, data, callback) {
  request({url: 'https://api.vultr.com' + action, formData: data, method: 'POST', headers: {'API-Key': token}}, function (error, response, body) {
    try {
      if (error) throw error;
      checkError(response.statusCode);
      callback(null, body);
    } catch (e) {
      callback(e, body);
    }
  })
}

module.exports = {
  /**
   * Set the api token.
   * @param newToken The vultr api token.
   */
  setToken: function (newToken) {
    token = newToken;
  },
  /**
   * Retrieve information about the current account.
   * @param callback
   */
  getAccountInfo: function (callback) {
    doRequest('/v1/account/info', callback);
  },
  /**
   * Retrieve a list of available applications.
   * These refer to applications that can be launched when creating a Vultr VPS.
   * @param callback
   */
  getApplications: function (callback) {
    doRequest('/v1/app/list', callback);
  },
  /**
   * Retrieve information about the current API key.
   * @param callback
   */
  getAuthInfo: function (callback) {
    doRequest('/v1/auth/info', callback);
  },
  /**
   * List all backups on the current account.
   * @param callback
   */
  getBackups: function (callback) {
    doRequest('/v1/backup/list', callback);
  },
  /**
   * Attach a block storage subscription to a VPS subscription.
   * The block storage volume must not be attached to any other VPS subscriptions for this to work.
   * @param data
   * @param callback
   */
  attachBlock: function (data, callback) {
    doPostRequest('/v1/block/attach', data, callback);
  },
  /**
   * Create a block storage subscription.
   * @param data
   * @param callback
   */
  createBlock: function (data, callback) {
    doPostRequest('/v1/block/create', data, callback);
  },
  /**
   * Delete a block storage subscription. All data will be permanently lost. There is no going back from this call.
   * @param data
   * @param callback
   */
  deleteBlock: function (data, callback) {
    doPostRequest('/v1/block/delete', data, callback);
  },
  /**
   * Detach a block storage subscription from the instance it's currently attached to.
   * @param data
   * @param callback
   */
  detachBlock: function (data, callback) {
    doPostRequest('/v1/block/detach', data, callback);
  },
  /**
   * Set the label of a block storage subscription.
   * @param data
   * @param callback
   */
  setBlockLabel: function (data, callback) {
    doPostRequest('/v1/block/label_set', data, callback);
  },
  /**
   * Retrieve a list of any active block storage subscriptions on this account
   * @param callback
   */
  getBlocks: function (callback) {
    doRequest('/v1/block/list', callback);
  },
  /**
   * Resize the block storage volume to a new size.
   * WARNING: When shrinking the volume, you must manually shrink the filesystem and partitions beforehand,
   * or you will lose data.
   * @param data
   * @param callback
   */
  resizeBlock: function (data, callback) {
    doPostRequest('/v1/block/resize', data, callback);
  },
  /**
   * Create a domain name in DNS.
   * @param data
   * @param callback
   */
  createDomain: function (data, callback) {
    doPostRequest('/v1/dns/create_domain', data, callback);
  },
  /**
   * Add a DNS record.
   * @param data
   * @param callback
   */
  createRecord: function (data, callback) {
    doPostRequest('/v1/dns/create_record', data, callback);
  },
  /**
   * Delete a domain name (and all associated records).
   * @param data
   * @param callback
   */
  deleteDomain: function (data, callback) {
    doPostRequest('/v1/dns/delete_domain', data, callback);
  },
  /**
   * Delete an individual DNS record.
   * @param data
   * @param callback
   */
  deleteRecord: function (data, callback) {
    doPostRequest('/v1/dns/delete_record', data, callback);
  },
  /**
   * List all domains associated with the current account.
   * @param callback
   */
  getDomains: function (callback) {
    doRequest('/v1/dns/list', callback);
  },
  /**
   * List all the records associated with a particular domain.
   * @param domain
   * @param callback
   */
  getRecords: function (domain, callback) {
    doRequest('/v1/dns/records?domain=' + domain, callback);
  },
  /**
   * Update a DNS record.
   * @param data
   * @param callback
   */
  updateRecord: function (data, callback) {
    doPostRequest('/v1/dns/update_record', data, callback);
  },
  /**
   * List all ISOs currently available on this account.
   * @param callback
   */
  getImages: function (callback) {
    doRequest('/v1/iso/list', callback);
  },
  /**
   * Retrieve a list of available operating systems.
   * If the 'windows' flag is true, a Windows license will be included with the instance, which will increase the cost.
   * @param callback
   */
  getOs: function (callback) {
    doRequest('/v1/os/list', callback);
  },
  /**
   * Retrieve a list of all active plans. Plans that are no longer available will not be shown.
   * The 'windows' field is no longer in use, and will always be false.
   * Windows licenses will be automatically added to any plan as necessary.
   * The 'deprecated' field indicates that the plan will be going away in the future.
   * New deployments of it will still be accepted, but you should begin to transition away from it's usage.
   * Typically, deprecated plans are available for 30 days after they are deprecated.
   * @param callback
   */
  getPlans: function (callback) {
    doRequest('/v1/plans/list', callback);
  },
  /**
   * Retrieve a list of all active vc2 plans.
   * Plans that are no longer available will not be shown.
   * The 'deprecated' field indicates that the plan will be going away in the future.
   * New deployments of it will still be accepted, but you should begin to transition away from it's usage.
   * Typically, deprecated plans are available for 30 days after they are deprecated.
   * @param callback
   */
  getVC2Plans: function (callback) {
    doRequest('/v1/plans/list', callback);
  },
  /**
   * Retrieve a list of all active vdc2 plans. Plans that are no longer available will not be shown.
   * The 'deprecated' field indicates that the plan will be going away in the future.
   * New deployments of it will still be accepted, but you should begin to transition away from it's usage.
   * Typically, deprecated plans are available for 30 days after they are deprecated.
   * @param callback
   */
  getVDC2Plans: function (callback) {
    doRequest('/v1/plans/list_vdc2', callback);
  },
  /**
   * Retrieve a list of the VPSPLANIDs currently available in this location.
   * If your account has special plans available, you will need to pass your api_key in in order to see them.
   * For all other accounts, the API key is not optional.
   * @param dcid
   * @param callback
   */
  getRegionAvailability: function (dcid, callback) {
    doRequest('/v1/regions/availability?DCID=' + dcid, callback);
  },
  /**
   * Retrieve a list of all active regions.
   * Note that just because a region is listed here, does not mean that there is room for new servers.
   * @param callback
   */
  getRegions: function (callback) {
    doRequest('/v1/regions/list', callback);
  }
};
