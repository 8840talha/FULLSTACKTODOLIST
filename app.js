var express = require('express');
var app = express();

var mongoose = require('mongoose');



var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));
// connecting mongoose
mongoose.connect("mongodb+srv://todo:todo@123@cluster0-gakn1.mongodb.net/todolistDB", { useNewUrlParser: true });
// Schema for items to be inserted to todolist
var schema = {

    name: String

};
// mongoose model for items collection
var Item = mongoose.model("Item", schema);

var item1 = new Item({
    name: "Welcome To your Todolist"

});
var item2 = new Item({
    name: "Click To Add"

});
var item3 = new Item({
    name: "Click CheckBox To Delete"

});
var defaultarr = [item1, item2, item3];
// Schema  for the custom page of todolist 
var listSchema = {
    name: String,
    items: [schema]
};
// mongoose model for lists collection
var List = mongoose.model("List", listSchema);
app.set('view engine', 'ejs');



app.get('/', (req, res) => {

    Item.find({}, function (err, founditems) {
        if (founditems.length === 0) {
            Item.insertMany(defaultarr, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Save Successful");
                }
            });
            res.redirect('/');
        } else {

            res.render('list', { title: "TODAY", todos: founditems });


        }
    });
});
app.engine('ejs', require('ejs').__express);

// posting data to todolist by retrieving it from database
app.post('/', function (req, res) {
    var newitem = req.body.addtask;
    var title = req.body.header;

    var item = new Item({
        name: newitem
    });
    if (title === "Today") {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: title }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + title);
        });
    }
});
// deleting elements from the DB
app.post('/delete', function (req, res) {
    var RemoveId = req.body.checkbox;
    var ListName = req.body.listName;
    if (ListName === "Today") {
        Item.findByIdAndRemove(RemoveId, function (err) {
            if (!err) {
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: ListName }, { $pull: { items: { _id: RemoveId } } }, function (err, foundList) {
            if (!err) {
                res.redirect('/' + ListName);
            }
        });
    }
});

// Creatig the custom todolist by rendering the same page with different parameters
app.get('/:customListName', function (req, res) {
    var routeName = req.params.customListName;


    List.findOne({ name: routeName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //   create new list
                var list = new List({
                    name: routeName,
                    items: defaultarr
                });
                list.save();
                res.redirect("/" + routeName);
            } else {
                //   show existing list

                res.render('list', { title: foundList.name, todos: foundList.items });
            }
        }
    });


});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(port, function () {
    console.log('Server started');
});
