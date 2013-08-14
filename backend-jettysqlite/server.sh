#!/bin/sh

echo "load(\"$1/script/jettysqlite.js\");" |
  java \
    -Djava.library.path=. \
    -classpath 'jars/*' \
    org.mozilla.javascript.tools.shell.Main
