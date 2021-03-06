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

qx.Class.define("jettysqlite.Application",
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
      var             dbif=  example.dbif.DbifJettySqlite.getInstance();
      var             rpcResult;
      var             out;
      var             reader;
      var             line;
      var             input = [];
      var             jsonInput;

      // Determine the logged-in user
      dbif.identify(request);

      // Retrieve the JSON input from the POST request. First, get the input
      // stream (the POST data)
      reader = request.getReader();

      // Read the request data, line by line.
      for (line = reader.readLine(); line != null; line = reader.readLine())
      {
        input.push(String(line));
      }

      // Convert the input lines to a single string
      jsonInput = String(input.join("\n"));

      // Process this request
      rpcResult = jettysqlite.Application.dbif.processRequest(jsonInput);

      // Ignore null results, which occur if the request is a notification.
      if (rpcResult !== null)
      {
        // Generate the response.
        response.setContentType("application/json");
        out = response.getWriter();
        out.println(rpcResult);
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
      var             dbif=  example.dbif.DbifJettySqlite.getInstance();
      var             jsonInput;
      var             rpcResult;
      var             out;
      
      // Determine the logged-in user
      dbif.identify(request);

      // Get the query string
      jsonInput = decodeURIComponent(request.getQueryString());

      // Process this request
      rpcResult = dbif.processRequest(jsonInput);

      // Ignore null results, which occur if the request is a notification.
      if (rpcResult !== null)
      {
        // Generate the response.
        response.setContentType("application/json");
        out = response.getWriter();
        out.println(rpcResult);
      }
    },


    /**
     * Given a Javascript array of objects return a Java array of objects of
     * the given type.  This is used to create Java arrays to send to the
     * Jetty API.
     *
     * @param type {Packages.*}
     *   The Java class of the array being created
     *
     * @param objects {Array}
     *   The JavaScript array being converted to a Java array
     *
     * @return {java.lang.Array}
     *   The Java array which is a copy of provided the JavaScript array
     */
    toJArray : function(type, objects) 
    {
      var jarray = java.lang.reflect.Array.newInstance(type, objects.length);

      for (var i = 0; i < objects.length; ++i) 
      {
        jarray[i] = objects[i];
      }

     return jarray;
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
      var             sslContextFactory;
      var             httpsConfig;
      var             https;
      var             handlers;
      var             handlerList = [];
      var             constraint;
      var             constraintMapping;
      var             securityHandler;
      var             loginService;
      var             authenticator;
      var             logoutHandler;
      var             rpcHandler;
      var             resourceHandler;
      var             Jetty = Packages.org.eclipse.jetty;

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
          this._argumentsToSettings(window.arguments);
        }
        catch(ex) 
        {
          this.error(ex.toString());
          return;
        }
      }

      // Create a Jetty server instance
      server = new Jetty.server.Server();
      

      //
      // Enable SSL
      // See http://www.eclipse.org/jetty/documentation/current/embedded-examples.html#embedded-many-connectors
      // or, with comments: http://git.eclipse.org/c/jetty/org.eclipse.jetty.project.git/tree/examples/embedded/src/main/java/org/eclipse/jetty/embedded/ManyConnectors.java
      //
      sslContextFactory = new Jetty.util.ssl.SslContextFactory();
      sslContextFactory.setKeyStorePath("keystore");
      sslContextFactory.setKeyStorePassword("liberated/jetty");
      
      httpsConfig = new Jetty.server.HttpConfiguration();
      httpsConfig.setSecureScheme("https");
      httpsConfig.setSecurePort(3000);
      httpsConfig.setOutputBufferSize(32768);
      httpsConfig.addCustomizer(new Jetty.server.SecureRequestCustomizer());

      https = new Jetty.server.ServerConnector(
        server,
        new Jetty.server.SslConnectionFactory(sslContextFactory, "http/1.1"),
        new Jetty.server.HttpConnectionFactory(httpsConfig));
      https.setPort(3000);
      https.setIdleTimeout(500000);

      server.setConnectors(
        jettysqlite.Application.toJArray(Jetty.server.Connector, [ https ]));
      

      //
      // Security Handler, for authentication
      // See http://www.eclipse.org/jetty/documentation/current/embedded-examples.html
      //
      constraint = new Jetty.util.security.Constraint();
      constraint.setName("auth");
      constraint.setRoles(
        jettysqlite.Application.toJArray(java.lang.String, 
                                         [ "user", "admin" ]));
      constraint.setAuthenticate(true);
      
      constraintMapping = new Jetty.security.ConstraintMapping();
      constraintMapping.setPathSpec("/*");
      constraintMapping.setConstraint(constraint);
      
      loginService = 
        new Jetty.security.HashLoginService("liberated", "realm.properties");
      loginService.putUser(
        "user",
        new Jetty.util.security.Password("password"),
        jettysqlite.Application.toJArray(java.lang.String, [ "user" ]));
      server.addBean(loginService);
      securityHandler = new Jetty.security.ConstraintSecurityHandler();
      server.setHandler(securityHandler);
      securityHandler.setConstraintMappings(
        jettysqlite.Application.toJArray(
          Jetty.security.ConstraintMapping,
          [ constraintMapping ]));
      securityHandler.setAuthenticator(
//        new Jetty.security.authentication.FormAuthenticator(
//          "/login.html", "/login.html", false));
        new Jetty.security.authentication.BasicAuthenticator());
      securityHandler.setLoginService(loginService);
      securityHandler.setStrict(false);


      // We'll want to register this handler.
      handlerList.push(securityHandler);



