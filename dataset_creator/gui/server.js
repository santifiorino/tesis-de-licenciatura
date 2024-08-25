const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000;
const rootDir = path.join(__dirname, '..')

const server = http.createServer((req, res) => {

    if (req.url === '/') {
        const filePath = path.join(__dirname, 'index.html')
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Server Error')
            }
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content)
        })
    } else if (req.url === '/filenames') {
        const filePath = path.join(rootDir, 'renders')
        fs.readdir(filePath, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Server Error')
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(files), 'utf-8')
        })
    } else {
        const filePath = path.join(rootDir, req.url)
        fs.stat(filePath, (err, stats) => {
        
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                res.end('404 Not Found')
                return
            }

            if (req.method === 'PATCH') {
                let body = ''
                req.on('data', chunk => {
                    body += chunk.toString() // Convert Buffer to string
                })
                req.on('end', () => {
                    console.log('PATCH request received with data:', body)
                    body = JSON.parse(body)
                    currentJSON = fs.readFileSync(filePath, 'utf-8')
                    newJSON = JSON.parse(currentJSON)
                    newJSON.prompt = body.prompt
                    fs.writeFileSync(filePath, JSON.stringify(newJSON), 'utf-8')
                    res.writeHead(200, { 'Content-Type': 'text/plain' })
                    res.end('PATCH request received')
                })
                return
            }
    
            fs.readFile(filePath, (err, content) => {
    
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' })
                    res.end('500 Internal Server Error')
                    return
                }
    
                let contentType = 'text/plain'
                const extname = path.extname(filePath)
                switch (extname) {
                    case '.html':
                        contentType = 'text/html'
                        break
                    case '.css':
                        contentType = 'text/css'
                        break
                    case '.js':
                        contentType = 'text/javascript'
                        break
                    case '.json':
                        contentType = 'application/json'
                        break
                    case '.wav':
                        contentType = 'audio/wav'
                        break
                }
    
                res.writeHead(200, { 'Content-Type': contentType })
                res.end(content)
            })
        })
    }  
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})