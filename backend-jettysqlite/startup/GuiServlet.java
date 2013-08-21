/*
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
* This is the HTTP Servlet for remote procedure calls.
*/

package startup;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.eclipse.jetty.servlet.DefaultServlet;

public class GuiServlet extends DefaultServlet
{
    // The name of the GUI application script to run
    private String  SCRIPT = "script/example.js";

    /**
     * Process a GET request. This loads the GUI, or redirects to the login
     * page if the user is not yet logged in.
     *
     * @param request {javax.servlet.http.HttpServletRequest}
     *   The object containing the request parameters.
     *
     * @param response {javax.servlet.http.HttpServletResponse}
     *   The object to be used for returning the response.
     */
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws IOException, ServletException
    {
java.lang.System.out.println("GuiServlet: reqeustURI=" + request.getRequestURI());
        // We'll only handle root requests. Pass others on to the superclass
        if (! "/".equals(request.getRequestURI()))
        {
java.lang.System.out.println("passing request to superclass");
            super.doGet(request, response);
            return;
        }
        
java.lang.System.out.println("processing request locally");
        // If the user is logged in, get the requested page.
        if (request.getUserPrincipal() != null)
        {
java.lang.System.out.println("user principal: " + request.getUserPrincipal());
            response.getWriter().println(
                "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" " +
                "        \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">" +
                "<html xmlns=\"http://www.w3.org/1999/xhtml\" " +
                "      xml:lang=\"en\">" +
                "  <head>" +
                "    <meta http-equiv=\"Content-Type\" " +
                "          content=\"text/html; charset=utf-8\" />" +
                "    <link type=\"image/ico\" " +
                "          href=\"/favicon.ico\" rel=\"icon\" />" +
                "    <title>App Inventor Gallery</title>" +
                "    <script type=\"text/javascript\" " +
                "            src=\"" + SCRIPT + "\">" +
                "    </script>" +
                "  </head>" +
                "  <body>" +
                "  </body>" +
                "</html>");
        }
        else
        {
          response.sendRedirect("/login");
        }
    }
}
