This is a complete example application built upon LIBERATED. It demonstrates
using the browser-based simulated backend when the "source" version is
built. Two "build" versions can also be created: one that runs in App Engine,
or the local App Engine emulator; and another that runs under the Jetty web
server, and talks to an SQLite database.

The directory hierarchy use here has been shown to work well for
LIBERATED-based applications. The database interface (dbif) -- i.e., the
definition of the objects which are stored in the database and the remote
procedure calls for accessing them -- are in the "dbif" library. This library
is included by the frontend code, for access by the simulated backend, and is
included by each of the "real" backends, for use in App Engine or
Jetty/SQLite.
