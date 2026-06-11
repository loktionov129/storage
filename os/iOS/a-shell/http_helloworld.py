from http.server import BaseHTTPRequestHandler, HTTPServer

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Проверяем, что стучатся именно на /hello
        if self.path == '/hello':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"World")
        else:
            # На любые другие адреса отдаем 404
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

def run():
    # Запускаем локально на порту 8080
    server_address = ('127.0.0.1', 8080)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print("Сервер запущен на http://127.0.0")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен.")
        httpd.server_close()

if __name__ == '__main__':
    run()
