const mysql = require('mysql');

function db (que){
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


   let result = conn.query(que, (err, result, field) =>{


    });


    conn.end( err => {
        if (err) {
            console.log(err);
            return err;
        }
        else {
            console.log('Database ----- Close');
        }
    });

    return result;

}

module.exports = async function (email, password, firstname = '', lastname = '') {
    let query;
    if (!firstname && !lastname){
         query = 'SELECT * FROM `users` WHERE email ='+email;
    }else {
        let preQuery = 'SELECT * FROM `users` WHERE email = '+`'${email}'`;
        let preResult = await db(preQuery);
        console.log(preResult);
        query = 'INSERT INTO `users` '+'(`id`, `email`, `password`, `firstname`, `lastname`, `date`, `blocked`) VALUES '+`(NULL, '${email}', '${password}', '${firstname}', '${lastname}', CURRENT_TIMESTAMP, '0')`;
    }
    //console.log(query);

    return await db(query);

}


