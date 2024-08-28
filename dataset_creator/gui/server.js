const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000;
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
    const { method, url } = req
    console.log(method, url)
    let contentPath = path.join(__dirname, url)
    let content
    switch (method) {
        case 'GET':
            switch (url) {
                // Index
                case '/':
                    contentPath = path.join(__dirname, 'index.html')
                    content = fs.readFileSync(contentPath, 'utf-8')
                    res.writeHead(200, { 'Content-Type': 'text/html' })
                    res.end(content)
                    return
                // List of all audios metadata (.json files)
                case '/audiosMetadata':
                    contentPath = path.join(__dirname, '..', 'renders')
                    content = fs.readdirSync(contentPath).filter(file => file.endsWith('.json'))
                    const result = { "content": [] }
                    content.forEach(file => {
                        const filePath = path.join(contentPath, file);
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        const jsonData = JSON.parse(fileContent);
                        jsonData.id = file.slice(0, -5)
                        result.content.push(jsonData);
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify(result), 'utf-8')
                    return
                default:
                    try {
                        // wavs are streamed
                        if (path.extname(url) == '.wav'){
                            contentPath = path.join(__dirname, '..', 'renders', url)
                            const stat = fs.statSync(contentPath);
                            res.writeHead(200, {
                                'Content-Type': 'audio/wav',
                                'Content-Length': stat.size
                            })
                            const readStream = fs.createReadStream(contentPath);
                            readStream.pipe(res);
                            return
                        }
                        // everything else is read from disk
                        content = fs.readFileSync(contentPath)
                        res.writeHead(200, { 'Content-Type': contentType[path.extname(contentPath)] })
                        res.end(content)
                        return
                    } catch (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' })
                        res.end('404 Not Found')
                        return
                    }
            }
        case 'PATCH':
            // Only for changing the prompt of the audio
            let body = ''
            req.on('data', chunk => {
                body += chunk.toString()
            })
            req.on('end', () => {
                contentPath = path.join(__dirname, '..', 'renders', url)
                const currentJSON = fs.readFileSync(contentPath, 'utf-8')
                body = JSON.parse(body)
                let newJSON = JSON.parse(currentJSON)
                newJSON.prompt = body.prompt
                try {
                    fs.writeFileSync(contentPath, JSON.stringify(newJSON), 'utf-8')
                    console.log('Updated', contentPath)
                    res.writeHead(200, { 'Content-Type': 'text/plain' })
                    res.end('PATCH request received')
                    return
                } catch (err) {
                    console.error('Error updating:', err)
                    res.writeHead(500, { 'Content-Type': 'text/plain' })
                    res.end('500 Internal Server Error')
                    return
                }
            })
            break
        case 'DELETE':
            // Remove both the metadata and the audio file
            try {
                contentPath = path.join(__dirname, '..', 'renders', url)
                removeFile(contentPath)
                removeFile(contentPath.slice(0, -5) + '.wav')
                res.writeHead(200, { 'Content-Type': 'text/plain' })
                res.end('DELETE request received')
                return
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Server Error')
                return
            }
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
