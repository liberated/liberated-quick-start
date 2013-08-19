DESTDIR = deploy/webapps/ROOT/WEB-INF/classes

CLASSES =					\
  $(DESTDIR)/startup/Environment.class		\
  $(DESTDIR)/startup/Main.class			\
  $(DESTDIR)/startup/RpcServlet.class		\
  $(DESTDIR)/startup/GuiServlet.class		\
  $(DESTDIR)/startup/LoginServlet.class


all : $(CLASSES)

clean :
	find $(DESTDIR) -type f -exec rm {} \;

$(DESTDIR)/startup/%.class : startup/%.java
	mkdir -p $(DESTDIR)
	javac -classpath $(shell find deploy/lib			\
			    -name '*.jar' -print0 | tr '\0' ':')	\
	  -d $(DESTDIR)							\
	  $<
