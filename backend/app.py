from http.server import BaseHTTPRequestHandler, HTTPServer

HOST = "localhost"
PORT = 8000


class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

        message = "<h1>Hello from Python app.py!</h1>"
        self.wfile.write(message.encode("utf-8"))


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), SimpleHandler)
    print(f"Server running at http://{HOST}:{PORT}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        server.server_close()