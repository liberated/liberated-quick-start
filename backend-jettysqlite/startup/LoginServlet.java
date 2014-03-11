/*
 * Copyright (c) 2013 Derrell Lipman
 * 
 * License: LGPL: http://www.gnu.org/licenses/lgpl.html EPL :
 * http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * This is the HTTP Servlet for login/logout
 */
package startup;

import java.io.IOException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;


public class LoginServlet extends HttpServlet
{
    @Override
    public void init(ServletConfig config)
    throws ServletException
    {
    	super.init(config);
    }
    
    @Override
    public void doPost(HttpServletRequest request,
                       HttpServletResponse response)
    throws ServletException, IOException
    {
        response.sendError(401, "Not authorized");
    }
    
    @Override
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
    throws ServletException, IOException
    {
        String                  param = request.getParameter("action");
        HttpSession             session = request.getSession(false);
        ServletOutputStream     out = response.getOutputStream();

        if ("status".equals(param))
        {
            out.println("<html>");
            out.println("<br />");
            out.println("user principal: " + request.getUserPrincipal());
            out.println("<br />");
            out.println("remote user: " + request.getRemoteUser());
            out.println("<html>");
            return;
        }
        
        // Log them out first, then redirect to them to the login page
        request.logout();

        if (session)
        {
            session.invalidate();
        }

        response.sendRedirect("/auth.html");
    }
}
