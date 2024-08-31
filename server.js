const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/upload', upload.single('aadhaarImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;

    Tesseract.recognize(
        imagePath,
        'eng',
        {
            logger: (m) => console.log(m),
        }
    )
        .then(({ data: { text } }) => {
            const aadhaarInfo = parseAadhaarText(text);
            res.json(aadhaarInfo);
        })
        .catch((error) => {
            console.error('Error processing OCR:', error);
            res.status(500).json({ error: 'Failed to process image' });
        });
});

function parseAadhaarText(text) {

    const nameRegex = /(?:Name|NAME):\s*([A-Za-z\s]+)/i;
    const aadhaarRegex = /(\d{4}\s\d{4}\s\d{4})/;

    const nameMatch = text.match(nameRegex);
    const aadhaarMatch = text.match(aadhaarRegex);

    const name = nameMatch ? nameMatch[1].trim() : 'Name not found';
    const aadhaarNumber = aadhaarMatch ? aadhaarMatch[0].trim() : 'Aadhaar number not found';

    return { name, aadhaarNumber };
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});