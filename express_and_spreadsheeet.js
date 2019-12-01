// スプレッドシート読む方
const axios = require('axios');
const csvtojson = require('csvtojson')

// express のほう
var express = require('express');
var app = express();

// public というフォルダに入れられた静的ファイルはそのまま表示
app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 8080);

app.get('/apple', function(req, res) {
  res.send('Apple!!!!\n');
});

app.get('/random', async function(req, res) {

    let basePrice = 1000;  // 1000円スタート
    let allPrice = 0;

    // axios でスプレッドシートのURLからCSV形式で取得 foodData
    let foodResponse = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vQg_P87vLW61nngA4KXupPO4cTReuUcfDm4v0KGbocn3uJ0016YMl8NfzELjjwllB4_sg2L2g5pC3ch/pub?gid=0&single=true&output=csv');

    // axios でスプレッドシートのURLからCSV形式で取得 drinkData
    let drinkResponse = await axios.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vQg_P87vLW61nngA4KXupPO4cTReuUcfDm4v0KGbocn3uJ0016YMl8NfzELjjwllB4_sg2L2g5pC3ch/pub?gid=1909832428&single=true&output=csv');

    // console.log(foodResponse.data);

    responseJSON = {
        allPrice:0,
        list:[]
    };

    // 読み込んだデータをJSONに変換
    let converterFood = csvtojson({
        noheader: false,  // 1行目がヘッダーの場合はfalse
        output: "csv"
    });
    let foodJSONData = await converterFood.fromString(foodResponse.data);

    let converterDrink = csvtojson({
        noheader: false,  // 1行目がヘッダーの場合はfalse
        output: "csv"
    });
    let drinkJSONData = await converterDrink.fromString(drinkResponse.data);

    // sortPrice 価格でソート（配列の中身で細かくソート）
    foodJSONData = sortPrice(foodJSONData);
    drinkJSONData = sortPrice(drinkJSONData);

    // ランダム取得
    let currentItem;
    let _oneitem;
    let firstFoodItem = getBottomPriceRandom( foodJSONData , basePrice );
    // はじめのフードが選択
    // console.log(firstFoodItem.length);
    if(firstFoodItem.length == 1){
        _oneitem = firstFoodItem[0];
        currentItem = {
            "id": _oneitem[0],
            "name": _oneitem[1],
            "price": Number(_oneitem[2]),
            "image": _oneitem[3],
            "oshi_message": _oneitem[4],
            "oshi_image": _oneitem[5],
        }

        // 選択されたメニューぶんベース金額を減らす
        basePrice = basePrice - currentItem.price;
        allPrice = allPrice + currentItem.price;
        console.log("basePrice : " + basePrice);

        // 登録
        responseJSON.list.push(currentItem);
    }
    let firstDrinkItem = getBottomPriceRandom( drinkJSONData , basePrice );
    console.log(firstDrinkItem.length);
    // はじめのドリンクが選択
    if(firstDrinkItem.length == 1){
        _oneitem = firstDrinkItem[0];
        currentItem = {
            "id": _oneitem[0],
            "name": _oneitem[1],
            "price": Number(_oneitem[2]),
            "image": _oneitem[3],
            "oshi_message": _oneitem[4],
            "oshi_image": _oneitem[5],
        }

        // 選択されたメニューぶんベース金額を減らす
        basePrice = basePrice - currentItem.price;
        allPrice = allPrice + currentItem.price;
        console.log("basePrice : " + basePrice);

        // 登録
        responseJSON.list.push(currentItem);
    }

    // 以降繰り返して探す ////////////////////////////////

    // let currentMenuItem = firstFoodItem; // 食べ物オンリー
    let currentMenuItem = foodJSONData.concat(drinkJSONData);  // 食べ物飲み物合わせたやつ

    for( let repeatChoiceCount = 0 ; repeatChoiceCount < 5 ; repeatChoiceCount++ ){
        
        let selectedItem = getBottomPriceRandom( currentMenuItem , basePrice );
        
        console.log("追加せんべろ " + repeatChoiceCount + " 回目");

        if(selectedItem.length == 1){

            console.log("追加せんべろ OK");

            _oneitem = selectedItem[0];
            currentItem = {
                "id": _oneitem[0],
                "name": _oneitem[1],
                "price": Number(_oneitem[2]),
                "image": _oneitem[3],
                "oshi_message": _oneitem[4],
                "oshi_image": _oneitem[5],
            }
    
            // 選択されたメニューぶんベース金額を減らす
            basePrice = basePrice - currentItem.price;
            allPrice = allPrice + currentItem.price;
            console.log("basePrice : " + basePrice);
    
            // 登録
            responseJSON.list.push(currentItem);
        } else {
            console.log("追加せんべろ NG");
        }

    }

    // console.log(randomList);

    responseJSON.allPrice = allPrice;

    // APIの返答
    await res.json(responseJSON);

});

function getBottomPriceRandom(items,base_price){

    console.log(base_price + "円より下回るものを残す");

    let new_items = [];
    let decided_items = [];

    let item_price;
    let item_name;
    let decided_item_price;
    let decided_item_name;

    // base_priceより下回るものを残す
    items.forEach(function(item){
        item_price = Number(item[2]);
        item_name = item[1];
        if(base_price > item_price){
            // console.log("* OK " + item_name);
            new_items.push(item);
        } else {
            // console.log("NG " + item_name);
        }
    });

    // console.log("下回った候補");
    // console.log(new_items);

    // もし 1以上 候補があれば、ランダム取得
    if( new_items.length > 0 ){
        let rand_id = Math.floor(Math.random() * new_items.length);
        decided_item = new_items[rand_id];
        decided_item_price = Number(decided_item[2]);
        decided_item_name = decided_item[1];

        decided_items.push(decided_item);

        console.log("decided_item_price " + decided_item_price);
        console.log("decided_item_name " + decided_item_name);
    }

    console.log("ランダム取得されたもの");
    console.log(decided_items);

    return decided_items;
}

function sortPrice(items){

    items.sort(function(a, b){
        var a_price = Number(a[2]);
        var b_price = Number(b[2]);
        if (a_price < b_price) {
            return -1;
        }
        if (a_price > b_price) {
            return 1;
        }
        return 0;
    });

    return items;
}

console.log("server start! (yoro-hackathon)");