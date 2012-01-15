/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("example.dbif.MSimData",
{
  statics :
  {
    Db : 
    {
      "counter" : 
      {
        "x" : 
        {
          "id" : "x",
          "count" : 23
        },
        
        "y" :
        {
          "id" : "y",
          "count" : 42
        }
      }
    }
  }
});
