import marked from 'marked';
import fs from 'fs/promises';
import path from 'path';

const createFile = async () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    const ejsPath = path.join(__dirname, '..', 'src', 'views', 'home.ejs');
    const readmeContents = await fs.readFile(readmePath, 'utf-8');
    const htmlMarkdown = marked.parse(readmeContents);

    const html = `
    <!DOCTYPE html>
<html>
    <html>
        <head>
            <title>LC Tracker</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossorigin
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap"
                rel="stylesheet"
            />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.4.0/github-markdown-dark.css"
                integrity="sha512-FrKjWblyddw1pNARmY/+wk7GCnd9/fa6ZTnMAdDTVqFfMLBtI45onFdvcLH4j0ohdAVwPCWku7UsGrLzCThM1A=="
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
            />
        </head>
        <body class="markdown-body">
           ${htmlMarkdown}
        </body>
    </html>
</html>

    `;
    console.log(path.join(__dirname, '..', 'src', 'views', 'home.ejs'));
    await fs.writeFile(ejsPath, html, 'utf8');
};
createFile();
