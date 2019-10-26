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

app.get('/random', async function(req, res) {
    // axios でスプレッドシートのURLからCSV形式で取得 foodData
    let foodResponse = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vQg_P87vLW61nngA4KXupPO4cTReuUcfDm4v0KGbocn3uJ0016YMl8NfzELjjwllB4_sg2L2g5pC3ch/pub?gid=0&single=true&output=csv');

    // axios でスプレッドシートのURLからCSV形式で取得 drinkData
    let drinkResponse = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vQg_P87vLW61nngA4KXupPO4cTReuUcfDm4v0KGbocn3uJ0016YMl8NfzELjjwllB4_sg2L2g5pC3ch/pub?gid=1909832428&single=true&output=csv');

    // console.log(foodResponse.data);

    randomList = [];

    // 読み込んだデータをJSONに変換
    const converterFood = csvtojson({
        noheader: false,  // 1行目がヘッダーの場合はfalse
        output: "csv"
    });
    
    const foodJSONData = await converterFood.fromString(foodResponse.data);

    const converterDrink = csvtojson({
        noheader: false,  // 1行目がヘッダーの場合はfalse
        output: "csv"
    });
    const drinkJSONData = await converterDrink.fromString(drinkResponse.data);

    // ランダム取得
    let randFoodID = Math.floor(Math.random() * foodJSONData.length);
    let randFoodData = foodJSONData[randFoodID];
    let randDrinkID = Math.floor(Math.random() * drinkJSONData.length);
    let randDrinkData = drinkJSONData[randDrinkID];

    randomList.push({
        "id": randFoodData[0],
        "name": randFoodData[1],
        "price": randFoodData[2],
        "image": randFoodData[3],
        "oshi_message": randFoodData[4],
        "oshi_image": randFoodData[5],
    });

    randomList.push({
        "id": randDrinkData[0],
        "name": randDrinkData[1],
        "price": randDrinkData[2],
        "image": randDrinkData[3],
        "oshi_message": randDrinkData[4],
        "oshi_image": randDrinkData[5],
    });

    console.log(randomList);

    await res.json(randomList);

});


console.log("server start! (express_server2)");