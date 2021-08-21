import express from 'express';
import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import libre from 'libreoffice-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

const storage = multer.diskStorage({});

const filterDocx = (req, file, cb)=>{
    var ext = path.extname(file.originalname);
    //console.log(file.mimetype);
    //console.log(ext);
    if(ext!==".docx" && ext!==".doc")
    {
        return cb("File type is not supported");
    }

    cb(null, true);
};

const docUpload = multer({storage: storage, fileFilter: filterDocx});

app.listen(PORT, ()=>{
    console.log("Server running");
});

app.get('/', (req, res)=>{
    //console.log(__dirname);
    //res.render('index');
    res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/', docUpload.single("file"), (req, res)=>{
    //console.log(req.file);
    if(req.file)
    {
        //console.log(req.file.path);
        const file = fs.readFileSync(req.file.path);
        //console.log(file);
        const outPut = Date.now()+"output.pdf";
        libre.convert(file, ".pdf", undefined, (err, done)=>{
            if(err)
            {
                fs.unlinkSync(req.file.path);
                //fs.unlinkSync(outPut);

                res.send("Some error has taken place in conversion process");
            }

            fs.writeFileSync(outPut, done);

            res.download(outPut, (err)=>{
               res.send("Some error taken place during downloading"); 
            });

            fs.unlinkSync(req.file.path);
            //fs.unlinkSync(outPut);
        })
        
    }
    else
    {
        console.log("File not uploaded");
    }
});