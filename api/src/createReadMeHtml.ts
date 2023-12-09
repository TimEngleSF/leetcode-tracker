import marked from 'marked';
import fs from 'fs/promises';
import path from 'path';

const createFile = async () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    const ejsPath = path.join(__dirname, '..', 'src', 'views', 'home.ejs');
    await fs.access(readmePath);
    const readmeContents = await fs.readFile(readmePath, 'utf-8');
    console.log(readmeContents);
    const markedUp = marked.parse(readmeContents);
    console.log(markedUp);

    const html = `<!DOCTYPE html>
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
                <link rel="stylesheet" href="/css/group-answers.css" />
            </head>
            <body>
                ${markedUp}
            </body>
        </html>
    </html>
    `;
    console.log(path.join(__dirname, '..', 'src', 'views', 'home.ejs'));
    const result = await fs.writeFile(ejsPath, html, 'utf8');

    console.log(result);
};
createFile();
