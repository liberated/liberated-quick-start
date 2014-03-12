/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#ignore(environment)
#ignore(process)
#ignore(JavaAdapter)
*/

qx.Class.define("nodesqlitesync.Application",
{
  extend : qx.application.Basic,

  statics :
  {
    /** The database (and remote procedure call) interface instance */
    dbif : null,

    /**
     * Process a POST request. These are the standard GUI-initiated remote
     * procedure calls.
     *
     * @param request {Packages.javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {Packages.javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    doPost : function(request, response)
    {
      var             dbif=  example.dbif.DbifNodeSqliteSync.getInstance();
      var             rpcResult;

      // Determine the logged-in user
      dbif.identify(request);

      // Process this request
      rpcResult = nodesqlitesync.Application.dbif.processRequest(request.body);

      // Ignore null results, which occur if the request is a notification.
      if (rpcResult !== null)
      {
        // Generate the response.
        response.set("Content-Type", "application/json");
        response.send(rpcResult);
      }
    },


    /**
     * Process a GET request.
     *
     * @param request {Packages.javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {Packages.javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    doGet : function(request, response)
    {
      var             dbif=  example.dbif.DbifNodeSqliteSync.getInstance();
      var             rpcResult;
      
      // Determine the logged-in user
      dbif.identify(request);

      // Process this request
      rpcResult = dbif.processRequest(request.query);

      // Ignore null results, which occur if the request is a notification.
      if (rpcResult !== null)
      {
        // Generate the response.
        response.set("Content-Type", "application/json");
        response.send(rpcResult);
      }
    }
  },

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      var             _this = this;
      var             server;
      var             rpcHandler;
      var             resourceHandler;
      var             express = require("express");
      var             app = express();

      if (qx.core.Environment.get("runtime.name") == "rhino") 
      {
        qx.log.Logger.register(qx.log.appender.RhinoConsole);
      }
      else if (qx.core.Environment.get("runtime.name") == "node.js") 
      {
        qx.log.Logger.register(qx.log.appender.NodeConsole);
      }

      if (window.arguments) 
      {
        try 
        {
          this._argumentsToSettings(process.argv);
        }
        catch(ex) 
        {
          this.error(ex.toString());
          return;
        }
      }


      //
      // Arrange to receive raw data
      //
      app.use(
        function(req, res, next) 
        {
          var data = [];

          req.setEncoding("utf8");

          req.on(
            "data",
            function(chunk) 
            { 
              data.push(chunk);
            });

          req.on(
            "end",
            function() 
            {
              req.body = data.join("");
              next();
            });
        });


      //
      // Remote Procedure Call handler
      //
      
      // Handle a POST request for an RPC
      app.post(
        "/rpc",
        function(req, res)
        {
          var             f;

          // Bind the functions to our application instance to allow them to
          // easily generate log messages.
          f = nodesqlitesync.Application.doPost.bind(_this);
          
          // Call the bound founction
          f(req, res);
        });

      // Handle a GET request for an RPC
      app.get(
        "/rpc",
        function(req, res)
        {
          var             f;

          // Bind the functions to our application instance to allow them to
          // easily generate log messages.
          f = nodesqlitesync.Application.doGet.bind(_this);
          
          // Call the bound founction
          f(req, res);
        });

      //
      // Static File Handler
      //

      // Get static files from our build directory, for now
      app.use(express["static"](__dirname + "/build"));
      
      // Initialize the database and remote procedure call server
      nodesqlitesync.Application.dbif = 
        example.dbif.DbifNodeSqliteSync.getInstance();

      // Begin listening now
      app.listen(8080);
    },

    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param args {String[]} Arguments object
     */
    _argumentsToSettings : function(args)
    {
      var opts;

      for (var i=0, l=args.length; i<l; i++) 
      {
        if (args[i].indexOf("settings=") == 0) 
        {
          opts = args[i].substr(9);
          break;
        }
        else if (args[i].indexOf("'settings=") == 0) 
        {
          opts = /'settings\=(.*?)'/.exec(args[i])[1];
          break;
        }
      }

      if (opts) 
      {
        opts = opts.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
        try 
        {
          opts = JSON.parse(opts);
        } 
        catch(ex)
        {
          var msg =
            ex.toString() + 
            "\nMake sure none of the settings configured" +
            " in simulation-run/environment contain paths with spaces!";
          throw new Error(msg);
        }
        
        for (var prop in opts) 
        {
          var value = opts[prop];
          if (typeof value == "string") 
          {
            value = value.replace(/\$/g, " ");
          }
          try 
          {
            qx.core.Environment.add(prop, value);
          }
          catch(ex) 
          {
            this.error("Unable to define command-line setting " + prop +
                       ": " + ex);
          }
        }
      }
    }
  }
});
