module.exports = function(action, email = '', password = '', firstname = '', lastname = '', id = '', hash =''){
    let query=[];
    if (action == 'insert'){
        query.push('SELECT * FROM `users` WHERE email = '+`'${email}'`);
        query.push('INSERT INTO `users` '+'(`id`, `email`, `password`, `firstname`, `lastname`, `date`, `datelog`, `blocked`) VALUES '+`(NULL, '${email}', '${password}', '${firstname}', '${lastname}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '0')`);
    } else if (action == "select"){
        query.push('SELECT * FROM `users` WHERE email = '+`'${email}'`);
        //UPDATE `users` SET `datelog` = '2022-04-12 18:21:13.000000' WHERE `users`.`id` = 1;
        query.push('UPDATE `users` SET `datelog` = CURRENT_TIMESTAMP WHERE `users`.`id` = ');
    }else if (action == "inserthash"){
        query.push('SELECT * FROM `user_hash` WHERE userid = '+`'${id}'`);
        query.push('INSERT INTO `user_hash` '+'(`id`, `userid`, `session_hash`) VALUES '+`(NULL, '${id}', '${hash}')`);
        query.push('UPDATE `user_hash` SET `session_hash` = '+`'${hash}'`+ ' WHERE `userid` = '+`'${id}'`);
    }else if (action == 'selecthash'){
        query.push('SELECT * FROM `users` INNER JOIN `user_hash` ON `users`.`id` = `userid` AND `userid` = '+`'${id}'`)
    }else if (action == 'selectall'){
        query.push('SELECT * FROM `users`');
    }else if(action == "delete"){
        if(typeof (id) == "string"){
            query.push('DELETE FROM `users` WHERE `users`.`id` = ' + `'${id}'`);
            query.push('DELETE FROM `user_hash` WHERE `userid` = ' + `'${id}'`);
        }else {
            id.forEach(function (elem) {
                if (elem != "on") {
                    query.push('DELETE FROM `users` WHERE `users`.`id` = ' + `'${elem}'`);
                    query.push('DELETE FROM `user_hash` WHERE `usersid` = ' + `'${elem}'`);
                }

            })
        }
    }else if(action == "block"){
        if(typeof (id) == "string"){
            query.push('UPDATE `users` SET `blocked` = \'1\' WHERE `users`.`id` ='+`'${id}'`);
        }else {
            id.forEach(function (elem) {
                if (elem != "on") {
                    query.push('UPDATE `users` SET `blocked` = \'1\' WHERE `users`.`id` ='+`'${elem}'`);
                }

            })
        }
    }else if(action == "unblock"){
        if(typeof (id) == "string"){
            query.push('UPDATE `users` SET `blocked` = \'0\' WHERE `users`.`id` ='+`'${id}'`);
        }else {
            id.forEach(function (elem) {
                if (elem != "on") {
                    query.push('UPDATE `users` SET `blocked` = \'0\' WHERE `users`.`id` ='+`'${elem}'`);
                }

            })
        }
    }

    return query;
}