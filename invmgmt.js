var http = require("http");
var express = require('express');
var sqlite = require('sqlite3');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
 
// Running Server Details.
var server = app.listen(5000, function () {
var port = server.address().port
console.log("Connecting at Port :", port)
});

var brk = "<br>"
var bodystart= "<body>";
var bodyend="</body>";
var heading = "<h1> The Souled Store</h1>";
var pgform = "<form action='/'  method='post' name='form1'>";
var pgformend = "</form>";
var basicview = "Enter the SKU : <input type= 'text' name='txtSKU'>";
basicview+=" <input type='submit' name= 'btnSKU' value='submit'> <br>                   ";
basicview+="Enter the Value : <input type= 'text' name='txtInv' width = 10px> <br>";
basicview+="<input type='radio' name='selection' value='Receive'>Receive"
basicview+="<input type='radio' name='selection' value='Transfer'>Transfer";
basicview+="<input type='radio' name='selection' value='Display'>Display <br>";

var html=bodystart+heading+pgform+basicview+pgformend+bodyend;
app.get('/page', function (req, res) {
  res.send(html);
});

var db = new sqlite.Database('ss.db',(e)=>{
  if (e){
    console.log('No connection'+e);
  }
  })


var thesku=theselection=handinv=updatedinv=inventory=handinv='';
var theinv=toupdate=updstmt= msg=Updated=sendhtml='';
var goterror = false;

app.post('/', urlencodedParser, function (req, res){
  thesku = req.body.txtSKU;                 // taking the sku value
  theselection= req.body.selection;         // taking the selection
  theinv = req.body.txtInv;                 //taking the inventory
  
  skustmt = "SELECT SUM(INVWHSE) as childinv FROM CHILDWHSE WHERE SKU = "+thesku;
  updstmt= "UPDATE CHILDWHSE SET INVWHSE = INVWHSE + ? WHERE SKU= ?";

    switch(theselection){
        case 'Receive': inventory = '+' +theinv; 
                    toupdate=[inventory,thesku];
    
        case 'Transfer': inventory = '-' +theinv; 
                    toupdate=[inventory,thesku];
    
        case 'Display': inventory = 'display';break;}

  db.serialize(()=>{
    
    
    
    db.each(skustmt,function(err,row){ 
      handinv = row.childinv;  
      if (handinv == null){
        msg = "SKU "+thesku+ " does not exist";
        goterror = true;
      } 
      else {msg= '<p> Current Inventory for '+thesku +':'+handinv + '</p>';//checking current inhand
        }
      console.log(msg);
      
    });
    
    
    if (inventory = 'display'){
      
      db.each("SELECT UPC as upc, sku as sku, itemdesc as itemdesc FROM CHILDMAST WHERE SKU ="+thesku,(err,row)=>{
        console.log('\nDetails for SKU:\n');
        console.log('    UPC      | SKU  | ITEMDESC   ');
        console.log(row.upc+'|'+row.sku+'|'+row.itemdesc);
      msg = '<p>    UPC      | SKU  | ITEMDESC   </p>';
      Updated = '<p>' + row.upc+'|'+row.sku+'|'+row.itemdesc +'</p>';
    })
    }
    else{
    db.run(updstmt,toupdate,(err)=>{})} // updating the records
    db.each(skustmt,(err,row)=>{ 
      updatedinv = row.childinv;
      if (goterror==true){Updated = '<p> Invalid Entry <p>'}
      else {
        if (inventory!='display')
        {Updated= '<p> Updated Inventory for '+thesku +':'+updatedinv + '</p>';
          console.log(Updated);}}
    
    sendhtml = bodystart+heading+msg+Updated;
    sendhtml += bodyend; 
    res.send(sendhtml);
    db.close();
    
    
  })
    
  })
  
 });
