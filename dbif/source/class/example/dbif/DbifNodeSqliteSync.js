/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("example.dbif.DbifNodeSqliteSync",
{
  extend  : liberated.node.SqliteSyncDbif,
  type    : "singleton",

  include : 
  [
    example.dbif.MDbifCommon
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Prepare for remote procedure calls
    this.__rpc = new liberated.node.Rpc("/rpc");
  },
  
  members :
  {
    /** The remote procedure call instance */
    __rpc : null,

    /**
     * Register a service name and function.
     *
     * @param serviceName {String}
     *   The fully-qualified name of this service
     *
     * @param fService {Function}
     *   The function which implements the given service name.
     * 
     * @param paramNames {Array}
     *   The names of the formal parameters, in order.
     */
    registerService : function(serviceName, fService, paramNames)
    {
      // Register with the RPC provider
      this.__rpc.registerService(serviceName, fService, this, paramNames);
    },

    /**
     * Process an incoming request which is presumably a JSON-RPC request.
     * 
     * @param jsonData {String}
     *   The data provide in a POST request
     * 
     * @return {String}
     *   Upon success, the JSON-encoded result of the RPC request is returned.
     *   Otherwise, null is returned.
     */
    processRequest : function(jsonData)
    {
      return this.__rpc.processRequest(jsonData);
    },
    

    /*
     * Identify the current user. 
     */
    identify : function(request)
    {
      var             principal;
      var             user;
      var             bAdmin;
      
      // Save the request object in case it's needed for any RPCs
      this.setHttpRequest(request);

/*
      // Find out who is logged in
      principal = request.getUserPrincipal();
      user = principal.getName();
*/
      
      // If no one is logged in...
      if (! user)
      {
        this.setWhoAmI(
          {
            user              : "anonymous",
            userId            : "",
            isAdmin           : false
          });
        return;
      }

      // Specify who we are
      this.setWhoAmI(
        {
          user              : user,
          userId            : "no name",
          isAdmin           : false
        });
    }
  },

  defer : function()
  {
    // Register the selected database interface entry points
    liberated.dbif.Entity.registerDatabaseProvider(
      liberated.node.SqliteSyncDbif.query,
      liberated.node.SqliteSyncDbif.put,
      liberated.node.SqliteSyncDbif.remove,
      liberated.node.SqliteSyncDbif.getBlob,
      liberated.node.SqliteSyncDbif.putBlob,
      liberated.node.SqliteSyncDbif.removeBlob,
      liberated.node.SqliteSyncDbif.beginTransaction,
      { 
        dbif        : "nodesqlite"
      });
    
    // Initialize the database
    liberated.node.SqliteSyncDbif.init("/tmp/example.db");
  }
});
