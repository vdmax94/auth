const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const queryBuild = require("./app/querybiuld");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');


const app = express();
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "webauth",
    password: "root",
    port: 8889,
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

conn.connect(function (err) {
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else {
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
    const cookies = req.cookies;
    //console.log(cookies.id);
    if (cookies.id) {
        res.redirect('/list');
    } else {
        res.render('index', {errmess: null, firstname: null, lastname: null, email: null, auth: 1, err2: null});
    }
});

app.get('/list', (req, res)=> {
    const cookies = req.cookies;
    //console.log(cookies);
    if (!cookies.id) {
        res.redirect("/");
    } else {
        const hashCookies = String(cookies.id + cookies.name);
        if (bcrypt.compareSync(hashCookies, cookies.hash)) {
            const hash = cookies.hash;
            const action = "selecthash";
            const query = queryBuild(action, '', '', '', '', cookies.id, '');
            //console.log(query)
            conn.query(query[0], (err, result, field) => {
                //console.log(!result.length);
                if (!result.length) {
                    res.clearCookie('id');
                    res.clearCookie('name');
                    res.clearCookie('hash');

                    res.redirect('/');
                }else if (result[0]['session_hash'] == hash) {
                    const user = {
                        id: result[0]['id'],
                        email: result[0]['email'],
                        password: result[0]['password'],
                        firstname: result[0]['firstname'],
                        lastname: result[0]['lastname'],
                        date: result[0]['date'],
                        datelog: result[0]['datelog'],
                        blocked: result[0]['blocked']
                    }

                    // console.log(user);

                    if (user.blocked) {
                        let err2 = `Your account ${user.email} is blocked`;
                        res.render("index", {email: null, firstname: null, lastname: null, err2, auth: 1});
                    } else {
                        const action = 'selectall';
                        const query = queryBuild(action,'','','','','','');
                        conn.query(query[0], (err, result, field) =>{
                            const users = result;
                            res.render("list", {user, users});
                        });

                    }

                }
            });
        }
    }
})

app.get('/registration', (req, res) => {
    res.render('registration',{error: null, firstname: null, lastname: null, errmess: null});
});

app.post("/", (req,res)=> {
    const action = 'select';
    const {email, password} = req.body;
    const querylog = queryBuild(action,email,password);
    conn.query(querylog[0], (err, result, field) =>{
        if (!result.length){
            res.render("index", {email, firstname: null, lastname: null, err2: null, auth:null});
        }else{
            const user = {
                id: result[0]['id'],
                email: result[0]['email'],
                password: result[0]['password'],
                firstname: result[0]['firstname'],
                lastname: result[0]['lastname'],
                date: result[0]['date'],
                datelog: result[0]['datelog'],
                blocked: result[0]['blocked']
            }

            if(user.blocked){
                let err2 = `Your account ${user.email} is blocked`;
                res.render("index", {email: null, firstname: null, lastname: null, err2, auth:1});
            }else{
                if(!bcrypt.compareSync(String(password), user.password)){
                    let err2 = `Your entered non correct password for account ${email}`;
                    res.render("index", {email: null, firstname: null, lastname: null, err2, auth:1});
                }else{
                    //console.log(querylog[1]+`'${user.id}'`);
                    conn.query(querylog[1]+`'${user.id}'`, (err, result3, field) => {
                    });
                    const userid = bcrypt.hashSync(String(user.id+user.firstname),10)
                    const action = "inserthash";
                    res.cookie('id', user.id);
                    res.cookie('name', user.firstname);
                    res.cookie('hash', userid);
                    const query = queryBuild(action, '', '', '', '', user.id, userid);
                    conn.query(query[0], (err, result, field) =>{
                        if(result.length > 0){
                            conn.query(query[2], (err, result2, field) =>{
                            });
                        }else {
                            conn.query(query[1], (err, result3, field) => {
                            });
                        }
                        res.redirect("/list");
                    });
                }
            }
        }
    });
})

app.post("/registration", (req,res)=> {
    const action = 'insert';
    const {email, password, firstname, lastname} = req.body;
    const query = queryBuild(action, email, bcrypt.hashSync(String(password),10), firstname, lastname);
    conn.query(query[0], (err, result, field) =>{
            if(result.length>0){
                let error = "The email is registered. Enter another email!";
                res.render("registration", {errmess: null, error, firstname, lastname});
            }else{
                conn.query(query[1], (err2, result2, field2) =>{
                    if(err2) {
                        console.log(err2)
                        let errmess = err2.sqlMessage;
                        res.render("registration", {errmess, firstname, lastname, email, error: null});
                    }else{
                        res.render("index", {email, firstname, lastname, err2: null, auth: 1});
                    }
                });
            }
    });

})

app.post("/logout", (req,res)=> {
    res.clearCookie('id');
    res.clearCookie('name');
    res.clearCookie('hash');

    res.redirect('/');

})

app.post("/action", (req,res)=> {

    if (req.cookies.id) {
        const query=queryBuild('inserthash','','','','',req.cookies.id,'')
        conn.query(query[0], (err, result, field) =>{
            if(!result.length){
                res.clearCookie('id');
                res.clearCookie('name');
                res.clearCookie('hash');

                res.redirect('/');
            }else if (result[0]['session_hash'] == req.cookies.hash){
                //console.log(result[0]);
                const que = "SELECT * FROM `users` WHERE `id` = "+result[0]['userid'];
                conn.query(que, (err, result, field) =>{
                    if (result[0]['blocked'] == 1){
                        let err2 = `Your account ${result[0]['email']} is blocked`;
                        res.render("index", {email: null, firstname: null, lastname: null, err2, auth: 1});
                    }else{
                        //console.log(req.body);
                        const action = req.body.action;
                        const query = queryBuild(action, "", "", "", "", req.body.id, "");
                        //console.log(query);
                        query.forEach(function (elem) {
                            conn.query(elem, (err, result, field) => {

                            });
                            if (action == "delete" && req.body.id == req.cookies.id) {
                                res.clearCookie('id');
                                res.clearCookie('name');
                                res.clearCookie('hash');

                                //res.redirect('/');
                            }
                        })

                        if (action == "delete" && req.body.id == req.cookies.id) {
                            res.clearCookie('id');
                            res.clearCookie('name');
                            res.clearCookie('hash');

                            res.redirect('/');
                        } else {
                            res.redirect('/list');
                        }
                    }

                });
            }
        });
    }else{
        res.redirect('/');
    }


})

app.get ('/action', (req,res) => {
    res.redirect('/');
});
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});