/*
      //
      // Logout handler
      //

      // Instantiate a new handler to log out
      logoutHandler = new JavaAdapter(
        Jetty.server.handler.AbstractHandler, 
        {
          handle: function(target, baseRequest, request, response) 
          {
            var             f;
            var             bIsLogout;

            // Is this a logout request?
            bIsLogout =
              target == "/logout" ||
              (target.length >= 8 &&
               (target.substring(0, 8) == "/logout?" ||
                target.substring(0, 8) == "/logout/"));

            if (! bIsLogout)
            {
              // Nope. Let someone else handle it.
              return;
            }

            // Invalidate the session
            request.getSession(false).invalidate();

            // We've handled this request
            baseRequest.setHandled(true);
            
            // Redirect them back to the home page
            response.sendRedirect("/");
          }
        });

      // We'll want to register this handler.
      handlerList.push(logoutHandler);
*/



      //
      // Remote Procedure Call handler
      //

      // Instantiate a new handler to handle RPCs
      rpcHandler = new JavaAdapter(
        Jetty.server.handler.AbstractHandler, 
        {
          handle: function(target, baseRequest, request, response) 
          {
            var             f;
            var             bIsRpc;

            // Is this a remote procedure call request?
            bIsRpc =
              target == "/rpc" ||
              (target.length >= 5 &&
               (target.substring(0, 5) == "/rpc?" &&
                target.substring(0, 5) == "/rpc/"));

            if (! bIsRpc)
            {
              // Nope. Let someone else handle it.
              return;
            }

            // Determine the request method. We currently support POST and GET.
            // Bind the functions to our application instance to allow them to
            // easily generate log messages.
            if (request.getMethod().equals("POST"))
            {
              f = qx.lang.Function.bind(jettysqlite.Application.doPost, _this);
            }
            else if (request.getMethod().equals("GET"))
            {
              f = qx.lang.Function.bind(jettysqlite.Application.doGet, _this);
            }
            else
            {
              print("Unexpected RPC data (not POST or GET)");
              return;
            }

            // Call the appropriate function
            f(request, response);

            // We've handled this request
            baseRequest.setHandled(true);
          }
        });

      // We'll want to register this handler.
      handlerList.push(rpcHandler);



      //
      // Static File Handler
      //

      // Create a resource handler to deal with static file requests
      resourceHandler = new Jetty.server.handler.ResourceHandler();

      // If a request on the root path is received, serve a default file.
      resourceHandler.setWelcomeFiles(
        jettysqlite.Application.toJArray(java.lang.String, [ "index.html" ]));

      // Serve files from our build directory (for now)
      resourceHandler.setResourceBase("./build");

      // We'll want to register this handler.
      handlerList.push(resourceHandler);
      
      securityHandler.setHandler(resourceHandler);
      


      //
      // We have multiple handlers, so we need a handler collection
      //

      // Instantiate a handler collection
      handlers = new Jetty.server.handler.HandlerCollection();

      // Add the two handlers. The RPC handler comes first. If it can't
      // handle the request, then the resource handler will be called.
      handlers.setHandlers(jettysqlite.Application.toJArray(
                             Jetty.server.Handler,
                             handlerList));

      // Now we can set the handlers for our server
      server.setHandler(handlers);

      // Initialize the database and remote procedure call server
      jettysqlite.Application.dbif = example.dbif.DbifJettySqlite.getInstance();

      // Start up the server. We're ready to go!
      server.start();
      server.join();
    },

    /**
     * Converts the value of the "settings" command line option to qx settings.
     *
     * @param args {String[]} Rhino arguments object
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
          opts = qx.lang.Json.parse(opts);
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
