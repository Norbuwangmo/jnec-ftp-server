#include <ctype.h>
#include <stdio.h>	// For printf()
#include <stdlib.h>	// For exit() 
#include <string.h>	// For strlen()
#include <unistd.h>	// For close ()
#include <sys/socket.h>	// For socket(), bind(), listen(), accept()
#include <netinet/in.h>	// For sockaddr_in structure
#include <arpa/inet.h>	// For inet_ntop()
			
#define PORT 2121	// Port number (2121 for testing)
#define BUFFER_SIZE 1024 // Size of message buffer
			 
// Global Variables for PASV mode
int data_socket = -1;
int data_port = 0;

// Welcome message function
void send_welcome(int client_socket) {
	char welcome[] = "220 FTP Server Ready\r\n";
	send(client_socket, welcome, strlen(welcome), 0);
	printf("Sent welcome message\n");
}

void send_response(int client_socket, int code, char *message) {
	char response[BUFFER_SIZE];
	snprintf(response, sizeof(response), "%d %s\r\n", code, message);
	send(client_socket, response, strlen(response), 0);
	printf("Sent: %d %s\n", code, message);
}

void send_directory_listing(int client_socket) {
	char buffer[BUFFER_SIZE];

	// Run 'ls -la' and capture output
	FILE *fp = popen("ls -la", "r");
	if (fp == NULL) {
		send_response(client_socket, 550, "Failed to list directory");
		return;
	}

	while (fgets(buffer, sizeof(buffer), fp) != NULL) {
		send(client_socket, buffer, strlen(buffer), 0);
	}

	pclose(fp);
}

