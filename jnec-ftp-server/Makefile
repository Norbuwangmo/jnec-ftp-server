CC = gcc
CFLAGS = -Wall -g -Iinclude
TARGET = ftpserver
SRCDIR = src
OBJDIR = obj

SOURCES = $(wildcard $(SRCDIR)/*.c)
OBJECTS = $(SOURCES:$(SRCDIR)/%.c=$(OBJDIR)/%.o)

$(TARGET): $(OBJECTS)
	@mkdir -p $(OBJDIR)
	$(CC) $(OBJECTS) -o $(TARGET)
	@echo "Build complete: $(TARGET)"

$(OBJDIR)/%.o: $(SRCDIR)/%.c
	@mkdir -p $(OBJDIR)
	$(CC) $(CFLAGS) -c $< -o $@
	@echo "Compiled: $<"

clean:
	rm -rf $(OBJDIR) $(TARGET)
	@echo "Cleaned up"

run: $(TARGET)
	./$(TARGET)

.PHONY: clean run
