qx.Class.define("example.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    /** Our remote procedure call object */
    __rpc : null,

    /** Main program */
    main : function()
    {
      var             mycall;

      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        var             appender;
        appender = qx.log.appender.Native;
        appender = qx.log.appender.Console;
      }

      // Enable simulation in the source version; disable it in the
      // build version (unless qx.debug is specifically set in the config
      // file).
      if (qx.core.Environment.get("qx.debug"))
      {
        // Start the RPC simulator by getting its singleton instance
        this.dbif = example.dbif.DbifSim.getInstance();

        // Select to use the simulated transport
        liberated.sim.remote.MRpc.SIMULATE = true;
      }
      else
      {
        // Use the real transport
        liberated.sim.remote.MRpc.SIMULATE = false;        
      }

      // Prepare to issue remote procedure calls
      this.__rpc = new qx.io.remote.Rpc();
      this.__rpc.setProtocol("2.0");
      this.__rpc.setUrl("/rpc");
      this.__rpc.setServiceName("example");

      // Create the user name label
      var userName = new qx.ui.basic.Label();
      this.getRoot().add(userName, { left: 100, top: 50 });

      // Create a logout button
      var logout = new qx.ui.form.Button("Logout");
      this.getRoot().add(logout, { left : 180, top : 50 });

      // Create a tabview
      var tabView = new qx.ui.tabview.TabView();
      tabView.setWidth(500);
      this.getRoot().add(tabView, { left : 100, top : 100 });

      //
      // Create the tab page to view all counter values
      //
      var pageView = new qx.ui.tabview.Page("View counter values");
      pageView.setLayout(new qx.ui.layout.VBox());
      
      // Create a table model which will contain the counter values
      var tableModel = new qx.ui.table.model.Simple();
      
      // Specify the table column headings and IDs
      tableModel.setColumns([ "ID", "Count" ], [ "id", "count" ]);
      
      // Let the column widths self-adjust
      var custom =
      {
        tableColumnModel : function(obj) 
        {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      // Create table with specified headings and self-adjusting column widths
      var table = new qx.ui.table.Table(tableModel, custom);
      
      // Add the table to the tab page
      pageView.add(table, { flex : 1 });
      
      // When the page appears...
      pageView.addListener(
        "appear",
        function(e)
        {
          // Clear the table
          tableModel.setData([]);
          
          // If there's a request in progress...
          if (mycall)
          {
            // ... then abort it
            this.__rpc.abort(mycall);
          }

          // Issue an RPC to retrieve the current counters and their values
          mycall = this.__rpc.callAsync(
            function(result, ex, id) 
            {
              // This call is complete
              mycall = null;

              // Was there an exception?
              if (ex == null) 
              {
                // Nope. Display the result.
                userName.setValue(result.user);
                tableModel.setDataAsMapArray(result.counters);
                
                // Now that we have the logout URL, make the logout button
                // send us there.
                logout.addListener(
                  "execute",
                  function(e)
                  {
                    location.href = result.logoutUrl;
                  },
                  this);
              } 
              else
              {
                alert("Async(" + id + ") exception: " + ex);
              }
            }, 
            "getCounters");
        },
        this);

      // Add the tab page to the tabview
      tabView.add(pageView);

      var pageIncrement = new qx.ui.tabview.Page("Increment a counter");
      var layout = new qx.ui.layout.Grid(4, 3);
      pageIncrement.setLayout(layout);
      pageIncrement.setPadding(10);

      var labels = ["Counter ID", "Increment by"];
      for (var i = 0; i < labels.length; i++) 
      {
        var label = new qx.ui.basic.Label(labels[i]);
        label.set(
          {
            allowShrinkX: false,
            paddingTop: 3
          });
        pageIncrement.add(label, { row : i, column : 0 });
      }

      var textCounterId = new qx.ui.form.TextField();
      pageIncrement.add(textCounterId, {row : 0, column : 1});
      
      var textIncrementBy = new qx.ui.form.TextField();
      pageIncrement.add(textIncrementBy, {row : 1, column : 1});


      // buttons
      var paneLayout = new qx.ui.layout.HBox();
      paneLayout.set(
        {
          spacing: 4,
          alignX : "right"
        });
      var buttonPane = new qx.ui.container.Composite(paneLayout);
      buttonPane.set(
        {
          paddingTop: 11
        });
      pageIncrement.add(buttonPane, {row:2, column: 0, colSpan: 3});

      var buttonGo = 
        new qx.ui.form.Button("Go!", "icon/22/actions/dialog-apply.png");
      buttonGo.addState("default");
      buttonPane.add(buttonGo);

      buttonGo.addListener(
        "execute",
        function(e)
        {
          // Minimum validation: ensure there's non-empty text in the fields
          var data = textCounterId.getValue();
          if (! data || data.replace(/\s/g, "") == "")
          {
            alert("ID field may not be empty");
            return;
          }

          data = textIncrementBy.getValue();
          if (! data || data.replace(/\s/g, "") == "")
          {
            alert("Increment-by field may not be empty");
            return;
          }

          // If there's a request in progress...
          if (mycall)
          {
            // ... then abort it
            this.__rpc.abort(mycall);
          }

          // Issue an RPC to retrieve the current counters and their values
          mycall = this.__rpc.callAsync(
            function(result, ex, id) 
            {
              // This call is complete
              mycall = null;

              // Was there an exception?
              if (ex == null) 
              {
                // Nope. Display the result.
                tabView.setSelection( [ pageView ] );
              } 
              else
              {
                alert("Async(" + id + ") exception: " + ex);
              }
            }, 
            "increment",
            textCounterId.getValue(),
            Number(textIncrementBy.getValue()));
        },
        this);

      tabView.add(pageIncrement);

/*
      // Create a button
      var button1 = new qx.ui.form.Button("First Button", "example/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {left: 100, top: 50});

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });
*/
    }
  }
});
