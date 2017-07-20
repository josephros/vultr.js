'use strict';
var request = require('request');
var token = "";

/**
 * Check if there is an error.
 * @param code {int} Request status code.
 */
function checkError(code) {
  switch (code) {
    case 400:
      throw new Error('Invalid API location. Check the URL that you are using.');
    case 403:
      throw new Error('Invalid or missing API key. Check that your API key is present and matches your assigned key.');
    case 405:
      throw new Error('Invalid HTTP method. Check that the method (POST|GET) matches what the documentation indicates.');
    case 412:
      throw new Error('Request failed. Check the response body for a more detailed description.');
    case 500:
      throw new Error('Internal server error. Try again at a later time.');
    case 503:
      throw new Error('Rate limit hit. API requests are limited to an average of 2/s. Try your request again later.');
  }
}

/**
 * Do request to the vultr api.
 * @param action {String}
 * @param callback {Function}
 */
function doGetRequest(action, callback) {
  request({url: 'https://api.vultr.com' + action, headers: {'API-Key': token}}, function (error, response, body) {
    try {
      if (error) throw error;
      checkError(response.statusCode);
      callback(null, body ? JSON.parse(body) : null);
    } catch (e) {
      console.log("Got error with a vultr request. Response body:");
      console.log(body);

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
  request({
    url: 'https://api.vultr.com' + action,
    formData: data,
    method: 'POST',
    headers: {'API-Key': token}
  }, function (error, response, body) {
    try {
      if (error) throw error;
      checkError(response.statusCode);
      callback(null, body ? JSON.parse(body) : null);
    } catch (e) {
      console.log("Got error with a vultr request. Response body:");
      console.log(body);

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
    doGetRequest('/v1/account/info', callback);
  },
  /**
   * Retrieve a list of available applications.
   * These refer to applications that can be launched when creating a Vultr VPS.
   * @param callback
   */
  getApplications: function (callback) {
    doGetRequest('/v1/app/list', callback);
  },
  /**
   * Retrieve information about the current API key.
   * @param callback
   */
  getAuthInfo: function (callback) {
    doGetRequest('/v1/auth/info', callback);
  },
  /**
   * List all backups on the current account.
   * @param callback
   */
  getBackups: function (callback) {
    doGetRequest('/v1/backup/list', callback);
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
    doGetRequest('/v1/block/list', callback);
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
    doGetRequest('/v1/dns/list', callback);
  },
  /**
   * List all the records associated with a particular domain.
   * @param domain
   * @param callback
   */
  getRecords: function (domain, callback) {
    doGetRequest('/v1/dns/records?domain=' + domain, callback);
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
    doGetRequest('/v1/iso/list', callback);
  },
  /**
   * Retrieve a list of available operating systems.
   * If the 'windows' flag is true, a Windows license will be included with the instance, which will increase the cost.
   * @param callback
   */
  getOs: function (callback) {
    doGetRequest('/v1/os/list', callback);
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
    doGetRequest('/v1/plans/list', callback);
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
    doGetRequest('/v1/plans/list', callback);
  },
  /**
   * Retrieve a list of all active vdc2 plans. Plans that are no longer available will not be shown.
   * The 'deprecated' field indicates that the plan will be going away in the future.
   * New deployments of it will still be accepted, but you should begin to transition away from it's usage.
   * Typically, deprecated plans are available for 30 days after they are deprecated.
   * @param callback
   */
  getVDC2Plans: function (callback) {
    doGetRequest('/v1/plans/list_vdc2', callback);
  },
  /**
   * Retrieve a list of the VPSPLANIDs currently available in this location.
   * If your account has special plans available, you will need to pass your api_key in in order to see them.
   * For all other accounts, the API key is not optional.
   * @param dcid The datacenter identifiant.
   * @param callback
   */
  getRegionAvailability: function (dcid, callback) {
    doGetRequest('/v1/regions/availability?DCID=' + dcid, callback);
  },
  /**
   * Retrieve a list of all active regions.
   * Note that just because a region is listed here, does not mean that there is room for new servers.
   * @param callback
   */
  getRegions: function (callback) {
    doGetRequest('/v1/regions/list', callback);
  },
  /**
   * Attach a reserved IP to an existing subscription.
   * @param data
   * @param callback
   */
  attachIp: function (data, callback) {
    doPostRequest('/v1/reservedip/attach', data, callback);
  },
  /**
   * Convert an existing IP on a subscription to a reserved IP. Returns the SUBID of the newly created reserved IP.
   * @param data
   * @param callback
   */
  convertIp: function (data, callback) {
    doPostRequest('/v1/reservedip/convert', data, callback);
  },
  /**
   * Create a new reserved IP. Reserved IPs can only be used within the same datacenter that they are created in.
   * @param data
   * @param callback
   */
  createIp: function (data, callback) {
    doPostRequest('/v1/reservedip/create', data, callback);
  },
  /**
   * Remove a reserved IP from your account. You cannot get the IP address back after this.
   * @param data
   * @param callback
   */
  destroyIp: function (data, callback) {
    doPostRequest('/v1/reservedip/destroy', data, callback);
  },
  /**
   * Detach a reserved IP from an existing subscription.
   * @param data
   * @param callback
   */
  detachIp: function (data, callback) {
    doPostRequest('/v1/reservedip/detach', data, callback);
  },
  /**
   * List all the active reserved IPs on this account.
   * subnet_size is the size of the network assigned to this subscription.
   * This will typically be a /64 for IPv6, or a /32 for IPv4.
   * @param callback
   */
  getIps: function (callback) {
    doGetRequest('/v1/reservedip/list', callback);
  },
  /**
   * Changes the virtual machine to a different application. All data will be permanently lost.
   * @param data
   * @param callback
   */
  serverChangeApplication: function (data, callback) {
    doPostRequest('/v1/server/app_change', data, callback);
  },
  /**
   * Retrieves a list of applications to which a virtual machine can be changed.
   * Always check against this list before trying to switch applications because it
   * is not possible to switch between every application combination.
   * @param subid
   * @param callback
   */
  getServerChangeApplicationsAvailable: function (subid, callback) {
    doGetRequest('/v1/server/app_change_list?SUBID=' + subid, callback);
  },
  /**
   * Disables automatic backups on a server. Once disabled, backups can only be enabled again by customer support.
   * @param data
   * @param callback
   */
  serverDisableBackup: function (data, callback) {
    doPostRequest('/v1/server/backup_disable', data, callback);
  },
  /**
   * Enables automatic backups on a server.
   * @param data
   * @param callback
   */
  serverEnableBackup: function (data, callback) {
    doPostRequest('/v1/server/backup_enable', data, callback);
  },
  /**
   * Retrieves the backup schedule for a server. All time values are in UTC.
   * @param data
   * @param callback
   */
  getServerBackupSchedule: function (data, callback) {
    doPostRequest('/v1/server/backup_get_schedule', data, callback);
  },
  /**
   * Sets the backup schedule for a server. All time values are in UTC.
   * @param data
   * @param callback
   */
  setServerBackupSchedule: function (data, callback) {
    doPostRequest('/v1/server/backup_set_schedule', data, callback);
  },
  /**
   * Get the bandwidth used by a virtual machine.
   * @param subid
   * @param callback
   */
  getServerBandwidth: function (subid, callback) {
    doGetRequest('/v1/server/bandwidth?SUBID=' + subid, callback);
  },
  /**
   * Create a new virtual machine. You will start being billed for this immediately.
   * The response only contains the SUBID for the new machine.
   * You should use v1/server/list to poll and wait for the machine to be created (as this does not happen instantly).
   * @param data
   * @param callback
   */
  createServer: function (data, callback) {
    doPostRequest('/v1/server/create', data, callback);
  },
  /**
   * Add a new IPv4 address to a server. You will start being billed for this immediately.
   * The server will be rebooted unless you specify otherwise.
   * You must reboot the server before the IPv4 address can be configured.
   * @param data
   * @param callback
   */
  serverCreateIpV4: function (data, callback) {
    doPostRequest('/v1/server/create_ipv4', data, callback);
  },
  /**
   * Destroy (delete) a virtual machine. All data will be permanently lost, and the IP address will be released.
   * There is no going back from this call.
   * @param data
   * @param callback
   */
  destroyServer: function (data, callback) {
    doPostRequest('/v1/server/destroy', data, callback);
  },
  /**
   * Removes a secondary IPv4 address from a server.
   * Your server will be hard-restarted. We suggest halting the machine gracefully before removing IPs.
   * @param data
   * @param callback
   */
  serverDestroyIpV4: function (data, callback) {
    doPostRequest('/v1/server/destroy_ipv4', data, callback);
  },
  /**
   * Retrieves the application information for this subscription.
   * @param subid
   * @param callback
   */
  getServerApplicationInfo: function (subid, callback) {
    doGetRequest('/v1/server/get_app_info?SUBID=' + subid, callback);
  },
  /**
   * Retrieves the (base64 encoded) user-data for this subscription.
   * @param subid
   * @param callback
   */
  getServerUserData: function (subid, callback) {
    doGetRequest('/v1/server/get_user_data?SUBID=' + subid, callback);
  },
  /**
   * Halt a virtual machine. This is a hard power off (basically, unplugging the machine).
   * The data on the machine will not be modified, and you will still be billed for the machine.
   * To completely delete a machine, see v1/server/destroy.
   * @param data
   * @param callback
   */
  serverHalt: function (data, callback) {
    doPostRequest('/v1/server/halt', data, callback);
  },
  /**
   * Attach an ISO and reboot the server.
   * @param data
   * @param callback
   */
  serverAttachIso: function (data, callback) {
    doPostRequest('/v1/server/iso_attach', data, callback);
  },
  /**
   * Detach the currently mounted ISO and reboot the server.
   * @param data
   * @param callback
   */
  serverDetachIso: function (data, callback) {
    doPostRequest('/v1/server/iso_detach', data, callback);
  },
  /**
   * Retrieve the current ISO state for a given subscription.
   * The returned state may be one of: ready | isomounting | isomounted.
   * ISOID will only be set when the mounted ISO exists in your library ( see /v1/iso/list ).
   * Otherwise, it will read "0".
   * @param data
   * @param callback
   */
  getServerIsoStatus: function (data, callback) {
    doPostRequest('/v1/server/iso_status', data, callback);
  },
  /**
   * Set the label of a virtual machine.
   * @param data
   * @param callback
   */
  setServerLabel: function (data, callback) {
    doPostRequest('/v1/server/label_set', data, callback);
  },
  /**
   * List all active or pending virtual machines on the current account.
   * The 'status' field represents the status of the subscription and will be one of:
   * pending | active | suspended | closed. If the status is 'active',
   * you can check 'power_status' to determine if the VPS is powered on or not.
   * When status is 'active', you may also use 'server_state' for a more detailed status of:
   * none | locked | installingbooting | isomounting | ok.
   * The API does not provide any way to determine if the initial installation has completed or not.
   * The 'v6_network', 'v6_main_ip', and 'v6_network_size' fields are deprecated in favor of 'v6_networks'.
   * @param callback
   */
  getServers: function (callback) {
    doGetRequest('/v1/server/list', callback);
  },
  findServers: function (data, callback) {
    doPostRequest('/v1/server/list', data, callback);
  },
  /**
   * List the IPv4 information of a virtual machine.
   * IP information is only available for virtual machines in the "active" state.
   * @param subid
   * @param callback
   */
  getServerIpsV4: function (subid, callback) {
    doGetRequest('/v1/server/list_ipv4?SUBID=' + subid, callback);
  },
  /**
   * List the IPv6 information of a virtual machine.
   * IP information is only available for virtual machines in the "active" state.
   * If the virtual machine does not have IPv6 enabled, then an empty array is returned.
   * @param subid
   * @param callback
   */
  getServerIpsV6: function (subid, callback) {
    doGetRequest('/v1/server/list_ipv6?SUBID=' + subid, callback);
  },
  /**
   * Determine what other subscriptions are hosted on the same physical host as a given subscription.
   * @param subid
   * @param callback
   */
  getServerNeighbors: function (subid, callback) {
    doGetRequest('/v1/server/neighbors?SUBID=' + subid, callback);
  },
  /**
   * Changes the virtual machine to a different operating system. All data will be permanently lost.
   * @param data
   * @param callback
   */
  serverChangeOs: function (data, callback) {
    doPostRequest('/v1/server/os_change', data, callback);
  },
  /**
   * Retrieves a list of operating systems to which a virtual machine can be changed.
   * Always check against this list before trying to switch operating systems because
   * it is not possible to switch between every operating system combination.
   * @param subid
   * @param callback
   */
  getServerOsAvailable: function (subid, callback) {
    doGetRequest('/v1/server/os_change_list?SUBID=' + subid, callback);
  },
  /**
   * Reboot a virtual machine. This is a hard reboot (basically, unplugging the machine).
   * @param data
   * @param callback
   */
  serverReboot: function (data, callback) {
    doPostRequest('/v1/server/reboot', data, callback);
  },
  /**
   * Reinstall the operating system on a virtual machine. All data will be permanently lost,
   * but the IP address will remain the same There is no going back from this call.
   * @param data
   * @param callback
   */
  serverReinstall: function (data, callback) {
    doPostRequest('/v1/server/reinstall', data, callback);
  },
  /**
   * Restore the specified backup to the virtual machine. Any data already on the virtual machine will be lost.
   * @param data
   * @param callback
   */
  serverRestoreBackup: function (data, callback) {
    doPostRequest('/v1/server/restore_backup', data, callback);
  },
  /**
   * Restore the specificed snapshot to the virtual machine. Any data already on the virtual machine will be lost.
   * @param data
   * @param callback
   */
  serverRestoreSnapshot: function (data, callback) {
    doPostRequest('/v1/server/restore_snapshot', data, callback);
  },
  /**
   * Set a reverse DNS entry for an IPv4 address of a virtual machine to the original setting.
   * Upon success, DNS changes may take 6-12 hours to become active.
   * @param data
   * @param callback
   */
  setServerDefaultIpReverse: function (data, callback) {
    doPostRequest('/v1/server/reverse_default_ipv4', data, callback);
  },
  /**
   * Remove a reverse DNS entry for an IPv6 address of a virtual machine.
   * Upon success, DNS changes may take 6-12 hours to become active.
   * @param data
   * @param callback
   */
  serverDeleteIpV6Reverse: function (data, callback) {
    doPostRequest('/v1/server/reverse_delete_ipv6', data, callback);
  },
  /**
   * List the IPv6 reverse DNS entries of a virtual machine.
   * Reverse DNS entries are only available for virtual machines in the "active" state.
   * If the virtual machine does not have IPv6 enabled, then an empty array is returned.
   * @param subid
   * @param callback
   */
  getServerIpV6Reverse: function (subid, callback) {
    doGetRequest('/v1/server/reverse_list_ipv6?SUBID=' + subid, callback);
  },
  /**
   * Set a reverse DNS entry for an IPv4 address of a virtual machine.
   * Upon success, DNS changes may take 6-12 hours to become active.
   * @param data
   * @param callback
   */
  setServerIpV4Reverse: function (data, callback) {
    doPostRequest('/v1/server/reverse_set_ipv4', data, callback);
  },
  /**
   * Set a reverse DNS entry for an IPv6 address of a virtual machine.
   * Upon success, DNS changes may take 6-12 hours to become active.
   * @param data
   * @param callback
   */
  setServerIpV6Reverse: function (data, callback) {
    doPostRequest('/v1/server/reverse_set_ipv6', data, callback);
  },
  /**
   * Sets the cloud-init user-data for this subscription.
   * Note that user-data is not supported on every operating system, and is generally only provided on instance startup.
   * @param data
   * @param callback
   */
  setServerUserData: function (data, callback) {
    doPostRequest('/v1/server/set_user_data', data, callback);
  },
  /**
   * Start a virtual machine. If the machine is already running, it will be restarted.
   * @param data
   * @param callback
   */
  serverStart: function (data, callback) {
    doPostRequest('/v1/server/start', data, callback);
  },
  /**
   * Upgrade the plan of a virtual machine. The virtual machine will be rebooted upon a successful upgrade.
   * @param data
   * @param callback
   */
  serverUpgradePlan: function (data, callback) {
    doPostRequest('/v1/server/upgrade_plan', data, callback);
  },
  /**
   * Retrieve a list of the VPSPLANIDs for which a virtual machine can be upgraded.
   * An empty response array means that there are currently no upgrades available.
   * @param subid
   * @param callback
   */
  getServerUpgradePlanAvailable: function (subid, callback) {
    doGetRequest('/v1/server/upgrade_plan_list?SUBID=' + subid, callback);
  },
  /**
   * Create a snapshot from an existing virtual machine. The virtual machine does not need to be stopped.
   * @param data
   * @param callback
   */
  createSnapshot: function (data, callback) {
    doPostRequest('/v1/snapshot/create', data, callback);
  },
  /**
   * Destroy (delete) a snapshot. There is no going back from this call.
   * @param data
   * @param callback
   */
  destroySnapshot: function (data, callback) {
    doPostRequest('/v1/snapshot/destroy', data, callback);
  },
  /**
   * List all snapshots on the current account.
   * @param callback
   */
  getSnapshots: function (callback) {
    doGetRequest('/v1/snapshot/list', callback);
  },
  /**
   * Create a new SSH Key.
   * @param data
   * @param callback
   */
  createSshKey: function (data, callback) {
    doPostRequest('/v1/sshkey/create', data, callback);
  },
  /**
   * Remove a SSH key. Note that this will not remove the key from any machines that already have it.
   * @param data
   * @param callback
   */
  destroySshKey: function (data, callback) {
    doPostRequest('/v1/sshkey/destroy', data, callback);
  },
  /**
   * List all the SSH keys on the current account.
   * @param callback
   */
  getSshKeys: function (callback) {
    doGetRequest('/v1/sshkey/list', callback);
  },
  /**
   * Update an existing SSH Key. Note that this will only update newly installed machines.
   * The key will not be updated on any existing machines.
   * @param data
   * @param callback
   */
  updateSshKey: function (data, callback) {
    doPostRequest('/v1/sshkey/update', data, callback);
  },
  /**
   * Create a startup script.
   * @param data
   * @param callback
   */
  createStartupScript: function (data, callback) {
    doPostRequest('/v1/startupscript/create', data, callback);
  },
  /**
   * Remove a startup script.
   * @param data
   * @param callback
   */
  destroyStartupScript: function (data, callback) {
    doPostRequest('/v1/startupscript/destroy', data, callback);
  },
  /**
   * List all startup scripts on the current account.
   * 'boot' type scripts are executed by the server's operating system on the first boot.
   * 'pxe' type scripts are executed by iPXE when the server itself starts up.
   * @param callback
   */
  getStartupScripts: function (callback) {
    doGetRequest('/v1/startupscript/list', callback);
  },
  /**
   * Update an existing startup script.
   * @param data
   * @param callback
   */
  updateStartupScript: function (data, callback) {
    doPostRequest('/v1/startupscript/update', data, callback);
  },
  /**
   * Create a new user.
   * @param data
   * @param callback
   */
  createUser: function (data, callback) {
    doPostRequest('/v1/user/create', data, callback);
  },
  /**
   * Delete a user.
   * @param data
   * @param callback
   */
  deleteUser: function (data, callback) {
    doPostRequest('/v1/user/delete', data, callback);
  },
  /**
   * Retrieve a list of any users associated with this account.
   * @param callback
   */
  getUsers: function (callback) {
    doGetRequest('/v1/user/list', callback);
  },
  /**
   * Update the details for a user.
   * @param data
   * @param callback
   */
  updateUser: function (data, callback) {
    doPostRequest('/v1/user/update', data, callback);
  }
};
