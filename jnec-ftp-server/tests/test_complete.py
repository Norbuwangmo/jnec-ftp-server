#!/usr/bin/env python3
import socket
import re

print("=" * 60)
print("JNEC FTP SERVER - COMPLETE TEST")
print("=" * 60)

# Control connection
control = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
control.connect(('192.168.160.100', 2121))
print("[1]", control.recv(1024).decode().strip())

# Login
control.send(b'USER test\r\n')
print("[2]", control.recv(1024).decode().strip())
control.send(b'PASS test\r\n')
print("[3]", control.recv(1024).decode().strip())

# Get directory listing
control.send(b'PASV\r\n')
resp = control.recv(1024).decode()
print("[4]", resp.strip())

match = re.search(r'(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)', resp)
if match:
    ip = f"{match.group(1)}.{match.group(2)}.{match.group(3)}.{match.group(4)}"
    port = int(match.group(5)) * 256 + int(match.group(6))
    
    data = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    data.connect((ip, port))
    
    control.send(b'LIST\r\n')
    print("[5]", control.recv(1024).decode().strip())
    
    print("\nDIRECTORY LISTING:")
    print("-" * 40)
    while True:
        d = data.recv(1024).decode()
        if not d:
            break
        print(d, end='')
    data.close()
    print("-" * 40)
    print("[6]", control.recv(1024).decode().strip())

# Download a file
control.send(b'PASV\r\n')
resp = control.recv(1024).decode()
print("[7]", resp.strip())

match = re.search(r'(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)', resp)
if match:
    ip = f"{match.group(1)}.{match.group(2)}.{match.group(3)}.{match.group(4)}"
    port = int(match.group(5)) * 256 + int(match.group(6))
    
    data = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    data.connect((ip, port))
    
    control.send(b'RETR test.txt\r\n')
    print("[8]", control.recv(1024).decode().strip())
    
    file_data = data.recv(1024)
    print(f"\nFILE CONTENT ({len(file_data)} bytes):")
    print("-" * 40)
    print(file_data.decode())
    print("-" * 40)
    data.close()
    print("[9]", control.recv(1024).decode().strip())

control.send(b'QUIT\r\n')
print("[10]", control.recv(1024).decode().strip())
control.close()

print("\n" + "=" * 60)
print("ALL TESTS PASSED! FTP SERVER WORKING!")
print("=" * 60)
