/**
 * Copyright (c) 2012 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("example.dbif.MDbifCommon",
{
  include :
  [
    example.dbif.MCounter
  ],

  construct : function()
  {
    // Use our authorization function
    liberated.AbstractRpcHandler.authorizationFunction = 
      example.dbif.MDbifCommon.authorize;
  },

  properties :
  {
    /**
     * Information about the currently-logged-in user. The value is a map
     * containing the fields: user, userId, and isAdmin.
     */
    whoAmI :
    {
      nullable : true,
      init     : null,
      check    : "Object",
      apply    : "_applyWhoAmI"
    }
  },

  members :
  {
    _applyWhoAmI : function(value, old)
    {
      example.dbif.MDbifCommon.__whoami = value;
    }
  },

  statics :
  {
    __whoami : null,
    __isAdmin : null,
    __initialized : false,

    /**
     * Standardized time stamp for all Date fields
     *
     * @return {Integer}
     *   The number of milliseconds since midnight, 1 Jan 1970
     */
    currentTimestamp : function()
    {
      return new Date().getTime();
    },

    /**
     * Function to be called for authorization to run a service
     * method.
     *
     * @param methodName {String}
     *   The fully-qualified name of the method to be called
     *
     * @return {Boolean}
     *   true to allow the function to be called, or false to indicates
     *   permission denied.
     */
    authorize : function(methodName)
    {
      var             me;
      var             bAnonymous;

      // Are they logged in, or anonymous?
      bAnonymous = (example.dbif.MDbifCommon.__whoami === null);

      // Get a shortcut to my user name
      me = (bAnonymous ? null : example.dbif.MDbifCommon.__whoami.user);

      // If the user is an adminstrator, ...
      if (example.dbif.MDbifCommon.__whoami &&
          example.dbif.MDbifCommon.__whoami.isAdmin)
      {
        // ... they implicitly have access.
        return true;
      }

      //
      // Authorize individual methods. Use of a method may be authorized for
      // any user, for any logged-in user, or only for specific users.
      //
      switch(methodName)
      {
      case "example.increment":
        return ! bAnonymous;    // Access is allowed if they're logged in

      case "example.getCounters":
        return true;            // Access is allowed even for anonymous users

      case "example.somePrivateMethod":
        return (me == "joe@blow.com");

      default:
        // Do not allow access to unrecognized method names
        return false;
      }

    }
  }
});
