/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("example.dbif.DbifSim",
{
  extend  : liberated.sim.Dbif,
  type    : "singleton",

  include : 
  [
    example.dbif.MDbifCommon,
    example.dbif.MSimData
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Prepare for remote procedure calls to
    this.__rpc = new liberated.sim.Rpc("/rpc");
        
    // Save the logged-in user. The whoAmI property is in MDbifCommon.
    this.setWhoAmI(
      {
        email             : "jarjar@binks.org",
        userId            : "obnoxious",
        isAdmin           : true
      });
  },
  
  members :
  {
    __rpc : null,

    /**
     * Register a service name and function.
     *
     * @param serviceName {String}
     *   The name of this service within the <[rpcKey]> namespace.
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
    }
  },
  
  defer : function()
  {
    // Retrieve the database from Web Storage, if such exists.
    if (typeof window.localStorage !== "undefined")
    {
      if (typeof localStorage.simDB == "string")
      {
        qx.Bootstrap.debug("Reading DB from Web Storage");
        liberated.sim.Dbif.setDb(qx.lang.Json.parse(localStorage.simDB));
      }
      else
      {
        // No database yet stored. Retrieve the database from the MSimData mixin
        qx.Bootstrap.debug("No database yet. Using new SIM database.");
        liberated.sim.Dbif.setDb(example.dbif.MSimData.Db);
      }
    }
    else
    {
      // Retrieve the database from the MSimData mixin
      qx.Bootstrap.debug("No Web Storage available. Using new SIM database.");
      liberated.sim.Dbif.setDb(example.dbif.MSimData.Db);
    }
    
    // Register our put & query functions
    liberated.dbif.Entity.registerDatabaseProvider(
      liberated.sim.Dbif.query,
      liberated.sim.Dbif.put,
      liberated.sim.Dbif.remove,
      liberated.sim.Dbif.getBlob,
      liberated.sim.Dbif.putBlob,
      liberated.sim.Dbif.removeBlob,
      liberated.sim.Dbif.beginTransaction,
      { 
        dbif        : "sim"
      });
  }
});
