/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("jettysqlite.Application",
{
  extend : qx.application.Basic,

  statics :
  {
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
      if (qx.core.Environment.get("runtime.name") == "rhino") 
      {
        qx.log.Logger.register(qx.log.appender.RhinoConsole);
      }
      else if (qx.core.Environment.get("runtime.name") == "node.js") 
      {
        qx.log.Logger.register(qx.log.appender.NodeConsole);
      }
    }
  },
  
  defer : function()
  {
    window.doPost = jettysqlite.Application.doPost;
    window.doGet = jettysqlite.Application.doGet;
  }
});
