const express = require( 'express' );
const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );
const session = require( 'express-session' );
const flash = require( 'express-flash' );

mongoose.connect('mongodb://localhost/users_db', {useNewUrlParser: true});

const {UserModel, validateUser} = require( './models/userModel' );
const app = express();

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.use( flash() );
app.use( express.urlencoded({extended:true}) );
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 20 }
}));

app.get( '/', function( req, res ){
    res.render( 'index' );
});

app.post( '/registration', function( req, res ){
    let valid = true;
    let user = {};

    for(let key in req.body){
        if(!validateUser[key](req.body[key])){
            req.flash('registration', `Please enter a valid ${key}`)
            valid=false;
        }
        user[key]=req.body[key];
    }
    
    if(!valid){
        res.redirect('/')
    }
    
    else{

    bcrypt.hash( req.body.password, 10 )
        .then( encryptedPassword => {
            user['password'] = encryptedPassword;
            console.log(user)
            UserModel
                .create( user )
                .then( result => {
                    req.session['email'] = result.email;
                    res.redirect("/home")
                })
                .catch( err => {
                    req.flash( 'registration', 'That username is already in use!' );
                    res.redirect( '/' );
                });
        });}
});

app.post( '/login', function( req, res ){

    let valid = true

    for(let key in req.body){
        if(!validateUser[key](req.body[key])){
            req.flash('login', `Please enter a valid ${key}`)
            valid=false
        }
    }

    if(!valid){
        res.redirect('/')
    }

    UserModel
        .findByEmail( req.body.email )
        .then( result => {
            console.log( "Result", result );
            if( result === null ){
                throw new Error( "That email is not in our database" );
            }

            bcrypt.compare( req.body.password, result.password )
                .then( flag => {
                    if( !flag ){
                        throw new Error( "Wrong credentials!" );
                    }
                    req.session.email = result.email;

                    res.redirect( '/home' );
                })
                .catch( error => {
                    req.flash( 'login', error.message );
                    res.redirect( '/' );
                }); 
        })
        .catch( error => {
            req.flash( 'login', error.message );
            res.redirect( '/' );
        });
});

app.get('/home', function(req,res){

    if(!req.session.email){
        res.redirect('/')
    }

    else{

    UserModel
    .findByEmail( req.session.email)
    .then(data => {
        res.render('home',{user:data})
    })
    .catch(error => {console.log(error)})
}})

app.get( '/logout', function( request, response ){
    request.session.destroy();
    response.redirect( '/' ); 
});



app.listen( 8181, function(){
    console.log( "Listening in port 8181." );
});