const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000;
const rootDir = path.join(__dirname, '..')
const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.wav': 'audio/wav'
}

function removeFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        console.log('Deleted', filePath);
    } catch (err) {
        console.error('Error deleting:', err);
    }
}

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
                    body = JSON.parse(body)
                    currentJSON = fs.readFileSync(filePath, 'utf-8')
                    newJSON = JSON.parse(currentJSON)
                    newJSON.prompt = body.prompt
                    fs.writeFileSync(filePath, JSON.stringify(newJSON), 'utf-8')
                    console.log('Updated', filePath)
                    res.writeHead(200, { 'Content-Type': 'text/plain' })
                    res.end('PATCH request received')
                })
                return
            }

            if (req.method === 'DELETE') {
                removeFile(filePath)
                removeFile(filePath.slice(0, -5) + '.wav')
            }
    
            fs.readFile(filePath, (err, content) => {
    
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' })
                    res.end('500 Internal Server Error')
                    return
                }
    
                res.writeHead(200, { 'Content-Type': contentType[path.extname(filePath)] })
                res.end(content)
            })
        })
    }  
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
