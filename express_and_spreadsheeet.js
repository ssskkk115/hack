// スプレッドシート読む方
const axios = require('axios');
const csvtojson = require('csvtojson')

// express のほう
var express = require('express');
var app = express();

// public というフォルダに入れられた静的ファイルはそのまま表示
app.use(express.static(__dirname + '/public'));

app.listen(8080);

app.get('/apple', function(req, res) {
  res.send('Apple!!!!\n');
});

app.get('/random', function(req, res) {
    
    // axios でスプレッドシートのURLからCSV形式で取得
    axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vQg_P87vLW61nngA4KXupPO4cTReuUcfDm4v0KGbocn3uJ0016YMl8NfzELjjwllB4_sg2L2g5pC3ch/pub?gid=1909832428&single=true&output=csv')
        .then(function (response) {
            // 読み込んだデータをJSONに変換
            csvtojson({
                noheader: false,  // 1行目がヘッダーの場合はfalse
                output: "csv"
            })
                .fromString(response.data)
                .then((csvRow) => {
                    // ランダム取得
                    const rand_len = Math.floor(Math.random() * csvRow.length);
                    const rand_data = csvRow[rand_len];
                    console.log(rand_data[1]);
                    
                    // JSONでかえるようにする
                    var jsonData = { "message":rand_data[1]};

                    res.json(jsonData);
                });
        })
        .catch(function (error) {
            console.log(error);
        })
        .finally(function () {

        });

});


console.log("server start! (express_server2)");