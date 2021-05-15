var express=require("express");
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override'); 
const ejsMate = require("ejs-mate");
//const campground = require("./models/campground");

app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db=mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,'views'));

app.get("/",function(req,res){
    //res.send("This will be the landing page soon !!!");
    res.render("landing");
});
app.get("/campgrounds",async (req,res)=>{
    const campgrounds= await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

app.get("/makecampground",async (req,res)=>{
    const camp=new Campground({title: "My backyard", description: "cheap"});
    await camp.save();
    res.send(camp);
});

app.get("/campgrounds/new", (req,res)=>{
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", async (req,res)=>{
    const campground= await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
});

app.use(express.urlencoded({extended: true}));

app.get("/campgrounds/:id/edit", async (req,res)=>{
    const campground= await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
});


app.post("/campgrounds", async (req,res)=>{
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect("/campgrounds/${ campground._id }");
});

app.put('/campgrounds/:id', async (req,res)=>{
    const { id } = req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    res.redirect("/campgrounds/${ campground._id }");
});

app.delete('/campgrounds/:id', async (req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

process.env.PORT=3000;
process.env.IP="127.0.0.1";
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server has started !!!");
    console.log ("on port" + process.env.PORT + "and ip" + process.env.IP);
});