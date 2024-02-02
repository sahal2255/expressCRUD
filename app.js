const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// const session = require('express-session');
// const cookieParser = require('cookie-parser');
const { table } = require('console');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// app.use(cookieParser());
// app.use(session({
//     secret: 'your_secret_key_here',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set secure to true if you're using HTTPS
// }));



// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the views directory for EJS templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Define the readData function to read data from a JSON file
const readData = () => {
    const jsonFilePath = path.join(__dirname, 'data.json');

    try {
        const data = fs.readFileSync(jsonFilePath, 'utf-8');
        return JSON.parse(data)||[];
    } catch (error) {
        console.error('Error reading from JSON file:', error.message);
        return [];
    }
};
app.post('/submit', async (req, res) => {
    try {
        // Read existing data from the JSON file
        const filePath = path.join(__dirname, 'data.json');
        const existingData = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));

        // Add the new form data to the existing data
        const formData = req.body;
        existingData.push(formData);

        // Write the updated data back to the JSON file
        await fs.promises.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');


        // req.session.user = formData;
        // res.cookie('user_id', formData.id, { maxAge: 900000, httpOnly: true });

        res.status(200).send('Form submitted successfully!');
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error submitting form. Please try again.');

    }
    
});

app.get('/table', (req, res) => {
   try{
    const dataArray = readData();
    res.render('table.ejs', { dataArray });
   } catch(error){
    console.error('Error:', error);
    res.status(500).send('Error rendering the table. Please try again.');

   }
});

app.post('/delete', async (req, res) => {
    try {
        const deleteId = req.body.id;
        

        const existingData = readData();

        // Find the index of the element with the matching id
        const deleteIndex = existingData.findIndex(item => item.id === deleteId);

        if (deleteIndex !== -1) {
            // Remove the element at the specified index
            existingData.splice(deleteIndex, 1);

            
            await fs.promises.writeFile('data.json', JSON.stringify(existingData, null, 2), 'utf-8');
            res.redirect('/table')
            
        } else {
            
            res.redirect('/table?error=InvalidDeleteIndex');
        }
    } catch (error) {
        console.error('Error:', error);
        // res.status(500).send('Error deleting row. Please try again.');
        res.redirect('/table?error=DeleteError');
    }
});


app.post('/update/:id', async (req, res) => {
    try {
        // console.log('Update route reached');

        const filePath = path.join(__dirname, 'data.json');
        const existingData = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));

        const editId = req.params.id;
        // console.log('Edit ID:', editId);

        const formData = req.body;
        // console.log('Form Data:', formData);

        const indexToUpdate = existingData.findIndex(item => item.id === editId);
        // console.log('Index to Update:', indexToUpdate);

        if (indexToUpdate !== -1) {
            existingData[indexToUpdate].name = formData.name;
            existingData[indexToUpdate].id = formData.id;
            existingData[indexToUpdate].email = formData.email;
            existingData[indexToUpdate].degree = formData.degree;
            existingData[indexToUpdate].sem = formData.sem;
            existingData[indexToUpdate].grade = formData.grade;

            // console.log('Data to be written:', existingData);

            await fs.promises.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
            // console.log('Data successfully written to file');

            res.redirect('/table');
        } else {
            // console.log('Item not found');
            res.status(404).send('Item not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/edit/:id', (req, res) => {
    const editId = req.params.id;
    const existingData = readData();

    // Find the data with the matching id
    const editData = existingData.find(item => item.id === editId);

    if (editData) {
        res.render('editForm.ejs', { data: editData });
    } else {
        res.status(404).send('Record not found');
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});