// Function to handle PASV command - creates data connection
void handle_pasv(int client_socket) {
	struct sockaddr_in data_addr;
	socklen_t addr_len = sizeof(data_addr);

	// Close any existing data socket
	if (data_socket != -1) {
		close(data_socket);
		data_socket = -1;
	}

	// Create data socket
	data_socket = socket(AF_INET, SOCK_STREAM, 0);
	if (data_socket < 0) {
		send_response(client_socket, 425, "Can't open data connection");
		return;
	}

	// Allow address reuse
	int opt =1;
	setsockopt(data_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

	// Bind to any available port (OS assign)
	memset(&data_addr, 0, sizeof(data_addr));
	data_addr.sin_family = AF_INET;
	data_addr.sin_addr.s_addr = INADDR_ANY;
	data_addr.sin_port = 0; //OS will assign

	if (bind(data_socket, (struct sockaddr *)&data_addr, sizeof(data_addr)) < 0){
		close(data_socket);
		data_socket, 425, "Can't open data connection";
		data_socket= -1;
		return;
	}

	// Listen for client connection (THIS WAS MISSING!)
    	if (listen(data_socket, 1) < 0) {
        	send_response(client_socket, 425, "Can't open data connection");
       		close(data_socket);
        	data_socket = -1;
        	return;
    	}

	// Get the assigned port
	getsockname(data_socket, (struct sockaddr *)&data_addr, &addr_len);
	data_port = ntohs(data_addr.sin_port);

	// Calculate p1 and p2 for FTP response (port = p1 * 256 + p2)
	int p1 = data_port / 256;
	int p2 = data_port % 256;

	// Send response with IP and port (using your static IP)
	char ip[16] = "192,168,160,100";
	char response[256];
	snprintf(response, sizeof(response), "Entering Passive Mode (%s,%d,%d)", ip,p1, p2);
	send_response(client_socket, 227, response);

	printf("PASV mode: data port = %d (p1=%d, p2=%d)\n", data_port, p1, p2);
}

// Function to handle RETR command - download file from server
void handle_retr(int client_socket, char *filename) {
    	if (data_socket == -1) {
        	send_response(client_socket, 425, "Use PASV first");
       		return;
        }
    
    	// Check if file exists and is readable
    	FILE *file = fopen(filename, "rb");
    	if (file == NULL) {
        	send_response(client_socket, 550, "File not found");
        	return;
    	}
    
    	send_response(client_socket, 150, "Opening data connection");
    
    	// Accept client connection on data socket
    	struct sockaddr_in data_client_addr;
    	socklen_t data_client_len = sizeof(data_client_addr);
    	int data_client_fd = accept(data_socket, (struct sockaddr *)&data_client_addr, &data_client_len);
    
    	if (data_client_fd < 0) {
        	send_response(client_socket, 426, "Data connection failed");
        	fclose(file);
       		return;
    	}
    
    	printf("Starting download: %s\n", filename);
    
    	// Send file contents in chunks
    	char buffer[BUFFER_SIZE];
    	int bytes_read;
    	int total_sent = 0;
    
    	while ((bytes_read = fread(buffer, 1, BUFFER_SIZE, file)) > 0) {
        	send(data_client_fd, buffer, bytes_read, 0);
        	total_sent += bytes_read;
    	}
    
    	printf("Sent %d bytes\n", total_sent);
    
    	// Clean up
    	fclose(file);
    	close(data_client_fd);
    	close(data_socket);
    	data_socket = -1;
    
    	send_response(client_socket, 226, "Transfer complete");
}

// Function to handle STOR command - upload file to server
void handle_stor(int client_socket, char *filename) {
    	if (data_socket == -1) {
        	send_response(client_socket, 425, "Use PASV first");
       		return;
    	}
    
    	// Create file for writing
    	FILE *file = fopen(filename, "wb");
    	if (file == NULL) {
        	send_response(client_socket, 550, "Cannot create file");
        	return;
    	}
    
    	send_response(client_socket, 150, "Opening data connection");
    
    	// Accept client connection on data socket
    	struct sockaddr_in data_client_addr;
    	socklen_t data_client_len = sizeof(data_client_addr);
    	int data_client_fd = accept(data_socket, (struct sockaddr *)&data_client_addr, &data_client_len);
    
    	if (data_client_fd < 0) {
        	send_response(client_socket, 426, "Data connection failed");
        	fclose(file);
       	 	return;
    	}
    
    	printf("Starting upload: %s\n", filename);
    
    	// Receive file contents
    	char buffer[BUFFER_SIZE];
    	int bytes_received;
    	int total_received = 0;
    
    	while ((bytes_received = recv(data_client_fd, buffer, BUFFER_SIZE, 0)) > 0) {
        	fwrite(buffer, 1, bytes_received, file);
        	total_received += bytes_received;
    	}
    
    	printf("Received %d bytes\n", total_received);
    
    	// Clean up
    	fclose(file);
    	close(data_client_fd);
    	close(data_socket);
    	data_socket = -1;
    
    	send_response(client_socket, 226, "Transfer complete");
}


// Main function
int main() {
	int server_socket, client_socket;
	struct sockaddr_in server_addr, client_addr;
	socklen_t client_addr_size = sizeof(client_addr);
	int opt = 1;
	char client_ip[INET_ADDRSTRLEN];

	printf("\n=== FTP SERVER STARTING ===\n");

	// CREATE SOCKET
	server_socket = socket(AF_INET, SOCK_STREAM, 0);
	if (server_socket < 0) {
		perror("Socket");
		return 1;
	}
	printf("[1] Socket created\n");

	// SET SOCKET OPTIONS
	setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
	printf("[2] Socket options set\n");

	// PREPARE SERVER ADDRESS
	server_addr.sin_family = AF_INET;		//IPv4
	server_addr.sin_addr.s_addr = INADDR_ANY;	// Listen on all network interfaces
	server_addr.sin_port = htons(PORT);		// Convert port to network byte order
	printf("[3] Address prepared (port %d) \n", PORT);

	// BIND SOCKET TO PORT
	if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
		perror("bind");
		close(server_socket);
		return 1;
	}
	printf("[4] Bound to port\n");

	// LISTEN FOR CONNECTIONS
	if (listen(server_socket, 5) < 0) {
		perror("listen");
		close(server_socket);
		return 1;
	}
	printf("[5] Listening for connections \n");
	
	printf("\n SERVER RUNNING on port %d\n", PORT);
	printf("Commands: USER, PASS, QUIT, PWD, CWD, LIST\n");
	printf("Press Ctrl+C to stop\n\n");

	// MAIN ACCEPT LOOP
	while (1) {
		printf("\nWaiting for client...\n");

		client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_addr_size);
		if (client_socket < 0) {
			perror("accept");
			continue;
		}

		// Get client IP address
		
		inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, INET_ADDRSTRLEN);
		printf("Client connected from %s:%d\n", client_ip, ntohs(client_addr.sin_port));
		
		// Send welcome message
		send_welcome(client_socket);
		
		// Track current directory for client
		char current_path[256];
		getcwd(current_path, sizeof(current_path));
		printf("Starting path: %s\n", current_path);

		// Keep connection open and read commands
		char buffer[BUFFER_SIZE];
		int logged_in = 0;

		// Command loop
		while (1) {
			memset(buffer, 0, BUFFER_SIZE);
			int bytes = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
			
			if (bytes <= 0) {
				printf("Client disconnected\n");
				break;
			}
		
			 // Remove newline
			 buffer[strcspn(buffer, "\r\n")] = 0;
			 printf("Received: %s\n", buffer);

			 // Parse command
			 char cmd[10] = {0};
			 char arg[256] = {0};
			 sscanf(buffer, "%s %[^\r\n]", cmd, arg);

			 // Convert to uppercase
			 for (int i = 0; cmd[i]; i++) cmd[i] = toupper(cmd[i]);

			 // Handle commands
			 if (strcmp(cmd, "USER") == 0) {
				 send_response(client_socket, 331, "Password required");
			}

			else if (strcmp(cmd, "PASS") == 0) {
				send_response(client_socket, 230, "User logged in");
				logged_in = 1;
		 	}

			else if (strcmp(cmd, "QUIT") == 0) {
				send_response(client_socket, 221, "Goodbye");
				break;
			}

			
 			 else if (strcmp(cmd, "PWD") == 0) {
				char response[BUFFER_SIZE];
				snprintf(response, sizeof(response), "\"%s\"", current_path);
				send_response(client_socket, 257, response);
			}

			else if (strcmp(cmd, "CWD") == 0) {
				if (chdir(arg) == 0) {
					getcwd(current_path, sizeof(current_path));
					send_response(client_socket, 250, "Directory changed");
				}
				else{
					send_response(client_socket, 550, "Failed to change directory");
				}
			}

			else if (strcmp(cmd, "LIST") == 0) {
				if (data_socket == -1) {
					send_response(client_socket, 425, "Use PASV first");
				}
				else {
					send_response(client_socket, 150, "Opening data connection");

					// Accept client connection on data socket
					struct sockaddr_in data_client_addr;
					socklen_t data_client_len = sizeof(data_client_addr);
					int data_client_fd = accept(data_socket, (struct sockaddr *)&data_client_addr, &data_client_len);

					if (data_client_fd >= 0) {
						send_directory_listing(data_client_fd);
						close(data_client_fd);
					}

					close(data_socket);
					data_socket = -1;
					send_response(client_socket, 226, "Transfer complete");
				}
			}

			else if (strcmp(cmd, "PASV") == 0) {
				handle_pasv(client_socket);
			}

			else if (strcmp(cmd, "RETR") == 0) {
			 	handle_retr(client_socket, arg);
			}

			else if (strcmp(cmd, "STOR") == 0) {
			 	handle_stor(client_socket, arg);
			}

			else if (strcmp(cmd, "TYPE") == 0) {
   				 send_response(client_socket, 200, "Type set to Binary");
			}
			else if (strcmp(cmd, "PORT") == 0) {
    				send_response(client_socket, 200, "PORT command successful");
			}
			else if (strcmp(cmd, "EPSV") == 0) {
    				send_response(client_socket, 229, "Entering Extended Passive Mode (|||)");
			}
			else if (strcmp(cmd, "FEAT") == 0) {
    				send_response(client_socket, 211, "Features supported:");
    				send(client_socket, " PASV\r\n", 7, 0);
    				send(client_socket, " TYPE\r\n", 7, 0);
    				send_response(client_socket, 211, "End");
			}	

			else {
				send_response(client_socket, 502, "Command not implemented");
			}
		}

		// Close connection 
		close(client_socket);
		printf("Connection closed\n");

	close(server_socket);
	return 0;
	
	}
}
